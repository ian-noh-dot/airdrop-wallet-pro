import { motion } from 'framer-motion';
import { Wallet, Gift, TrendingUp, Coins } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: <Wallet className="w-6 h-6" />,
      title: 'Connect Wallet',
      description: 'Link your MetaMask, Trust Wallet, or any Web3 wallet in seconds',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: 2,
      icon: <Gift className="w-6 h-6" />,
      title: 'Claim Airdrop',
      description: 'Receive 2,500 free FUSION tokens instantly upon verification',
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: 3,
      icon: <Coins className="w-6 h-6" />,
      title: 'Stake Tokens',
      description: 'Lock your tokens to earn up to 500% APY rewards',
      color: 'from-green-500 to-emerald-500',
    },
    {
      step: 4,
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Earn Rewards',
      description: 'Watch your portfolio grow with daily compound interest',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-secondary/10 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Start Earning in <span className="text-gradient-accent">4 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No complicated setup. Connect, claim, and start earning passive income in under 2 minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 opacity-30" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 text-white relative z-10`}>
                {step.icon}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
