import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Trophy, Users, Zap, Gift, Star, Crown } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Dashboard = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [referralCount, setReferralCount] = useState(0);

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
      // Simulate random referral count
      setReferralCount(Math.floor(Math.random() * 5));
    }
  }, [isConnected, address]);

  const userStats = [
    { label: 'Total Balance', value: isConnected ? '2,500 FUSION' : '0 FUSION', icon: <Wallet className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Staked Amount', value: '$0.00', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-500' },
    { label: 'Rewards Earned', value: '$0.00', icon: <Trophy className="w-5 h-5" />, color: 'text-accent' },
    { label: 'Referrals', value: isConnected ? referralCount.toString() : '0', icon: <Users className="w-5 h-5" />, color: 'text-blue-500' },
  ];

  // Referral leaderboard data
  const leaderboard = [
    { rank: 1, address: '0x1234...5678', referrals: 47, rewards: '23,500 FUSION' },
    { rank: 2, address: '0x8765...4321', referrals: 35, rewards: '17,500 FUSION' },
    { rank: 3, address: '0x9876...1234', referrals: 28, rewards: '14,000 FUSION' },
    { rank: 4, address: '0x4321...8765', referrals: 22, rewards: '11,000 FUSION' },
    { rank: 5, address: '0x5678...4321', referrals: 18, rewards: '9,000 FUSION' },
    ...(isConnected && address ? [{ rank: 156, address: `${address.slice(0, 6)}...${address.slice(-4)}`, referrals: referralCount, rewards: `${referralCount * 500} FUSION` }] : []),
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Star className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Star className="w-5 h-5 text-orange-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-12 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Wallet className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Connect Your <span className="text-gradient">Wallet</span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connect your wallet to view your dashboard, track your earnings, and see the referral leaderboard
            </p>
            <Button
              size="lg"
              onClick={() => open()}
              className="gradient-primary glow-effect text-lg px-8 py-6"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold font-display mb-2">
              Your <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="text-primary font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {userStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect border-border/50 p-4 md:p-6">
                  <div className={`flex items-center justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl md:text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="glass-effect border-border/50 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button className="w-full" variant="outline">
                <Gift className="w-4 h-4 mr-2" />
                Claim Airdrop
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Stake Tokens
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
              <Button className="w-full" variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                View Rewards
              </Button>
            </div>
          </Card>

          {/* Referral Leaderboard */}
          <Card className="glass-effect border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-accent" />
                  Referral Leaderboard
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Top earners in the referral program</p>
              </div>
              <Button variant="outline" size="sm" className="gradient-primary text-primary-foreground">
                View All
              </Button>
            </div>
            
            <div className="divide-y divide-border/50">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={`${entry.rank}-${entry.address}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors ${
                    isConnected && entry.address.includes(address.slice(0, 6)) ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {getRankBadge(entry.rank)}
                    </div>
                    <div>
                      <div className="font-semibold font-mono">{entry.address}</div>
                      <div className="text-sm text-muted-foreground">{entry.referrals} referrals</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-semibold">{entry.rewards}</div>
                    {isConnected && entry.address.includes(address.slice(0, 6)) && (
                      <Badge className="mt-1 bg-primary/20 text-primary border-primary/30">You</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Badge component fallback
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default Dashboard;
