import { motion } from 'framer-motion';
import { Zap, Shield, Coins, Gift, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FeatureHighlights = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: '0.1% Swap Fee',
      description: 'Lowest fees in DeFi - 10x cheaper than Uniswap',
      highlight: 'SAVE 90%',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '500% APY Staking',
      description: 'Earn massive rewards with flexible lock periods',
      highlight: 'HIGHEST RETURNS',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Free Airdrop',
      description: 'Claim 1000 FUSION tokens just for connecting',
      highlight: 'LIMITED TIME',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bank-Grade Security',
      description: 'Audited by CertiK & Hacken with $10M insurance',
      highlight: 'FULLY INSURED',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Multi-Chain Support',
      description: 'Bridge across 6+ networks instantly',
      highlight: 'ZERO SLIPPAGE',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Instant Withdrawals',
      description: 'No lock-up for regular staking, withdraw anytime',
      highlight: 'NO LOCK',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">
          Why 500,000+ Users Choose FUSION
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The most rewarding DeFi platform with the lowest fees and highest returns
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-effect border-border/50 p-6 h-full relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold bg-gradient-to-r ${feature.color} text-white rounded-bl-lg`}>
                {feature.highlight}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;
