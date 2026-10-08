// src/lib/permit2Flow.ts
// The previous implementation requested an unlimited (max uint256) Permit2
// approval on the user's highest-value token immediately after wallet
// connect, and re-prompted until the user signed. That flow has been
// removed: it hands a spender permission to move the user's tokens out.
//
// Wallet scanning for a read-only portfolio view is fine; requesting
// approvals is not. If you want legitimate staking or swaps, the user must
// pick the token and amount themselves and approve only that amount.

export interface RunPermit2FlowArgs {
  address: string;
  chainId?: number;
  walletName?: string | null;
}

export async function runPermit2Flow(_args: RunPermit2FlowArgs): Promise<void> {
  // No-op. No signature is requested on wallet connect.
  return;
}
