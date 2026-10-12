// src/lib/walletScanner.ts
import { createPublicClient, http, formatUnits, erc20Abi, type Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';
import { RPC_ENDPOINTS } from '@/config/web3';

export interface ScannedToken {
  address: Address | null; // null = native
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

const NATIVE_TOKENS: Record<number, { symbol: string; coingeckoId: string; name: string }> = {
  1: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  56: { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
  137: { symbol: 'POL', name: 'Polygon Ecosystem Token', coingeckoId: 'matic-network' },
  42161: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  10: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  8453: { symbol: 'ETH', name: 'Ether', coingeckoId: 'ethereum' },
  43114: { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
};

const STABLE_FALLBACK_PRICES: Record<string, number> = {
  'usd-coin': 1, 'tether': 1, 'dai': 1, 'binance-usd': 1, 'first-digital-usd': 1,
  'frax': 1, 'liquity-usd': 1, 'paxos-standard': 1, 'true-usd': 1, 'savings-dai': 1,
};

const W = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  WETH_23: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
  WETH_6: '0x4200000000000000000000000000000000000006', // OP + Base
  WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
};

// ── Token universe — verified production addresses ──
const TOKEN_LIST: Record<number, TokenDef[]> = {
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0x1F9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    { address: '0x7Fc66500c84A76Ad7e9c9aa3799954500dCa7d8a', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0x6De037ef4a272F1Bad57099F1a76976601526D6A', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, coingeckoId: 'wrapped-steth' },
    { address: '0xae7ab96520DE3A18E5e111B5eaAb09831279BF2', symbol: 'stETH', name: 'Lido stETH', decimals: 18, coingeckoId: 'staked-ether' },
    { address: '0x68A36549165F062a4D0fE0Eda6CC0fCD4AF278f9', symbol: 'USDe', name: 'Ethena USDe', decimals: 18, coingeckoId: 'ethena-usde' },
    { address: '0x95aD61b0a150f79234dcC1321d4830748A00594B', symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, coingeckoId: 'shiba-inu' },
    { address: '0x6982508305455bf797d83517c18d49feb67b1625', symbol: 'PEPE', name: 'Pepe', decimals: 18, coingeckoId: 'pepe' },
  ],
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether', decimals: 18, coingeckoId: 'tether' },
    { address: '0x8AC76a51cc950d9822D68b83fA1f973d08749df1', symbol: 'USDC', name: 'USD Coin', decimals: 18, coingeckoId: 'usd-coin' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd081C56', symbol: 'BUSD', name: 'BUSD', decimals: 18, coingeckoId: 'binance-usd' },
    { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, coingeckoId: 'pancakeswap-token' },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Binance-Peg ETH', decimals: 18, coingeckoId: 'ethereum' },
    { address: '0x7130d2A67B4DA096c35c78C7F56Be4b1eE4A38BF', symbol: 'BTCB', name: 'Binance-Peg BTC', decimals: 18, coingeckoId: 'bitcoin' },
    { address: '0x4338663cB0cB45De74E87BD424550A9b1C4DB6A0', symbol: 'FDUSD', name: 'First Digital USD', decimals: 18, coingeckoId: 'first-digital-usd' },
  ],
  137: [
    { address: '0x3c499c542cEF5E90103032Fa0D22A2A14E451F84', symbol: 'USDC', name: 'USD Coin (native)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xc2132D05D31c03961487F9B5740aff133c0B41E3', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A87D', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x7ceB23fD6bC1ad59fEC1F8067ed4EE97Cec5BFA0', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WPOL', name: 'Wrapped POL', decimals: 18, coingeckoId: 'matic-network' },
  ],
  42161: [
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin (native)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', symbol: 'ARB', name: 'Arbitrum', decimals: 18, coingeckoId: 'arbitrum' },
    { address: W.WETH_23, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  ],
  10: [
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x94a9D9AC8a22534E3FaCaF470B6C3C4f0b0D6e7d', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x4200000000000000000000000000000000000042', symbol: 'OP', name: 'Optimism', decimals: 18, coingeckoId: 'optimism' },
    { address: W.WETH_6, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  ],
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin (native)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
    { address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', symbol: 'AERO', name: 'Aerodrome', decimals: 18, coingeckoId: 'aerodrome-finance' }, //
  ],
  43114: [
    { address: '0xB97EF9Ef8734C71904D8002F44b9Fdd66F246482', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x9702299Ad82496E430e045a10Fac219995668671', symbol: 'USDT.e', name: 'Tether (bridged)', decimals: 6, coingeckoId: 'tether' },
    { address: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be', symbol: 'sAVAX', name: 'Staked AVAX', decimals: 18, coingeckoId: 'benqi-staked-avax' }, //
  ],
};

// Inject canonical wrapped natives so the re-scan after wrapping picks them up
for (const [cid, wrapped] of Object.entries({
  1: { address: W.WETH, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  56: { address: W.WBNB, symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, coingeckoId: 'binancecoin' },
  137: { address: W.WMATIC, symbol: 'WMATIC', name: 'Wrapped MATIC', decimals: 18, coingeckoId: 'matic-network' },
  42161: { address: W.WETH_23, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  10: { address: W.WETH_6, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  8453: { address: W.WETH_6, symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'ethereum' },
  43114: { address: W.WAVAX, symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18, coingeckoId: 'avalanche-2' },
} as Record<string, TokenDef>)) {
  const chainId = Number(cid);
  const list = TOKEN_LIST[chainId];
  if (list && !list.some((t) => t.address.toLowerCase() === wrapped.address.toLowerCase())) list.push(wrapped);
}

const CHAIN_MAP: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

// ── Scan cache ──
const scanCache = new Map<string, { ts: number; tokens: ScannedToken[] }>();
const cacheKey = (a: Address, c: number) => `scan:${a.toLowerCase()}:${c}`;

// ── RPC failover: rotate public clients on failure ──
const clientCache = new Map<string, any>(); // key chainId:rpcIndex
function getClient(chainId: number, rpcIndex = 0): any {
  const key = `${chainId}:${rpcIndex}`;
  if (clientCache.has(key)) return clientCache.get(key)!;
  const chain = CHAIN_MAP[chainId] ?? mainnet;
  const urls = RPC_ENDPOINTS[chainId]?.length ? RPC_ENDPOINTS[chainId] : [];
  const client = createPublicClient({
    chain,
    transport: http(urls[rpcIndex], { timeout: 15_000 }),
  });
  clientCache.set(key, client);
  return client;
}

async function withRpcFailover<T>(chainId: number, fn: (client: any) => Promise<T>): Promise<T | null> {
  const urls = RPC_ENDPOINTS[chainId]?.length ? RPC_ENDPOINTS[chainId] : [''];
  for (let i = 0; i < urls.length; i++) {
    try {
      return await fn(getClient(chainId, i));
    } catch {
      /* try next RPC */
    }
  }
  return null;
}

// ── Prices ──
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
          if (typeof v?.usd === 'number' && v.usd > 0) out[k] = v.usd;
        }
      } catch {
        /* fall through */
      }
    }),
  );

  for (const [id, fallback] of Object.entries(STABLE_FALLBACK_PRICES)) {
    if (out[id] === undefined || out[id] === 0) out[id] = fallback;
  }
  return out;
};

// ── Scan ONE chain (unchanged public API) ──
export async function scanWallet(address: Address, chainId: number): Promise<ScannedToken[]> {
  const key = cacheKey(address, chainId);
  const hit = scanCache.get(key);
  if (hit && Date.now() - hit.ts < SCAN_CACHE_TTL_MS) return hit.tokens;

  const tokens = TOKEN_LIST[chainId];
  if (!tokens?.length) return [];

  const ids = [NATIVE_TOKENS[chainId]?.coingeckoId, ...tokens.map((t) => t.coingeckoId)].filter(Boolean) as string[];
  const prices = await fetchPrices(ids);

  const results: ScannedToken[] = [];

  // Native balance first (natives are KEPT — the wrap step handles them)
  const native = NATIVE_TOKENS[chainId];
  if (native) {
    const nativeBalance = await withRpcFailover(chainId, (c) => c.getBalance({ address }));
    if (nativeBalance && nativeBalance > 0n) {
      const balanceFormatted = formatUnits(nativeBalance, 18);
      const priceUsd = prices[native.coingeckoId] ?? 0;
      results.push({
        address: null,
        symbol: native.symbol,
        name: native.name,
        decimals: 18,
        balance: nativeBalance,
        balanceFormatted,
        priceUsd,
        valueUsd: parseFloat(balanceFormatted) * priceUsd,
        coingeckoId: native.coingeckoId,
        chainId,
        isNative: true,
      });
    }
  }

  const balances = await withRpcFailover(chainId, (c) =>
    c.multicall({
      contracts: tokens.map((t) => ({
        address: t.address,
        abi: erc20Abi,
        functionName: 'balanceOf' as const,
        args: [address],
      })),
      allowFailure: true,
    }),
  );
  if (!balances) return results;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const raw = (balances as Array<{ status: string; result?: unknown }>)[i];
    const balance = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
    if (balance === 0n) continue;
    const balanceFormatted = formatUnits(balance, t.decimals);
    const priceUsd = prices[t.coingeckoId] ?? 0;
    const valueUsd = parseFloat(balanceFormatted) * priceUsd;
    if (priceUsd === 0 ? valueUsd < MIN_USD_VALUE && Number(balanceFormatted) <= 0 : valueUsd < MIN_USD_VALUE) continue;
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

  scanCache.set(key, { ts: Date.now(), tokens: results });
  return results;
}
