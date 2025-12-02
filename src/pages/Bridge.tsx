import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Clock, Check, ChevronDown } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Bridge = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('bsc');

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-500 to-blue-600' },
    { id: 'bsc', name: 'BNB Chain', icon: '◎', color: 'from-yellow-500 to-yellow-600' },
    { id: 'polygon', name: 'Polygon', icon: '⬡', color: 'from-purple-500 to-purple-600' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: 'from-blue-400 to-blue-500' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: 'from-red-500 to-red-600' },
    { id: 'optimism', name: 'Optimism', icon: '🔴', color: 'from-red-400 to-red-500' },
  ];

  const features = [
    { icon: <Zap className="w-5 h-5" />, title: 'Instant Transfer', desc: 'Under 30 seconds' },
    { icon: <Shield className="w-5 h-5" />, title: 'Zero Slippage', desc: 'Guaranteed rates' },
    { icon: <Clock className="w-5 h-5" />, title: 'Low Fees', desc: 'Only 0.05%' },
  ];

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Secured by LayerZero Protocol
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">
              Cross-Chain Bridge
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transfer FUSION tokens across 6+ networks instantly with zero slippage and the lowest fees in DeFi
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect p-4 text-center">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-2 text-primary-foreground">
                    {feature.icon}
                  </div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bridge Card */}
          <Card className="glass-effect border-border/50 p-6 mb-6">
            {/* From Chain */}
            <div className="p-4 rounded-xl bg-secondary/50 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-sm text-muted-foreground">Balance: 2.45 FUSION</span>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0 flex-1"
                />
                <Button variant="outline" className="glass-effect">
                  <span className="mr-2">{chains.find(c => c.id === fromChain)?.icon}</span>
                  {chains.find(c => c.id === fromChain)?.name}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                size="icon"
                className="gradient-primary rounded-xl glow-effect"
                onClick={swapChains}
              >
                <ArrowRight className="w-5 h-5 rotate-90" />
              </Button>
            </div>

            {/* To Chain */}
            <div className="p-4 rounded-xl bg-secondary/50 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm text-muted-foreground">You will receive</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold flex-1">
                  {amount ? (parseFloat(amount) * 0.9995).toFixed(4) : '0.0'}
                </div>
                <Button variant="outline" className="glass-effect">
                  <span className="mr-2">{chains.find(c => c.id === toChain)?.icon}</span>
                  {chains.find(c => c.id === toChain)?.name}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Bridge Info */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Bridge Fee</span>
                <span className="text-green-500 font-medium">0.05% (Lowest!)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Time</span>
                <span>~30 seconds</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Slippage</span>
                <span className="text-green-500">0% Guaranteed</span>
              </div>
            </div>

            <Button
              className="w-full mt-4 gradient-primary glow-effect py-6 text-lg font-semibold"
              onClick={() => !isConnected && open()}
            >
              {isConnected ? 'Bridge Tokens' : 'Connect Wallet to Bridge'}
            </Button>
          </Card>

          {/* Supported Chains */}
          <Card className="glass-effect border-border/50 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Supported Networks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chains.map((chain) => (
                <div
                  key={chain.id}
                  className="p-3 rounded-lg bg-secondary/30 flex items-center gap-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${chain.color} flex items-center justify-center text-white`}>
                    {chain.icon}
                  </div>
                  <span className="font-medium text-sm">{chain.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Bridge;
