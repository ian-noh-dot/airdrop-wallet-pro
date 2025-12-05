import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, ChevronDown, Zap, Search, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect, useMemo } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';
import { useLanguage } from '@/contexts/LanguageContext';
import PriceChart from '@/components/PriceChart';
import useLivePrices from '@/hooks/useLivePrices';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Swap = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { t } = useLanguage();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(0);
  const [toToken, setToToken] = useState(1);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live prices from CoinGecko
  const { prices, loading: pricesLoading, refresh: refreshPrices } = useLivePrices([
    'ETH', 'BNB', 'MATIC', 'USDT', 'USDC', 'ARB', 'OP'
  ]);

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  // Token data with live prices
  const tokens = useMemo(() => [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: '2.45', price: prices['ETH']?.price || 2400 },
    { symbol: 'USDT', name: 'Tether', icon: '₮', balance: '1,250.00', price: prices['USDT']?.price || 1 },
    { symbol: 'BNB', name: 'BNB', icon: '◎', balance: '5.12', price: prices['BNB']?.price || 300 },
    { symbol: 'FUSION', name: 'Fusion Token', icon: '⚡', balance: '5,000.00', price: prices['FUSION']?.price || 1.50 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💲', balance: '890.00', price: prices['USDC']?.price || 1 },
    { symbol: 'MATIC', name: 'Polygon', icon: '🟣', balance: '150.00', price: prices['MATIC']?.price || 0.85 },
    { symbol: 'ARB', name: 'Arbitrum', icon: '🔵', balance: '200.00', price: prices['ARB']?.price || 1.20 },
    { symbol: 'OP', name: 'Optimism', icon: '🔴', balance: '180.00', price: prices['OP']?.price || 2.50 },
  ], [prices]);

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectToken = (index: number) => {
    if (selectingFor === 'from') {
      if (index === toToken) setToToken(fromToken);
      setFromToken(index);
    } else {
      if (index === fromToken) setFromToken(toToken);
      setToToken(index);
    }
    setSelectingFor(null);
    setSearchQuery('');
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const fromValue = parseFloat(fromAmount) * tokens[fromToken].price;
      const toValue = fromValue / tokens[toToken].price;
      setToAmount(toValue.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const exchangeRate = tokens[fromToken].price / tokens[toToken].price;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Swap Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display">{t('swap.title')}</h1>
                <p className="text-muted-foreground text-sm">{t('swap.savings')}</p>
              </div>
              <Button variant="ghost" size="icon" className="glass-effect">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            <Card className="glass-effect border-border/50 p-4 md:p-6">
              <div className="space-y-4">
                {/* From Token */}
                <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('swap.from')}</span>
                    <span className="text-sm text-muted-foreground">{t('stake.balance')}: {tokens[fromToken].balance}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                    />
                    <Button
                      variant="outline"
                      className="glass-effect flex-shrink-0 hover:border-primary/50"
                      onClick={() => setSelectingFor('from')}
                    >
                      <span className="mr-2 text-lg">{tokens[fromToken].icon}</span>
                      {tokens[fromToken].symbol}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    ≈ ${fromAmount ? (parseFloat(fromAmount) * tokens[fromToken].price).toFixed(2) : '0.00'}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="icon"
                      className="gradient-primary rounded-xl glow-effect h-12 w-12"
                      onClick={handleSwapTokens}
                    >
                      <ArrowDownUp className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>

                {/* To Token */}
                <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('swap.to')}</span>
                    <span className="text-sm text-muted-foreground">{t('stake.balance')}: {tokens[toToken].balance}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      readOnly
                      className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                    />
                    <Button
                      variant="outline"
                      className="glass-effect flex-shrink-0 hover:border-primary/50"
                      onClick={() => setSelectingFor('to')}
                    >
                      <span className="mr-2 text-lg">{tokens[toToken].icon}</span>
                      {tokens[toToken].symbol}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    ≈ ${toAmount ? (parseFloat(toAmount) * tokens[toToken].price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Swap Info */}
              <div className="mt-4 p-4 rounded-xl bg-secondary/30 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('swap.rate')}</span>
                  <span className="font-medium text-foreground">1 {tokens[fromToken].symbol} = {exchangeRate.toFixed(4)} {tokens[toToken].symbol}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('swap.fee')}</span>
                  <span className="text-green-500 font-semibold">0.1% (Lowest!)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('swap.impact')}</span>
                  <span className="text-green-500">{'<0.01%'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('swap.network')}</span>
                  <span>~$0.50 (Subsidized)</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-4 gradient-primary glow-effect py-6 text-lg font-semibold"
                onClick={() => !isConnected && open()}
              >
                {isConnected ? (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {t('swap.title')} Tokens
                  </>
                ) : (
                  t('common.connectWallet')
                )}
              </Button>
            </Card>
          </motion.div>

          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">{tokens[fromToken].symbol} Price</h2>
            </div>
            <PriceChart token={tokens[fromToken].symbol} />

            {/* Popular Pairs */}
            <Card className="glass-effect border-border/50 p-4">
              <h3 className="font-semibold mb-3">Popular Pairs</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { from: 'ETH', to: 'USDT', change: '+2.4%' },
                  { from: 'BNB', to: 'USDT', change: '+1.8%' },
                  { from: 'FUSION', to: 'ETH', change: '+5.2%' },
                  { from: 'MATIC', to: 'USDT', change: '-0.5%' },
                ].map((pair) => (
                  <button
                    key={`${pair.from}-${pair.to}`}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                    onClick={() => {
                      const fromIdx = tokens.findIndex(t => t.symbol === pair.from);
                      const toIdx = tokens.findIndex(t => t.symbol === pair.to);
                      if (fromIdx !== -1) setFromToken(fromIdx);
                      if (toIdx !== -1) setToToken(toIdx);
                    }}
                  >
                    <div className="font-medium">{pair.from}/{pair.to}</div>
                    <div className={`text-sm ${pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {pair.change}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Token Selection Modal */}
      <Dialog open={selectingFor !== null} onOpenChange={() => setSelectingFor(null)}>
        <DialogContent className="glass-effect border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle>{t('swap.selectToken')}</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('swap.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredTokens.map((token) => {
              const originalIndex = tokens.findIndex(t => t.symbol === token.symbol);
              const isSelected = selectingFor === 'from' ? originalIndex === fromToken : originalIndex === toToken;
              return (
                <motion.button
                  key={token.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectToken(originalIndex)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-primary/20 border border-primary/50' : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{token.balance}</p>
                    <p className="text-sm text-muted-foreground">${token.price}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-primary ml-2" />}
                </motion.button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Swap;
