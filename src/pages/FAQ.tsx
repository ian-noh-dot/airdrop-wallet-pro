import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { HelpCircle, Shield, Wallet, Gift, TrendingUp, Users, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const categories = [
    {
      title: 'Getting Started',
      icon: <Wallet className="w-5 h-5" />,
      color: 'text-primary',
      faqs: [
        {
          question: 'How do I connect my wallet?',
          answer: 'Click the "Connect Wallet" button in the top right corner. Select your preferred wallet (MetaMask, Trust Wallet, Coinbase, etc.) and approve the connection. Make sure you have a Web3 wallet installed first.',
        },
        {
          question: 'Which wallets are supported?',
          answer: 'We support all major Web3 wallets including MetaMask, Trust Wallet, Binance Web3 Wallet, Coinbase Wallet, WalletConnect, Rainbow, Ledger Live, and 500+ others through Web3Modal.',
        },
        {
          question: 'Is it safe to connect my wallet?',
          answer: 'Yes! We use industry-standard Web3Modal and never ask for your private keys or seed phrases. We only request permission to view your public wallet address. Always verify the URL before connecting.',
        },
        {
          question: 'Which networks are supported?',
          answer: 'Fusion Exchange supports Ethereum, Binance Smart Chain, Polygon, Avalanche, Arbitrum, Optimism, and Base. Switch networks directly in your wallet.',
        },
      ],
    },
    {
      title: 'Airdrop & Claims',
      icon: <Gift className="w-5 h-5" />,
      color: 'text-accent',
      faqs: [
        {
          question: 'How do I claim my airdrop?',
          answer: 'Connect your wallet and navigate to the Airdrop page. If you\'re eligible, you\'ll see your claimable tokens. Click "Claim Now" and approve the transaction in your wallet.',
        },
        {
          question: 'When does the airdrop end?',
          answer: 'The airdrop runs in phases. Phase 1 ends on March 31, 2025. Make sure to claim your tokens before the deadline to avoid missing out!',
        },
        {
          question: 'What are the eligibility requirements?',
          answer: 'Eligibility is based on early community participation, social media engagement, testnet activity, and referral milestones. Connect your wallet to check your status.',
        },
        {
          question: 'Can I claim multiple times?',
          answer: 'You can claim your base allocation once. However, you can earn additional tokens through our referral program and staking rewards.',
        },
      ],
    },
    {
      title: 'Referral Program',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-500',
      faqs: [
        {
          question: 'How does the referral program work?',
          answer: 'Share your unique referral link with friends. When they connect their wallet and claim the airdrop, you both earn bonus FUSION tokens. Each referral also increases your staking APY!',
        },
        {
          question: 'How much do I earn per referral?',
          answer: 'You earn 500 FUSION tokens per successful referral, plus a 1% APY boost on your staking rewards. Your referrals also get a 250 FUSION bonus!',
        },
        {
          question: 'Is there a referral limit?',
          answer: 'No limit! Refer as many friends as you want. Top referrers get featured on the leaderboard and qualify for exclusive bonus rewards.',
        },
        {
          question: 'How do I track my referrals?',
          answer: 'View your referral count and earnings on your Dashboard. The leaderboard shows top performers and your current rank.',
        },
      ],
    },
    {
      title: 'Staking & Rewards',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-500',
      faqs: [
        {
          question: 'What is the staking APY?',
          answer: 'Base staking APY is 25%. For every referral you make, your APY increases by 1%. With 10 referrals, your APY becomes 35%!',
        },
        {
          question: 'Can I unstake anytime?',
          answer: 'Yes! Fusion uses flexible staking. You can unstake anytime, though we recommend staking for at least 30 days to maximize rewards.',
        },
        {
          question: 'When are rewards distributed?',
          answer: 'Staking rewards are calculated in real-time and distributed automatically to your wallet every 24 hours.',
        },
        {
          question: 'Is there a minimum staking amount?',
          answer: 'The minimum stake is 100 FUSION tokens. There\'s no maximum - stake as much as you want!',
        },
      ],
    },
    {
      title: 'Security & Safety',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-red-500',
      faqs: [
        {
          question: 'Is Fusion Exchange audited?',
          answer: 'Yes! Our smart contracts have been audited by leading security firms. Audit reports are available on our website under "Security".',
        },
        {
          question: 'How do I keep my wallet safe?',
          answer: 'Never share your seed phrase or private keys. Always verify URLs before connecting. Use a hardware wallet for large holdings. Enable 2FA on your wallet app.',
        },
        {
          question: 'What should I do if I suspect a scam?',
          answer: 'Report it immediately to our support team. Never click suspicious links. Our team will NEVER DM you first asking for wallet information.',
        },
        {
          question: 'Are my funds at risk when connected?',
          answer: 'Connecting your wallet only shares your public address - not access to your funds. Only approve transactions you initiate. Review all transaction details before signing.',
        },
      ],
    },
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
              <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about Fusion Exchange, airdrops, staking, and more.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {categories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect border-border/50 overflow-hidden">
                  <div className="p-6 border-b border-border/50">
                    <h2 className={`text-2xl font-bold flex items-center ${category.color}`}>
                      <span className="mr-3">{category.icon}</span>
                      {category.title}
                    </h2>
                  </div>
                  <div className="p-6">
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${i}-${index}`}
                          className="glass-effect border-border/30 rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-semibold pr-4">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="gradient-card border-primary/20 p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Still Have Questions?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our support team is here to help 24/7. Join our Discord community or reach out directly.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://discord.gg/fusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:glow-effect transition-all"
                >
                  Join Discord
                </a>
                <a
                  href="https://t.me/fusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg glass-effect border border-border/50 hover:border-primary/50 transition-all"
                >
                  Telegram Community
                </a>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
