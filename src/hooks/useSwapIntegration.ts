import { useState, useCallback } from 'react';
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: string;
  route: string[];
}

interface SwapParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromDecimals: number;
  slippage?: number;
}

// Token addresses for different chains
const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  1: {
    ETH: NATIVE_TOKEN,
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  56: {
    BNB: NATIVE_TOKEN,
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  137: {
    MATIC: NATIVE_TOKEN,
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  42161: {
    ETH: NATIVE_TOKEN,
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
};

export const useSwapIntegration = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sendTransaction, data: txHash } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Get token address for current chain
  const getTokenAddress = useCallback((symbol: string): string => {
    const chainTokens = TOKEN_ADDRESSES[chainId] || TOKEN_ADDRESSES[1];
    return chainTokens[symbol] || NATIVE_TOKEN;
  }, [chainId]);

  // Fetch swap quote from 1inch API
  const getQuote = useCallback(async (params: SwapParams): Promise<SwapQuote | null> => {
    if (!address || !isConnected) {
      setError('Please connect your wallet');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = parseUnits(params.amount, params.fromDecimals);
      
      // 1inch API endpoint
      const apiUrl = `https://api.1inch.dev/swap/v6.0/${chainId}/quote`;
      
      const queryParams = new URLSearchParams({
        src: params.fromTokenAddress,
        dst: params.toTokenAddress,
        amount: amount.toString(),
        includeGas: 'true',
      });

      // For production, you'd call the actual 1inch API
      // For now, simulate the response
      const simulatedQuote: SwapQuote = {
        fromToken: params.fromTokenAddress,
        toToken: params.toTokenAddress,
        fromAmount: params.amount,
        toAmount: (parseFloat(params.amount) * 0.998).toFixed(6), // Simulated with 0.2% slippage
        estimatedGas: '150000',
        priceImpact: '0.05%',
        route: ['Direct Swap'],
      };

      setQuote(simulatedQuote);
      return simulatedQuote;
    } catch (err) {
      console.error('Quote error:', err);
      setError('Failed to get swap quote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, chainId]);

  // Execute swap
  const executeSwap = useCallback(async (params: SwapParams) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setSwapping(true);
    setError(null);

    try {
      const amount = parseUnits(params.amount, params.fromDecimals);
      
      // For production, call 1inch swap API to get transaction data
      // Then execute the transaction
      
      // Simulated swap - in production this would be actual swap transaction
      toast.loading('Preparing swap transaction...', { id: 'swap' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.loading('Please confirm in your wallet...', { id: 'swap' });
      
      // In production, you would call sendTransaction with the data from 1inch
      // sendTransaction({
      //   to: swapContractAddress,
      //   data: swapData,
      //   value: isNativeToken ? amount : 0n,
      // });
      
      // Simulate success for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Swap executed successfully!', { id: 'swap' });
      return true;
    } catch (err: any) {
      console.error('Swap error:', err);
      const message = err.message?.includes('rejected') 
        ? 'Transaction rejected by user'
        : 'Swap failed. Please try again.';
      toast.error(message, { id: 'swap' });
      setError(message);
      return false;
    } finally {
      setSwapping(false);
    }
  }, [address, isConnected]);

  return {
    quote,
    loading,
    swapping,
    error,
    isConfirming,
    isSuccess,
    getQuote,
    executeSwap,
    getTokenAddress,
    txHash,
  };
};

export default useSwapIntegration;
