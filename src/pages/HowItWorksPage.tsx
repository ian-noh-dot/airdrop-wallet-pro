import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Gift,
  Coins,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Users,
  Zap,
  HelpCircle,
  Download,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

const HowItWorksPage = () => {
  const steps = [
    {
      number: '01',
      icon: <Wallet className="w-8 h-8" />,
      title: 'Connect Your Wallet',
      description: 'Link your Web3 wallet to access the platform. We support MetaMask, Trust Wallet, Coinbase, Binance Web3 Wallet, and 500+ other wallets.',
      tips: [
        'Make sure your wallet is on the correct network (Ethereum, BSC, Polygon)',
        'Keep your seed phrase secure and never share it',
        'Approve the connection request in your wallet'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      icon: <Gift className="w-8 h-8" />,
      title: 'Claim Your Airdrop',
      description: 'Once connected, you can instantly claim your free FUSION tokens. The airdrop is available for a limited time only.',
      tips: [
        'Verify your eligibility automatically upon connection',
        'Use a referral code to get bonus tokens',
        'Share your referral link to earn more rewards'
      ],
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: '03',
      icon: <Coins className="w-8 h-8" />,
      title: 'Stake to Earn',
      description: 'Stake your tokens to earn up to 500% APY. Choose from flexible or locked staking options for maximum returns.',
      tips: [
        '30-day lock: 100% APY',
        '90-day lock: 300% APY',
        '365-day lock: 500% APY - Best Value!'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '04',
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Trade & Grow',
      description: 'Use our DEX to swap tokens with the lowest fees (0.1%). Bridge across chains and grow your portfolio.',
      tips: [
        'Swap with 0.1% fees - 10x cheaper than Uniswap',
        'Bridge tokens across 7+ networks instantly',
        'Zero slippage on major pairs'
      ],
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const walletGuides = [
    {
      name: 'MetaMask',
      icon: '🦊',
      platform: 'Desktop & Mobile',
      difficulty: 'Easy',
      steps: [
        'Visit metamask.io and install the browser extension or mobile app',
        'Create a new wallet or import existing with seed phrase',
        'Secure your 12-word recovery phrase offline',
        'Click "Connect Wallet" on our site and select MetaMask'
      ]
    },
    {
      name: 'Trust Wallet',
      icon: '🛡️',
      platform: 'Mobile',
      difficulty: 'Easy',
      steps: [
        'Download Trust Wallet from App Store or Google Play',
        'Create a new wallet and backup your recovery phrase',
        'Open DApp browser within Trust Wallet',
        'Navigate to our site and connect your wallet'
      ]
    },
    {
      name: 'Binance Web3 Wallet',
      icon: '💛',
      platform: 'Mobile (Binance App)',
      difficulty: 'Medium',
      steps: [
        'Open Binance app and go to "Wallets" tab',
        'Select "Web3" and create a new Web3 wallet',
        'Complete identity verification if required',
        'Use the built-in DApp browser to connect to our site'
      ]
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      platform: 'Any Wallet',
      difficulty: 'Easy',
      steps: [
        'Click "Connect Wallet" and select WalletConnect',
        'Scan the QR code with any WalletConnect-compatible wallet',
        'Approve the connection on your mobile device',
        'Great for connecting mobile wallets to desktop browsers'
      ]
    }
  ];

  const faqs = [
    {
      q: 'Is connecting my wallet safe?',
      a: 'Yes! We only request read permissions to verify your eligibility. We never ask for your private keys or seed phrase. All connections are encrypted and audited by CertiK.'
    },
    {
      q: 'What if I have two devices?',
      a: 'Use WalletConnect! Click Connect Wallet, select WalletConnect, and scan the QR code with your mobile wallet. This lets you connect your phone wallet to a desktop browser.'
    },
    {
      q: 'Why can\'t I see my wallet?',
      a: 'Make sure your wallet extension is installed and unlocked. If using mobile, access our site through your wallet\'s built-in browser (DApp browser).'
    },
    {
      q: 'Which network should I use?',
      a: 'We support Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, and Base. Your airdrop is available on all networks!'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Complete Guide</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to claim your free tokens and start earning rewards
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-border/50 p-6 md:p-8 hover:border-primary/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 text-white`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl font-bold text-muted-foreground/30 font-display">{step.number}</span>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <div className="space-y-2">
                      {step.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Wallet Guides */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-display">
            Wallet <span className="text-gradient-accent">Setup Guides</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {walletGuides.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-border/50 p-6 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{wallet.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{wallet.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {wallet.platform.includes('Desktop') && <Monitor className="w-4 h-4" />}
                        {wallet.platform.includes('Mobile') && <Smartphone className="w-4 h-4" />}
                        <span>{wallet.platform}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                          {wallet.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ol className="space-y-2">
                    {wallet.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-display">
            Common <span className="text-gradient">Questions</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-effect border-border/50 p-6">
                <h4 className="font-bold mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="glass-effect border-border/50 p-8 md:p-12 max-w-2xl mx-auto">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-display">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet now and claim your free FUSION tokens before the airdrop ends!
            </p>
            <Link to="/">
              <Button size="lg" className="gradient-primary glow-effect">
                <Gift className="w-5 h-5 mr-2" />
                Claim Your Airdrop
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;