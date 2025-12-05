import { useState, useEffect, useCallback } from 'react';

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// CoinGecko IDs for our tokens
const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  USDT: 'tether',
  USDC: 'usd-coin',
  ARB: 'arbitrum',
  OP: 'optimism',
  AVAX: 'avalanche-2',
  SOL: 'solana',
};

// Fallback prices if API fails
const FALLBACK_PRICES: Record<string, number> = {
  ETH: 2400,
  BTC: 45000,
  BNB: 300,
  MATIC: 0.85,
  USDT: 1,
  USDC: 1,
  ARB: 1.20,
  OP: 2.50,
  AVAX: 35,
  SOL: 100,
  FUSION: 1.50,
};

export const useLivePrices = (symbols: string[] = ['ETH', 'BNB', 'MATIC', 'USDT']) => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      // Get CoinGecko IDs for requested symbols
      const ids = symbols
        .map(s => COINGECKO_IDS[s])
        .filter(Boolean)
        .join(',');

      if (!ids) {
        // Use fallback for tokens not in CoinGecko
        const fallbackPrices: Record<string, TokenPrice> = {};
        symbols.forEach(symbol => {
          fallbackPrices[symbol] = {
            symbol,
            price: FALLBACK_PRICES[symbol] || 1,
            change24h: (Math.random() - 0.5) * 10,
            lastUpdated: Date.now(),
          };
        });
        setPrices(fallbackPrices);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        { headers: { accept: 'application/json' } }
      );

      if (!response.ok) throw new Error('Failed to fetch prices');

      const data: CoinGeckoResponse = await response.json();

      const newPrices: Record<string, TokenPrice> = {};
      
      symbols.forEach(symbol => {
        const geckoId = COINGECKO_IDS[symbol];
        if (geckoId && data[geckoId]) {
          newPrices[symbol] = {
            symbol,
            price: data[geckoId].usd,
            change24h: data[geckoId].usd_24h_change || 0,
            lastUpdated: Date.now(),
          };
        } else {
          // Use fallback for tokens not in response
          newPrices[symbol] = {
            symbol,
            price: FALLBACK_PRICES[symbol] || 1,
            change24h: (Math.random() - 0.5) * 5,
            lastUpdated: Date.now(),
          };
        }
      });

      // Add FUSION with simulated price
      newPrices['FUSION'] = {
        symbol: 'FUSION',
        price: 1.50 + (Math.random() - 0.5) * 0.1,
        change24h: 5.2 + (Math.random() - 0.5) * 2,
        lastUpdated: Date.now(),
      };

      setPrices(newPrices);
      setError(null);
    } catch (err) {
      console.error('Price fetch error:', err);
      setError('Failed to fetch live prices');
      
      // Use fallback prices on error
      const fallbackPrices: Record<string, TokenPrice> = {};
      symbols.forEach(symbol => {
        fallbackPrices[symbol] = {
          symbol,
          price: FALLBACK_PRICES[symbol] || 1,
          change24h: (Math.random() - 0.5) * 5,
          lastUpdated: Date.now(),
        };
      });
      fallbackPrices['FUSION'] = {
        symbol: 'FUSION',
        price: 1.50,
        change24h: 5.2,
        lastUpdated: Date.now(),
      };
      setPrices(fallbackPrices);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchPrices();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = (symbol: string): number => {
    return prices[symbol]?.price || FALLBACK_PRICES[symbol] || 0;
  };

  const getChange = (symbol: string): number => {
    return prices[symbol]?.change24h || 0;
  };

  return { prices, loading, error, getPrice, getChange, refresh: fetchPrices };
};

export default useLivePrices;
