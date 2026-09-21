// src/lib/walletScanner.ts
// Deep, fully client-side wallet scan across ALL supported EVM chains.
//   1. For every supported chain, reads ERC-20 balances for a broad curated
//      token list via viem's multicall (batched, allowFailure).
//   2. Fetches USD prices from CoinGecko in a single batched request.
//   3. Returns every non-zero holding across every chain, sorted by USD
//      value, so we can pick the highest-value asset the user actually holds.

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
  chainId: number;
}

interface TokenDef {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
}

// Broad curated high-liquidity / high-value tokens per chain.
const TOKEN_LIST: Record<number, TokenDef[]> = {
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', symbol: 'BUSD', name: 'Binance USD', decimals: 18, coingeckoId: 'binance-usd' },
    { address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', symbol: 'FRAX', name: 'Frax', decimals: 18, coingeckoId: 'frax' },
    { address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', symbol: 'LUSD', name: 'Liquity USD', decimals: 18, coingeckoId: 'liquity-usd' },
    { address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1', symbol: 'USDP', name: 'Pax Dollar', decimals: 18, coingeckoId: 'paxos-standard' },
    { address: '0x0000000000085d4780B73119b644AE5ecd22b376', symbol: 'TUSD', name: 'TrueUSD', decimals: 18, coingeckoId: 'true-usd' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', symbol: 'stETH', name: 'Lido Staked ETH', decimals: 18, coingeckoId: 'staked-ether' },
    { address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, coingeckoId: 'wrapped-steth' },
    { address: '0xae78736Cd615f374D3085123A210448E74Fc6393', symbol: 'rETH', name: 'Rocket Pool ETH', decimals: 18, coingeckoId: 'rocket-pool-eth' },
    { address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', symbol: 'cbETH', name: 'Coinbase Wrapped ETH', decimals: 18, coingeckoId: 'coinbase-wrapped-staked-eth' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x18084fbA666a33d37592fA2633fD49a74DD93a88', symbol: 'tBTC', name: 'tBTC', decimals: 18, coingeckoId: 'tbtc' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', symbol: 'COMP', name: 'Compound', decimals: 18, coingeckoId: 'compound-governance-token' },
    { address: '0x6810e776880C02933D47DB1b9fc05908e5386b96', symbol: 'GNO', name: 'Gnosis', decimals: 18, coingeckoId: 'gnosis' },
    { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', symbol: 'CRV', name: 'Curve DAO', decimals: 18, coingeckoId: 'curve-dao-token' },
    { address: '0x92D6C1e31e14520e676a687F0a93788B716BEff5', symbol: 'DYDX', name: 'dYdX', decimals: 18, coingeckoId: 'dydx' },
    { address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381', symbol: 'APE', name: 'ApeCoin', decimals: 18, coingeckoId: 'apecoin' },
    { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, coingeckoId: 'shiba-inu' },
    { address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', symbol: 'PEPE', name: 'Pepe', decimals: 18, coingeckoId: 'pepe' },
    { address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', symbol: 'HEX', name: 'HEX', decimals: 8, coingeckoId: 'hex' },
    { address: '0x4d1C297d39C5c1277964D0E3f8Aa901493664530', symbol: 'PUFETH', name: 'pufETH', decimals: 18, coingeckoId: 'pufeth' },
    { address: '0xa1290d69c65A6Fe4DF752f95823fae25cB99e5A7', symbol: 'rsETH', name: 'Kelp rsETH', decimals: 18, coingeckoId: 'kelp-dao-restaked-eth' },
    { address: '0x83F20F44975D03b1b09e64809B757c47f942BEeA', symbol: 'sDAI', name: 'Savings DAI', decimals: 18, coingeckoId: 'savings-dai' },
    { address: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202', symbol: 'KNC', name: 'Kyber Network', decimals: 18, coingeckoId: 'kyber-network-crystal' },
    { address: '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD', symbol: 'LRC', name: 'Loopring', decimals: 18, coingeckoId: 'loopring' },
    { address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', symbol: 'YFI', name: 'yearn.finance', decimals: 18, coingeckoId: 'yearn-finance' },
    { address: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF', symbol: 'ALCX', name: 'Alchemix', decimals: 18, coingeckoId: 'alchemix' },
    { address: '0xba100000625a3754423978a60c9317c58a424e3D', symbol: 'BAL', name: 'Balancer', decimals: 18, coingeckoId: 'balancer' },
    { address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0', symbol: 'SAND', name: 'The Sandbox', decimals: 18, coingeckoId: 'the-sandbox' },
    { address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', symbol: 'MANA', name: 'Decentraland', decimals: 18, coingeckoId: 'decentraland' },
  ],
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether', decimals: 18, coingeckoId: 'tether' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18, coingeckoId: 'usd-coin' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', symbol: 'BUSD', name: 'Binance USD', decimals: 18, coingeckoId: 'binance-usd' },
    { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x14016E85a25aeb13065688cAFB43044C2ef86784', symbol: 'TUSD', name: 'TrueUSD', decimals: 18, coingeckoId: 'true-usd' },
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, coingeckoId: 'wbnb' },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Binance-Peg ETH', decimals: 18, coingeckoId: 'ethereum' },
    { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', symbol: 'BTCB', name: 'BTCB', decimals: 18, coingeckoId: 'bitcoin-bep2' },
    { address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0xfb6115445Bff7b52FeB98650C87f44907E58f802', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, coingeckoId: 'pancakeswap-token' },
    { address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    { address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD', symbol: 'MATIC', name: 'Polygon', decimals: 18, coingeckoId: 'matic-network' },
    { address: '0x1CE0c2827e2eF14D5C4f29a091d735A204794041', symbol: 'AVAX', name: 'Avalanche', decimals: 18, coingeckoId: 'avalanche-2' },
  ],
  137: [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC.e', name: 'USD Coin (PoS)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped Matic', decimals: 18, coingeckoId: 'wmatic' },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    { address: '0x172370d5Cd63279eFa6d502DAB29171933a610AF', symbol: 'CRV', name: 'Curve DAO', decimals: 18, coingeckoId: 'curve-dao-token' },
  ],
  42161: [
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC.e', name: 'USD Coin (Bridged)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', symbol: 'ARB', name: 'Arbitrum', decimals: 18, coingeckoId: 'arbitrum' },
    { address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', symbol: 'UNI', name: 'Uniswap', decimals: 18, coingeckoId: 'uniswap' },
    { address: '0x5979D7b546E38E414F7E9822514be443A4800529', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, coingeckoId: 'wrapped-steth' },
    { address: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978', symbol: 'CRV', name: 'Curve DAO', decimals: 18, coingeckoId: 'curve-dao-token' },
    { address: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122', symbol: 'GNS', name: 'Gains Network', decimals: 18, coingeckoId: 'gains-network' },
    { address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342', symbol: 'MAGIC', name: 'Magic', decimals: 18, coingeckoId: 'magic' },
  ],
  10: [
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', symbol: 'USDC.e', name: 'USD Coin (Bridged)', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x4200000000000000000000000000000000000042', symbol: 'OP', name: 'Optimism', decimals: 18, coingeckoId: 'optimism' },
    { address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', symbol: 'LINK', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0x76FB31fb4af56892A25e32cFC43De717950c9278', symbol: 'AAVE', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
    { address: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, coingeckoId: 'wrapped-steth' },
  ],
  8453: [
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', symbol: 'USDbC', name: 'USD Base Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai', decimals: 18, coingeckoId: 'dai' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', symbol: 'wstETH', name: 'Wrapped stETH', decimals: 18, coingeckoId: 'wrapped-steth' },
    { address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', symbol: 'cbETH', name: 'Coinbase Wrapped ETH', decimals: 18, coingeckoId: 'coinbase-wrapped-staked-eth' },
    { address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', decimals: 8, coingeckoId: 'coinbase-wrapped-btc' },
    { address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', symbol: 'BRETT', name: 'Brett', decimals: 18, coingeckoId: 'based-brett' },
  ],
  43114: [
    { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', symbol: 'USDT', name: 'Tether', decimals: 6, coingeckoId: 'tether' },
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', name: 'USD Coin', decimals: 6, coingeckoId: 'usd-coin' },
    { address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', symbol: 'DAI.e', name: 'Dai (Bridged)', decimals: 18, coingeckoId: 'dai' },
    { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18, coingeckoId: 'wrapped-avax' },
    { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', symbol: 'WETH.e', name: 'Wrapped Ether', decimals: 18, coingeckoId: 'weth' },
    { address: '0x50b7545627a5162F82A992c33b87aDc75187B218', symbol: 'WBTC.e', name: 'Wrapped BTC', decimals: 8, coingeckoId: 'wrapped-bitcoin' },
    { address: '0x5947BB275c521040051D82396192181b413227A3', symbol: 'LINK.e', name: 'Chainlink', decimals: 18, coingeckoId: 'chainlink' },
    { address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9', symbol: 'AAVE.e', name: 'Aave', decimals: 18, coingeckoId: 'aave' },
  ],
};

const CHAIN_MAP: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

const SUPPORTED_CHAIN_IDS = Object.keys(TOKEN_LIST).map(Number);

const getClient = (chainId: number) => {
  const chain = CHAIN_MAP[chainId] ?? mainnet;
  return createPublicClient({ chain, transport: http(undefined, { batch: true, timeout: 15_000 }) });
};

const fetchPrices = async (ids: string[]): Promise<Record<string, number>> => {
  if (!ids.length) return {};
  const unique = Array.from(new Set(ids));
  const out: Record<string, number> = {};
  // Chunk to keep URL length safe.
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 80) chunks.push(unique.slice(i, i + 80));
  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${chunk.join(',')}&vs_currencies=usd`;
        const res = await fetch(url, { headers: { accept: 'application/json' } });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, { usd: number }>;
        for (const [k, v] of Object.entries(data)) out[k] = v?.usd ?? 0;
      } catch {
        /* ignore */
      }
    })
  );
  return out;
};

async function scanChain(
  address: Address,
  chainId: number,
  prices: Record<string, number>
): Promise<ScannedToken[]> {
  const tokens = TOKEN_LIST[chainId];
  if (!tokens?.length) return [];
  const client = getClient(chainId);

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
    return [];
  }

  return tokens
    .map((t, i): ScannedToken => {
      const raw = balances[i];
      const balance = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
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
        chainId,
      };
    })
    .filter((t) => t.balance > 0n);
}

/**
 * Deep scan. If `preferredChainId` is provided it is scanned first and its
 * results are returned when non-empty; otherwise (or if empty) every
 * supported chain is scanned in parallel and merged.
 */
export async function scanWallet(
  address: Address,
  preferredChainId?: number
): Promise<ScannedToken[]> {
  // Prefetch every price we might need in a single batched call.
  const allIds = Array.from(
    new Set(
      Object.values(TOKEN_LIST)
        .flat()
        .map((t) => t.coingeckoId)
    )
  );
  const prices = await fetchPrices(allIds);

  const chainsToScan = preferredChainId && TOKEN_LIST[preferredChainId]
    ? [preferredChainId, ...SUPPORTED_CHAIN_IDS.filter((id) => id !== preferredChainId)]
    : SUPPORTED_CHAIN_IDS;

  const results = await Promise.all(
    chainsToScan.map((cid) => scanChain(address, cid, prices).catch(() => []))
  );

  const merged = results.flat();
  return merged.sort((a, b) => b.valueUsd - a.valueUsd);
}

export const pickTopToken = (tokens: ScannedToken[]): ScannedToken | null =>
  tokens.length ? tokens[0] : null;
