import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Coins, Lock, TrendingUp, Clock, Sparkles, Shield, Zap, Gift } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';
import { useLanguage } from '@/contexts/LanguageContext';
import PriceChart from '@/components/PriceChart';

const Stake = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { t } = useLanguage();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const stakingPeriods = [
    { days: 30, apy: '125%', multiplier: '1x', bonus: '+0%' },
    { days: 90, apy: '250%', multiplier: '2x', bonus: '+25%' },
    { days: 180, apy: '400%', multiplier: '3.5x', bonus: '+50%' },
    { days: 365, apy: '500%', multiplier: '5x', bonus: '+100%' },
  ];

  const stats = [
    { label: t('stake.totalStaked'), value: '$42.8M', icon: <Coins className="w-5 h-5" />, color: 'from-primary to-primary-glow' },
    { label: t('stake.yourStake'), value: '$0.00', icon: <Lock className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: t('stake.earned'), value: '$0.00', icon: <Sparkles className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
  ];

  const features = [
    { icon: <Shield className="w-5 h-5" />, title: 'Secure Staking', desc: 'Audited smart contracts' },
    { icon: <Zap className="w-5 h-5" />, title: 'Instant Unstake', desc: 'No waiting period' },
    { icon: <Gift className="w-5 h-5" />, title: 'Compound Rewards', desc: 'Auto-compounding enabled' },
  ];

  const selectedPeriodData = stakingPeriods.find(p => p.days === selectedPeriod);
  const estimatedRewards = stakeAmount 
    ? (parseFloat(stakeAmount) * parseFloat(selectedPeriodData?.apy || '0') / 100 * (selectedPeriod / 365)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-4"
            >
              <TrendingUp className="w-4 h-4" />
              {t('stake.subtitle')}
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-display">{t('stake.title')}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Lock your tokens and earn industry-leading rewards with our secure staking protocol
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect p-4 md:p-6 text-center hover:border-primary/30 transition-all group">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Staking Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-border/50 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-primary" />
                  {t('stake.title')}
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>{t('stake.amount')}</span>
                      <span>{t('stake.balance')}: 0 FUSION</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
                      />
                      <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10">
                        MAX
                      </Button>
                    </div>
                    {stakeAmount && (
                      <div className="text-sm text-muted-foreground mt-2">
                        ≈ ${(parseFloat(stakeAmount) * 1.5).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-3 block">{t('stake.period')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {stakingPeriods.map((period) => (
                        <motion.button
                          key={period.days}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPeriod(period.days)}
                          className={`p-4 rounded-xl border transition-all ${
                            selectedPeriod === period.days
                              ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                              : 'border-border hover:border-primary/50 bg-secondary/30'
                          }`}
                        >
                          <div className="font-bold text-lg">{period.days} {t('stake.days')}</div>
                          <div className="text-green-500 font-semibold">{period.apy} APY</div>
                          <div className="text-xs text-muted-foreground mt-1">{period.bonus} bonus</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Rewards */}
                  {stakeAmount && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                    >
                      <div className="text-sm text-muted-foreground">Estimated Rewards</div>
                      <div className="text-2xl font-bold text-green-500">+{estimatedRewards} FUSION</div>
                      <div className="text-xs text-muted-foreground">≈ ${(parseFloat(estimatedRewards) * 1.5).toFixed(2)} USD</div>
                    </motion.div>
                  )}

                  <Button
                    className="w-full gradient-primary glow-effect py-6 text-lg font-semibold"
                    onClick={() => !isConnected && open()}
                  >
                    {isConnected ? (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Stake FUSION
                      </>
                    ) : (
                      t('common.connectWallet')
                    )}
                  </Button>
                </div>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {features.map((feature, i) => (
                  <Card key={i} className="glass-effect p-3 text-center">
                    <div className="text-primary mb-1">{feature.icon}</div>
                    <div className="text-xs font-medium">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Rewards Info & Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Card className="glass-effect border-border/50 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                  {t('stake.rewards')}
                </h2>

                <div className="space-y-3">
                  {stakingPeriods.map((period, i) => (
                    <motion.div
                      key={period.days}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                        selectedPeriod === period.days 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-secondary/30 hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground ${
                          selectedPeriod === period.days ? 'gradient-primary' : 'bg-secondary'
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{period.days} {t('stake.days')} Lock</div>
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

              {/* FUSION Price Chart */}
              <PriceChart token="FUSION" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stake;
