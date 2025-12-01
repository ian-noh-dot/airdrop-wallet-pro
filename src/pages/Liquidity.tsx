import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Droplets, TrendingUp, Percent } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Liquidity = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const pools = [
    { pair: 'ETH/USDT', tvl: '$45.2M', apr: '24.5%', volume: '$12.3M' },
    { pair: 'BNB/USDT', tvl: '$28.1M', apr: '18.2%', volume: '$8.7M' },
    { pair: 'ETH/BNB', tvl: '$15.8M', apr: '32.1%', volume: '$4.2M' },
    { pair: 'MATIC/USDT', tvl: '$9.4M', apr: '45.8%', volume: '$2.1M' },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">Liquidity Pools</h1>
              <p className="text-muted-foreground mt-1">Provide liquidity and earn fees</p>
            </div>
            <Button className="gradient-primary glow-effect">
              <Plus className="w-4 h-4 mr-2" />
              Add Liquidity
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total TVL', value: '$98.5M', icon: <Droplets className="w-5 h-5" /> },
              { label: 'Avg APR', value: '30.2%', icon: <Percent className="w-5 h-5" /> },
              { label: '24h Volume', value: '$27.3M', icon: <TrendingUp className="w-5 h-5" /> },
            ].map((stat, i) => (
              <Card key={i} className="glass-effect p-4 text-center">
                <div className="flex justify-center mb-2 text-primary">{stat.icon}</div>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Pools List */}
          <Card className="glass-effect border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold">Top Pools</h2>
            </div>
            <div className="divide-y divide-border/50">
              {pools.map((pool, i) => (
                <motion.div
                  key={pool.pair}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {pool.pair.split('/')[0][0]}
                    </div>
                    <div>
                      <div className="font-semibold">{pool.pair}</div>
                      <div className="text-sm text-muted-foreground">TVL: {pool.tvl}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-semibold">{pool.apr} APR</div>
                    <div className="text-sm text-muted-foreground">Vol: {pool.volume}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {!isConnected && (
            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="gradient-primary glow-effect"
                onClick={() => open()}
              >
                Connect Wallet to Add Liquidity
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Liquidity;
