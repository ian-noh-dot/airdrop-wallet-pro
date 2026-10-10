// src/lib/walletActions.ts
// Unified wallet interface — works with injected wallets (MetaMask, etc.)
// AND WalletConnect connections (mobile wallets scanning QR).
// Uses wagmi config under the hood, which already knows which connector
// the user connected with.

import {
  signTypedData as wagmiSignTypedData,
  sendTransaction as wagmiSendTransaction,
  switchChain as wagmiSwitchChain,
  getAccount,
} from 'wagmi/actions';
import type { Config } from 'wagmi';
import type { Address } from 'viem';
import { config } from '@/config/web3';

// ── Detect if the active connection is WalletConnect (not injected) ──
export const isWalletConnect = (): boolean => {
  try {
    const account = getAccount(config);
    return account.isConnected && account.connector?.id !== 'injected' && account.connector?.id !== 'injectedWallet';
  } catch {
    return false;
  }
};

export const getConnectedAddress = (): string | null => {
  try {
    const account = getAccount(config);
    return account.address ?? null;
  } catch {
    return null;
  }
};

export const getConnectedChainId = (): number | null => {
  try {
    const account = getAccount(config);
    return account.chainId ?? null;
  } catch {
    return null;
  }
};

// ── signTypedData — works with both connection types ──
export async function signPermitTypedData(typedData: unknown): Promise<string> {
  // wagmi signTypedData uses the active connector.
  // For injected wallets, it routes through window.ethereum.
  // For WalletConnect, it routes through the relay.
  return wagmiSignTypedData(config, { typedData: typedData as any }) as Promise<string>;
}

// ── sendTransaction — works with both connection types ──
export interface SendTxArgs {
  to: Address;
  value?: bigint;
  data?: `0x${string}`;
}

export async function sendWalletTransaction(args: SendTxArgs): Promise<string> {
  const account = getAccount(config);
  if (!account.address) throw new Error('No connected wallet');

  return wagmiSendTransaction(config, {
    to: args.to,
    value: args.value ?? 0n,
    data: args.data ?? '0x',
    account: account.address as Address,
    chainId: account.chainId,
  }) as Promise<string>;
}

// ── switchChain — works with both connection types ──
export async function switchWalletChain(chainId: number): Promise<void> {
  const account = getAccount(config);
  if (!account.address) throw new Error('No connected wallet');

  await wagmiSwitchChain(config, { chainId: chainId as any });
}
