import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import {
  Users,
  Copy,
  Share2,
  Trophy,
  Gift,
  TrendingUp,
  Star,
  Medal,
  Crown,
  Zap
} from 'lucide-react';
import { TableSkeleton } from './LoadingSkeletons';

interface LeaderboardEntry {
  rank: number;
  address: string;
  referrals: number;
  earnings: number;
}

const ReferralDashboard = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pendingRewards: 0,
    claimedRewards: 0,
    rank: 0
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      if (address) {
        setReferralCode(`FUSION-${address.slice(2, 8).toUpperCase()}`);
        
        // Load or generate stats from localStorage
        const savedStats = localStorage.getItem(`referral_${address}`);
        if (savedStats) {
          setReferralStats(JSON.parse(savedStats));
        } else {
          const newStats = {
            totalReferrals: Math.floor(Math.random() * 10),
            pendingRewards: Math.floor(Math.random() * 2500),
            claimedRewards: Math.floor(Math.random() * 1000),
            rank: Math.floor(Math.random() * 1000) + 100
          };
          setReferralStats(newStats);
          localStorage.setItem(`referral_${address}`, JSON.stringify(newStats));
        }
      }

      // Generate leaderboard
      const topReferrers: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        referrals: Math.floor(Math.random() * 500) + (500 - i * 40),
        earnings: Math.floor(Math.random() * 25000) + (25000 - i * 2000)
      }));
      setLeaderboard(topReferrers);
    }, 1500);

    return () => clearTimeout(timer);
  }, [address]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Share to earn 500 FUSION per referral",
    });
  };

  const shareOnTwitter = () => {
    const text = `🚀 Join me on Fusion Exchange and claim FREE tokens!\n\nUse my referral code: ${referralCode}\n\n💰 Get 2,500 FUSION tokens + bonus rewards!\n\n`;
    const url = `${window.location.origin}?ref=${referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Star className="w-4 h-4 text-muted-foreground" />;
  };

  const statCards = [
    {
      label: 'Total Referrals',
      value: referralStats.totalReferrals,
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Pending Rewards',
      value: `${referralStats.pendingRewards} FUSION`,
      icon: <Gift className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Claimed Rewards',
      value: `${referralStats.claimedRewards} FUSION`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Your Rank',
      value: `#${referralStats.rank}`,
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  if (!isConnected) {
    return (
      <Card className="glass-effect p-8 text-center">
        <Users className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Connect to View Referrals</h3>
        <p className="text-muted-foreground">Connect your wallet to access your referral dashboard</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Referral Link Section */}
      <Card className="glass-effect p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Your Referral Link</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={`${window.location.origin}?ref=${referralCode}`}
            readOnly
            className="flex-1 bg-secondary/50 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={copyReferralLink} className="gradient-primary">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={shareOnTwitter} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-3">
          Earn <span className="text-primary font-bold">500 FUSION</span> for each friend who claims their tokens!
        </p>
      </Card>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-effect p-4 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-secondary mb-3" />
              <div className="h-6 w-16 bg-secondary rounded mb-2" />
              <div className="h-4 w-24 bg-secondary rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-effect p-4 hover:border-primary/30 transition-all group">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <Card className="glass-effect p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold">Top Referrers</h3>
          </div>
          <span className="text-sm text-muted-foreground">Updated live</span>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  entry.rank <= 3 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm">{entry.address}</div>
                  <div className="text-xs text-muted-foreground">{entry.referrals} referrals</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{entry.earnings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">FUSION</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ReferralDashboard;
