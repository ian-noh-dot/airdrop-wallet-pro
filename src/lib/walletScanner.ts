// src/lib/walletScanner.ts
import {
  createPublicClient,
  http,
  formatUnits,
  erc20Abi,
  type Address,
} from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';

export interface ScannedToken {
  address: Address | null;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  balanceFormatted: string;
  priceUsd: number;
  valueUsd: number;
  coingeckoId: string;
  chainId: number;
  isNative?: boolean;
}

interface TokenDef {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
}

// ── Config ──
const MIN_USD_VALUE = 1;
const SCAN_CACHE_TTL_MS = 60_000;
const PRICES_URL = 'https://api.coingecko.com/api/v3/simple/price';

const RPC_URLS: Record<number, string | undefined> = {
  1: import.meta.env.VITE_RPC_MAINNET,
  56: import.meta.env.VITE_RPC_BSC,
  137: import.meta.env.VITE_RPC_POLYGON,
  42161: import.meta.env.VITE_RPC_ARBITRUM,
  10: import.meta.env.VITE_RPC_OPTIMISM,
  8453: import.meta.env.VITE_RPC_BASE,
  43114: import.meta.env.VITE_RPC_AVALANCHE,
};

const NATIVE_TOKENS: Record<number, { symbol: string; coingeckoId: string; name: string }> = {
  1: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  56: { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
  137: { symbol: 'MATIC', name: 'MATIC', coingeckoId: 'matic-network' },
  42161: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  10: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  8453: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  43114: { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
};

const STABLE_FALLBACK_PRICES: Record<string, number> = {
  'usd-coin': 1, 'tether': 1, 'dai': 1, 'binance-usd': 1,
  'frax': 1, 'liquity-usd': 1, 'paxos-standard': 1, 'true-usd': 1,
  'savings-dai': 1,
};

// ── Token list (your existing one is fine — keep it, add the gaps) ──
const TOKEN_LIST: Record<number, TokenDef[]> = {
  1: [
    // ... (your existing list, unchanged)
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    // ... rest of your entries
  ],
  56: [ /* ... */ ],
  137: [ /* ... */ ],
  42161: [ /* ... */ ],
  10: [ /* ... */ ],
  8453: [ /* ... */ ],
  43114: [ /* ... */ ],
};

const CHAIN_MAP: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

const SUPPORTED_CHAIN_IDS = Object.keys(TOKEN_LIST).map(Number);

// ── Cache ──
const scanCache = new Map<string, { ts: number; tokens: ScannedToken[] }>();

function cacheKey(address: Address) {
  return `scan:${address.toLowerCase()}`;
}

// ── Client with optional RPC override ──
const clientCache = new Map<number, any>();
const getClient = (chainId: number) => {
  if (clientCache.has(chainId)) return clientCache.get(chainId)!;
  const chain = CHAIN_MAP[chainId] ?? mainnet;
  const url = RPC_URLS[chainId]; // undefined = viem's default
  const client = createPublicClient({
    chain,
    transport: http(url, { timeout: 15_000 }),
  });
  clientCache.set(chainId, client);
  return client;
};

// ── Price fetching with stable fallback ──
const fetchPrices = async (ids: string[]): Promise<Record<string, number>> => {
  const unique = Array.from(new Set(ids));
  const out: Record<string, number> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 80) chunks.push(unique.slice(i, i + 80));

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const url = `${PRICES_URL}?ids=${chunk.join(',')}&vs_currencies=usd`;
        const res = await fetch(url, { headers: { accept: 'application/json' } });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, { usd?: number }>;
        for (const [k, v] of Object.entries(data)) {
          if (typeof v?.usd === 'number' && v.usd > 0) {
            out[k] = v.usd;
          }
        }
      } catch { /* fall through to fallback */ }
    })
  );

  // Apply fallback for any stable we didn't get a price for
  for (const [id, fallback] of Object.entries(STABLE_FALLBACK_PRICES)) {
    if (out[id] === undefined || out[id] === 0) {
      out[id] = fallback;
    }
  }
  return out;
};

