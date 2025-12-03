import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const STORAGE_KEY = 'fusion_live_stats';
const LAST_VISIT_KEY = 'fusion_last_visit';

const getStoredStats = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  const now = Date.now();
  
  if (stored && lastVisit) {
    const parsed = JSON.parse(stored);
    const timeDiff = now - parseInt(lastVisit);
    const hoursAway = timeDiff / (1000 * 60 * 60);
    
    // Increase stats based on time away (simulates growth)
    return {
      tvl: parsed.tvl + Math.floor(hoursAway * 50000) + Math.floor(Math.random() * 100000),
      users: parsed.users + Math.floor(hoursAway * 50) + Math.floor(Math.random() * 100),
      rewards: parsed.rewards + Math.floor(hoursAway * 5000) + Math.floor(Math.random() * 10000),
      apy: 500,
    };
  }
  
  // First visit - generate initial stats
  return {
    tvl: 127800000 + Math.floor(Math.random() * 5000000),
    users: 524891 + Math.floor(Math.random() * 5000),
    rewards: 8940000 + Math.floor(Math.random() * 500000),
    apy: 500,
  };
};

const LiveStats = () => {
  const [stats, setStats] = useState(getStoredStats);
  const [isLoading, setIsLoading] = useState(true);

  // Load and persist stats
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate live updates and persist to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const newStats = {
          tvl: prev.tvl + Math.floor(Math.random() * 15000) + 1000,
          users: prev.users + Math.floor(Math.random() * 3) + 1,
          rewards: prev.rewards + Math.floor(Math.random() * 2000) + 500,
          apy: 500,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        localStorage.setItem(LAST_VISIT_KEY, Date.now().toString());
        return newStats;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statItems = [
    { label: 'Total Value Locked', value: formatNumber(stats.tvl), icon: <DollarSign className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Active Users', value: stats.users.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Rewards Distributed', value: formatNumber(stats.rewards), icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Maximum APY', value: `${stats.apy}%`, icon: <Percent className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-effect rounded-xl p-4 md:p-6 text-center">
            <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-3" />
            <Skeleton className="h-8 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-effect rounded-xl p-4 md:p-6 text-center relative overflow-hidden group"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-3 text-white`}>
            {stat.icon}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-2xl md:text-3xl font-bold mb-1"
            >
              {stat.value}
            </motion.div>
          </AnimatePresence>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
};

export default LiveStats;
