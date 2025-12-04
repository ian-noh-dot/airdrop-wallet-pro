import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownUp, Settings, ChevronDown, Zap, Search, X, Check } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Swap = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(0);
  const [toToken, setToToken] = useState(1);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: '2.45', price: 2400 },
    { symbol: 'USDT', name: 'Tether', icon: '₮', balance: '1,250.00', price: 1 },
    { symbol: 'BNB', name: 'BNB', icon: '◎', balance: '5.12', price: 300 },
    { symbol: 'FUSION', name: 'Fusion Token', icon: '⚡', balance: '5,000.00', price: 1.50 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💲', balance: '890.00', price: 1 },
    { symbol: 'MATIC', name: 'Polygon', icon: '🟣', balance: '150.00', price: 0.85 },
    { symbol: 'ARB', name: 'Arbitrum', icon: '🔵', balance: '200.00', price: 1.20 },
    { symbol: 'OP', name: 'Optimism', icon: '🔴', balance: '180.00', price: 2.50 },
  ];

  const filteredTokens = tokens.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Calculate conversion
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
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold font-display">Swap</h1>
            <Button variant="ghost" size="icon" className="glass-effect">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <Card className="glass-effect border-border/50 p-4 md:p-6">
            <div className="space-y-4">
              {/* From Token */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-sm text-muted-foreground">Balance: {tokens[fromToken].balance}</span>
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
                    className="glass-effect flex-shrink-0"
                    onClick={() => setSelectingFor('from')}
                  >
                    <span className="mr-2">{tokens[fromToken].icon}</span>
                    {tokens[fromToken].symbol}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <Button
                  size="icon"
                  className="gradient-primary rounded-xl glow-effect"
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="w-5 h-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm text-muted-foreground">Balance: {tokens[toToken].balance}</span>
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
                    className="glass-effect flex-shrink-0"
                    onClick={() => setSelectingFor('to')}
                  >
                    <span className="mr-2">{tokens[toToken].icon}</span>
                    {tokens[toToken].symbol}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Swap Info */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Rate</span>
                <span>1 {tokens[fromToken].symbol} = {exchangeRate.toFixed(4)} {tokens[toToken].symbol}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Swap Fee</span>
                <span className="text-green-500 font-semibold">0.1% (Lowest!)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Price Impact</span>
                <span className="text-green-500">{'<0.01%'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Network Fee</span>
                <span>~$0.50 (Subsidized)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-xs text-green-500">You save ~$25 compared to other DEXs</span>
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
                  Swap Tokens
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Token Selection Modal */}
      <Dialog open={selectingFor !== null} onOpenChange={() => setSelectingFor(null)}>
        <DialogContent className="glass-effect border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Token</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredTokens.map((token, index) => {
              const originalIndex = tokens.findIndex(t => t.symbol === token.symbol);
              const isSelected = selectingFor === 'from' ? originalIndex === fromToken : originalIndex === toToken;
              return (
                <button
                  key={token.symbol}
                  onClick={() => handleSelectToken(originalIndex)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
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
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Swap;