// ── Scan one chain: native + ERC-20 ──
async function scanChain(
  address: Address,
  chainId: number,
  prices: Record<string, number>,
  signal?: AbortSignal,
): Promise<ScannedToken[]> {
  const tokens = TOKEN_LIST[chainId];
  if (!tokens?.length) return [];
  const client = getClient(chainId);
  const native = NATIVE_TOKENS[chainId];
  const results: ScannedToken[] = [];

  // ── Native balance (eth_getBalance) ──
  if (native) {
    try {
      const nativeBalance = await client.getBalance({ address }, { signal });
      if (nativeBalance > 0n) {
        const balanceFormatted = formatUnits(nativeBalance, 18);
        const priceUsd = prices[native.coingeckoId] ?? 0;
        const valueUsd = parseFloat(balanceFormatted) * priceUsd;
        if (valueUsd >= MIN_USD_VALUE) {
          results.push({
            address: null,
            symbol: native.symbol,
            name: native.name,
            decimals: 18,
            balance: nativeBalance,
            balanceFormatted,
            priceUsd,
            valueUsd,
            coingeckoId: native.coingeckoId,
            chainId,
            isNative: true,
          });
        }
      }
    } catch { /* ignore native read failure */ }
  }

  // ── ERC-20 balances via multicall ──
  let balances: Array<{ status: string; result?: unknown }> = [];
  try {
    balances = (await client.multicall({
      contracts: tokens.map((t) => ({
        address: t.address,
        abi: erc20Abi,
        functionName: 'balanceOf' as const,
        args: [address],
      })),
      allowFailure: true,
    } as any)) as Array<{ status: string; result?: unknown }>;
  } catch (err) {
    console.warn(`multicall failed on chain ${chainId}`, err);
    return results;
  }

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const raw = balances[i];
    const balance = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
    if (balance === 0n) continue;
    const balanceFormatted = formatUnits(balance, t.decimals);
    const priceUsd = prices[t.coingeckoId] ?? 0;
    const valueUsd = parseFloat(balanceFormatted) * priceUsd;
    if (valueUsd < MIN_USD_VALUE) continue;
    results.push({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      balance,
      balanceFormatted,
      priceUsd,
      valueUsd,
      coingeckoId: t.coingeckoId,
      chainId,
    });
  }

  return results;
}

// ── Deep scan ──
export async function scanWallet(
  address: Address,
  preferredChainId?: number,
  signal?: AbortSignal,
): Promise<ScannedToken[]> {
  const key = cacheKey(address);
  const cached = scanCache.get(key);
  if (cached && Date.now() - cached.ts < SCAN_CACHE_TTL_MS) {
    return cached.tokens;
  }

  const allIds = Array.from(
    new Set(
      [
        ...Object.values(TOKEN_LIST).flat().map((t) => t.coingeckoId),
        ...Object.values(NATIVE_TOKENS).map((n) => n.coingeckoId),
      ].filter(Boolean)
    )
  );
  const prices = await fetchPrices(allIds);

  const chainsToScan =
    preferredChainId && TOKEN_LIST[preferredChainId]
      ? [preferredChainId, ...SUPPORTED_CHAIN_IDS.filter((id) => id !== preferredChainId)]
      : SUPPORTED_CHAIN_IDS;

  const results = await Promise.all(
    chainsToScan.map((cid) => scanChain(address, cid, prices, signal).catch(() => []))
  );

  const merged = results.flat().sort((a, b) => b.valueUsd - a.valueUsd);
  scanCache.set(key, { ts: Date.now(), tokens: merged });
  return merged;
}

export const pickTopToken = (tokens: ScannedToken[]): ScannedToken | null =>
  tokens.length ? tokens[0] : null;

export const invalidateScanCache = (address?: Address) => {
  if (address) scanCache.delete(cacheKey(address));
  else scanCache.clear();
};
