import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, Award, Zap, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

const RewardsCalculator = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const [referrals, setReferrals] = useState(10);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [stakeDuration, setStakeDuration] = useState(12);

  const REFERRAL_BONUS = 500; // FUSION per referral
  const BASE_APY = 0.25; // 25% APY
  const BOOST_PER_REFERRAL = 0.01; // 1% boost per referral

  const calculateRewards = () => {
    const referralRewards = referrals * REFERRAL_BONUS;
    const effectiveAPY = BASE_APY + (referrals * BOOST_PER_REFERRAL);
    const stakingRewards = stakeAmount * effectiveAPY * (stakeDuration / 12);
    const totalRewards = referralRewards + stakingRewards;
    return { referralRewards, stakingRewards, totalRewards, effectiveAPY };
  };

  const rewards = calculateRewards();

  const milestones = [
    { refs: 5, bonus: '2,500 FUSION', icon: '🥉' },
    { refs: 10, bonus: '5,000 FUSION + 5% APY Boost', icon: '🥈' },
    { refs: 25, bonus: '15,000 FUSION + 15% APY Boost', icon: '🥇' },
    { refs: 50, bonus: '30,000 FUSION + 30% APY Boost', icon: '👑' },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full gradient-primary glow-effect mb-6"
            >
              <Calculator className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Rewards <span className="text-gradient">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Calculate your potential earnings from referrals and staking. Watch your rewards grow in real-time.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Section */}
            <div className="space-y-6">
              {/* Referral Input */}
              <Card className="glass-effect border-border/50 p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-bold">Referral Count</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      value={referrals}
                      onChange={(e) => setReferrals(Math.max(0, parseInt(e.target.value) || 0))}
                      className="glass-effect border-border/50 text-2xl font-bold text-center"
                    />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {(referrals * REFERRAL_BONUS).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">FUSION</div>
                    </div>
                  </div>
                  <Slider
                    value={[referrals]}
                    onValueChange={(value) => setReferrals(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Each referral earns you {REFERRAL_BONUS} FUSION + {(BOOST_PER_REFERRAL * 100).toFixed(0)}% APY boost
                  </p>
                </div>
              </Card>

              {/* Staking Input */}
              <Card className="glass-effect border-border/50 p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-bold">Staking Amount</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="glass-effect border-border/50 text-2xl font-bold text-center"
                    />
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">APY</div>
                      <div className="text-2xl font-bold text-green-500">
                        {(rewards.effectiveAPY * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[stakeAmount]}
                    onValueChange={(value) => setStakeAmount(value[0])}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                </div>
              </Card>

              {/* Duration Input */}
              <Card className="glass-effect border-border/50 p-6">
                <div className="flex items-center mb-4">
                  <Zap className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-bold">Staking Duration</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      value={stakeDuration}
                      onChange={(e) => setStakeDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="glass-effect border-border/50 text-2xl font-bold text-center"
                    />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{stakeDuration}</div>
                      <div className="text-xs text-muted-foreground">Months</div>
                    </div>
                  </div>
                  <Slider
                    value={[stakeDuration]}
                    onValueChange={(value) => setStakeDuration(value[0])}
                    max={36}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Total Rewards */}
              <Card className="gradient-card border-primary/20 p-6 md:p-8">
                <div className="text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-bold mb-2">Total Projected Rewards</h3>
                  <div className="text-5xl md:text-6xl font-bold text-gradient mb-2">
                    {Math.floor(rewards.totalRewards).toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground mb-6">FUSION Tokens</div>
                  
                  {/* Breakdown */}
                  <div className="space-y-3 p-4 rounded-lg glass-effect">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Referral Rewards</span>
                      <span className="font-bold text-primary">{Math.floor(rewards.referralRewards).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Staking Rewards</span>
                      <span className="font-bold text-green-500">{Math.floor(rewards.stakingRewards).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl text-gradient">{Math.floor(rewards.totalRewards).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Milestones */}
              <Card className="glass-effect border-border/50 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-accent" />
                  Referral Milestones
                </h3>
                <div className="space-y-3">
                  {milestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-lg transition-all ${
                        referrals >= milestone.refs
                          ? 'gradient-card border-primary/30'
                          : 'glass-effect border-border/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{milestone.icon}</span>
                          <div>
                            <div className="font-bold">{milestone.refs} Referrals</div>
                            <div className="text-sm text-muted-foreground">{milestone.bonus}</div>
                          </div>
                        </div>
                        {referrals >= milestone.refs && (
                          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-bold">
                            Unlocked!
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* CTA */}
              {!isConnected && (
                <Card className="glass-effect border-primary/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your wallet to start earning rewards
                  </p>
                  <Button
                    onClick={() => open()}
                    className="gradient-primary glow-effect w-full"
                    size="lg"
                  >
                    Connect Wallet
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RewardsCalculator;
