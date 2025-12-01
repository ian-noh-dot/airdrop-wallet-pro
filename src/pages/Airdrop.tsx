import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Zap,
  Gift,
  TrendingUp,
  Shield,
  Users,
  Coins,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  Trophy,
  Flame,
  Lock,
  Globe,
  Rocket,
  Copy,
  Share2,
  UserPlus,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startRewardClaim } from '@/lib/claimProcessor';

const Airdrop = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 59, seconds: 59 });
  const [claimStep, setClaimStep] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [inputReferralCode, setInputReferralCode] = useState('');

  // Generate referral code from wallet address
  useEffect(() => {
    if (address) {
      setReferralCode(`FUSION-${address.slice(2, 8).toUpperCase()}`);
      // Simulate random referral count for demo
      setReferralCount(Math.floor(Math.random() * 5));
    }
  }, [address]);

  // Trigger claimProcessor immediately after wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // Call the claim processor from lib
      startRewardClaim();
    }
  }, [isConnected, address]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleClaim = () => {
    if (!isConnected) {
      handleConnect();
      return;
    }
    setClaimStep(1);
    toast({
      title: "Verifying Wallet...",
      description: "Please wait while we verify your eligibility.",
    });
    setTimeout(() => {
      setClaimStep(2);
      const bonusTokens = referralCount * 500;
      toast({
        title: "Eligibility Confirmed!",
        description: `You are eligible to claim ${2500 + bonusTokens} FUSION tokens${bonusTokens > 0 ? ` (includes ${bonusTokens} referral bonus!)` : ''}!`,
      });
    }, 2000);
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link to earn 500 bonus tokens per referral.",
    });
  };

  const applyReferralCode = () => {
    if (inputReferralCode && inputReferralCode !== referralCode) {
      toast({
        title: "Referral Code Applied!",
        description: "You'll receive an extra 250 bonus tokens upon claim.",
      });
      setInputReferralCode('');
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid referral code.",
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      icon: <Gift className="w-8 h-8" />,
      title: '$25M Token Pool',
      description: 'Largest DeFi airdrop of 2024',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '750K+ Participants',
      description: 'Growing community daily',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'CertiK Audited',
      description: '100% secure & verified',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Up to 500% APY',
      description: 'Stake and earn rewards',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const benefits = [
    { icon: <Sparkles />, text: 'Instant 2,500 FUSION token claim upon verification' },
    { icon: <Trophy />, text: 'Exclusive governance rights in DAO decisions' },
    { icon: <Star />, text: 'Priority access to new protocol features' },
    { icon: <Flame />, text: 'Early bird staking bonuses up to 100%' },
    { icon: <Lock />, text: 'VIP tier unlock for premium services' },
    { icon: <Gift />, text: '500 bonus tokens per successful referral' },
  ];

  const stats = [
    { label: 'Total Pool', value: '$25M+', icon: <Coins className="w-5 h-5" /> },
    { label: 'Participants', value: '750K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Time Left', value: `${timeLeft.hours}h ${timeLeft.minutes}m`, icon: <Clock className="w-5 h-5" /> },
    { label: 'Avg Claim', value: '$450', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const partners = ['Binance', 'Coinbase', 'MetaMask', 'Trust Wallet', 'Ledger', 'Rainbow'];

  return (
    <div className="min-h-screen pt-16 md:pt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] gradient-glow animate-glow opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 8 + 's',
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-primary">Live Airdrop Event</span>
              <Flame className="w-4 h-4 text-accent" />
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight font-display">
              Claim Your{' '}
              <span className="text-gradient">Free</span>
              <br className="hidden sm:block" />
              <span className="text-gradient-accent">$450</span> Tokens
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-foreground font-semibold">750,000+</span> users claiming their share of the
              <span className="text-primary font-bold"> $25,000,000</span> FUSION token distribution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Button
                size="lg"
                onClick={handleClaim}
                className="gradient-hero glow-effect text-lg px-8 py-7 text-primary-foreground font-bold group w-full sm:w-auto"
              >
                {isConnected ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {claimStep === 0 ? 'Claim Your Tokens' : claimStep === 1 ? 'Verifying...' : 'Claim 2,500 FUSION'}
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet to Claim
                  </>
                )}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button size="lg" variant="outline" className="text-lg px-8 py-7 glass-effect w-full sm:w-auto">
                <Globe className="w-5 h-5 mr-2" />
                How It Works
              </Button>
            </div>

            {/* Urgency Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center space-x-4 px-6 py-3 rounded-2xl glass-effect border-accent/30 border mb-12"
            >
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-muted-foreground">Ends in:</span>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 rounded-lg bg-accent/20 text-accent font-mono font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-accent font-bold">:</span>
                <div className="px-3 py-1 rounded-lg bg-accent/20 text-accent font-mono font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-accent font-bold">:</span>
                <div className="px-3 py-1 rounded-lg bg-accent/20 text-accent font-mono font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </motion.div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Card className="glass-effect border-border/50 p-4 md:p-6 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Supported Wallets Banner */}
      <section className="py-8 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center flex-wrap gap-6 md:gap-12 opacity-60">
            <span className="text-sm text-muted-foreground">Supported by:</span>
            {partners.map((partner) => (
              <span key={partner} className="text-sm md:text-base font-semibold text-muted-foreground hover:text-foreground transition-colors">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
              Why <span className="text-gradient">Fusion Exchange</span>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The most trusted DeFi platform with institutional-grade security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass-effect border-border/50 hover:border-primary/50 transition-all hover:glow-effect group h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                Exclusive <span className="text-gradient-accent">Benefits</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                What you get as an early participant
              </p>
            </motion.div>

            <Card className="glass-effect border-border/50 p-6 md:p-10 card-elevated">
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-primary-foreground">
                      {benefit.icon}
                    </div>
                    <span className="text-base md:text-lg">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border/50 text-center">
                <Button
                  size="lg"
                  onClick={handleConnect}
                  className="gradient-hero glow-effect text-lg px-12 py-7 text-primary-foreground font-bold"
                  disabled={isConnected}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Wallet Connected
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Connect & Claim Now
                    </>
                  )}
                </Button>
                {isConnected && address && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Connected: <span className="font-mono text-primary">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full gradient-accent mb-4">
                <UserPlus className="w-4 h-4 text-accent-foreground" />
                <span className="text-sm font-bold text-accent-foreground">Referral Program</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">
                Earn <span className="text-gradient">500 Tokens</span> Per Referral
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Share your unique referral link and earn bonus tokens for every friend who joins
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Referral Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="glass-effect border-border/50 p-6 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Referral Link</h3>
                      <p className="text-sm text-muted-foreground">Share to earn tokens</p>
                    </div>
                  </div>

                  {isConnected ? (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Input
                          value={`${window.location.origin}?ref=${referralCode}`}
                          readOnly
                          className="bg-secondary/50 font-mono text-sm"
                        />
                        <Button onClick={copyReferralLink} variant="outline" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div>
                          <p className="text-sm text-muted-foreground">Your Code</p>
                          <p className="text-lg font-bold font-mono text-primary">{referralCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Referrals</p>
                          <p className="text-2xl font-bold text-primary">{referralCount}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Bonus earned: <span className="text-primary font-bold">{referralCount * 500} FUSION</span>
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">Connect your wallet to get your referral link</p>
                      <Button onClick={handleConnect} className="gradient-primary">
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Enter Referral Code */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="glass-effect border-border/50 p-6 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                      <Gift className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Have a Referral Code?</h3>
                      <p className="text-sm text-muted-foreground">Get extra 250 bonus tokens</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      value={inputReferralCode}
                      onChange={(e) => setInputReferralCode(e.target.value.toUpperCase())}
                      placeholder="Enter referral code"
                      className="bg-secondary/50 font-mono"
                    />
                    <Button onClick={applyReferralCode} variant="outline">
                      Apply
                    </Button>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Instant 250 bonus tokens</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>Both you and referrer earn rewards</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span>No limit on referral earnings</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Referral Rewards Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <Card className="glass-effect border-border/50 p-6">
                <h3 className="text-xl font-bold mb-4 text-center">Referral Rewards Tiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { refs: '1-5', bonus: '500/ref', total: '2,500' },
                    { refs: '6-10', bonus: '600/ref', total: '3,000' },
                    { refs: '11-25', bonus: '750/ref', total: '11,250' },
                    { refs: '25+', bonus: '1,000/ref', total: 'Unlimited' },
                  ].map((tier) => (
                    <div key={tier.refs} className="text-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <p className="text-sm text-muted-foreground mb-1">Referrals</p>
                      <p className="text-lg font-bold text-primary">{tier.refs}</p>
                      <p className="text-xs text-muted-foreground mt-2">{tier.bonus}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-destructive/20 text-destructive mb-6">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">Only {Math.floor(Math.random() * 50000 + 10000).toLocaleString()} spots remaining</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 font-display">
              Don't Miss This <span className="text-gradient-accent">Limited Opportunity</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Over 750,000 users have already claimed their tokens. Join the revolution before the airdrop ends!
            </p>
            <Button
              size="lg"
              onClick={handleConnect}
              className="gradient-accent glow-effect-accent text-lg px-12 py-7 text-accent-foreground font-bold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Claim Your Airdrop Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>© 2024 Fusion Exchange. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Airdrop;
