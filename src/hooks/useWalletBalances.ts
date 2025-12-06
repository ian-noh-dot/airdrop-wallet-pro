import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatUnits } from 'viem';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  address?: string;
  icon: string;
  usdValue?: number;
}

// Common token addresses on different chains
const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
  1: { // Ethereum Mainnet
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  56: { // BSC
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  137: { // Polygon
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  42161: { // Arbitrum
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
};

const TOKEN_ICONS: Record<string, string> = {
  ETH: '⟠',
  BNB: '◎',
  MATIC: '🟣',
  USDT: '₮',
  USDC: '💲',
  WETH: '⟠',
  WBNB: '◎',
  WMATIC: '🟣',
  FUSION: '⚡',
  ARB: '🔵',
  OP: '🔴',
};

export const useWalletBalances = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get native balance
  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
  });

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!address || !isConnected) {
      setTokenBalances([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balances: TokenBalance[] = [];

      // Add native token balance
      if (nativeBalance) {
        const nativeSymbol = chainId === 56 ? 'BNB' : chainId === 137 ? 'MATIC' : 'ETH';
        balances.push({
          symbol: nativeSymbol,
          name: nativeSymbol === 'ETH' ? 'Ethereum' : nativeSymbol === 'BNB' ? 'BNB' : 'Polygon',
          balance: nativeBalance.value.toString(),
          balanceFormatted: parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4),
          decimals: nativeBalance.decimals,
          icon: TOKEN_ICONS[nativeSymbol] || '🪙',
        });
      }

      // Add simulated balances for demo (in production, fetch from blockchain)
      const demoBalances: TokenBalance[] = [
        { symbol: 'USDT', name: 'Tether', balance: '0', balanceFormatted: '1,250.00', decimals: 6, icon: '₮' },
        { symbol: 'USDC', name: 'USD Coin', balance: '0', balanceFormatted: '890.00', decimals: 6, icon: '💲' },
        { symbol: 'FUSION', name: 'Fusion Token', balance: '0', balanceFormatted: '5,000.00', decimals: 18, icon: '⚡' },
      ];

      setTokenBalances([...balances, ...demoBalances]);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, chainId, nativeBalance]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Refresh balances
  const refresh = useCallback(async () => {
    await refetchNative();
    await fetchBalances();
  }, [refetchNative, fetchBalances]);

  return {
    balances: tokenBalances,
    nativeBalance,
    loading,
    error,
    refresh,
    isConnected,
  };
};

export default useWalletBalances;
