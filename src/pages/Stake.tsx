import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Coins, Lock, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Stake = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const stakingPeriods = [
    { days: 30, apy: '125%', multiplier: '1x' },
    { days: 90, apy: '250%', multiplier: '2x' },
    { days: 180, apy: '400%', multiplier: '3.5x' },
    { days: 365, apy: '500%', multiplier: '5x' },
  ];

  const stats = [
    { label: 'Total Staked', value: '$42.8M', icon: <Coins className="w-5 h-5" /> },
    { label: 'Your Stake', value: '$0.00', icon: <Lock className="w-5 h-5" /> },
    { label: 'Rewards Earned', value: '$0.00', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-display">Stake FUSION</h1>
            <p className="text-muted-foreground mt-1">Lock your tokens and earn up to 500% APY</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="glass-effect p-4 text-center">
                <div className="flex justify-center mb-2 text-primary">{stat.icon}</div>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Staking Card */}
            <Card className="glass-effect border-border/50 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-primary" />
                Stake Tokens
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Amount to Stake</span>
                    <span>Balance: 0 FUSION</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                    />
                    <Button variant="outline" size="sm" className="text-primary">
                      MAX
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Lock Period</label>
                  <div className="grid grid-cols-2 gap-2">
                    {stakingPeriods.map((period) => (
                      <button
                        key={period.days}
                        onClick={() => setSelectedPeriod(period.days)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedPeriod === period.days
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold">{period.days} Days</div>
                        <div className="text-xs text-muted-foreground">{period.apy} APY</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full gradient-primary glow-effect py-6"
                  onClick={() => !isConnected && open()}
                >
                  {isConnected ? 'Stake FUSION' : 'Connect Wallet to Stake'}
                </Button>
              </div>
            </Card>

            {/* Rewards Info */}
            <Card className="glass-effect border-border/50 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                Staking Rewards
              </h2>

              <div className="space-y-4">
                {stakingPeriods.map((period, i) => (
                  <motion.div
                    key={period.days}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{period.days} Days Lock</div>
                        <div className="text-sm text-muted-foreground">{period.multiplier} rewards</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-500 font-bold text-lg">{period.apy}</div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stake;
