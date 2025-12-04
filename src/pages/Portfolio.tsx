import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Lock,
  Gift,
  Image,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Portfolio = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Mock portfolio data - in production this would come from blockchain
  const portfolioValue = 12450.67;
  const change24h = 8.45;
  const changePercent = 2.34;

  const holdings = [
    { symbol: 'FUSION', name: 'Fusion Token', amount: 5000, value: 7500, price: 1.50, change: 5.2, color: 'hsl(165, 80%, 45%)' },
    { symbol: 'ETH', name: 'Ethereum', amount: 1.5, value: 3600, price: 2400, change: -1.2, color: 'hsl(200, 85%, 50%)' },
    { symbol: 'BNB', name: 'BNB', amount: 3.2, value: 960, price: 300, change: 2.8, color: 'hsl(45, 100%, 55%)' },
    { symbol: 'USDT', name: 'Tether', amount: 390.67, value: 390.67, price: 1.00, change: 0, color: 'hsl(150, 70%, 45%)' },
  ];

  const stakedAssets = [
    { pool: 'FUSION Staking', amount: 2500, value: 3750, apy: 500, unlockDate: '2025-03-04', daysLeft: 90 },
    { pool: 'ETH-FUSION LP', amount: 100, value: 1200, apy: 120, unlockDate: '2025-02-04', daysLeft: 62 },
  ];

  const nfts = [
    { id: 1, name: 'Fusion Genesis #1234', collection: 'Fusion Genesis', rarity: 'Legendary', floorPrice: 2.5 },
    { id: 2, name: 'Fusion Pioneer #567', collection: 'Fusion Pioneers', rarity: 'Epic', floorPrice: 0.8 },
  ];

  const recentActivity = [
    { type: 'stake', asset: 'FUSION', amount: 1000, time: '2 hours ago' },
    { type: 'swap', asset: 'ETH → FUSION', amount: 0.5, time: '5 hours ago' },
    { type: 'claim', asset: 'Airdrop', amount: 2500, time: '1 day ago' },
    { type: 'bridge', asset: 'FUSION', amount: 500, time: '2 days ago' },
  ];

  const pieData = holdings.map(h => ({ name: h.symbol, value: h.value, color: h.color }));

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center glow-effect">
            <PieChart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4 font-display">Portfolio Tracker</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your complete DeFi portfolio including tokens, staked assets, and NFTs.
          </p>
          <Button onClick={() => open()} className="gradient-primary glow-effect">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display">Portfolio</h1>
            <p className="text-muted-foreground">Track all your DeFi assets in one place</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="glass-effect"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Total Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-effect border-border/50 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="text-muted-foreground mb-2">Total Portfolio Value</p>
                <h2 className="text-4xl md:text-5xl font-bold font-display text-gradient">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
                <div className={`flex items-center mt-2 ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change24h >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  <span className="font-semibold">
                    ${Math.abs(change24h).toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent}%)
                  </span>
                  <span className="text-muted-foreground ml-2">24h</span>
                </div>
              </div>
              <div className="w-full md:w-48 h-48">
                <ResponsiveContainer>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(220, 20%, 8%)', border: 'none', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-effect border-border/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Token Holdings</h3>
              </div>
              <div className="space-y-4">
                {holdings.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: token.color + '30', color: token.color }}
                      >
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${token.value.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-2 text-sm">
                        <span className="text-muted-foreground">{token.amount} {token.symbol}</span>
                        <span className={token.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {token.change >= 0 ? '+' : ''}{token.change}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-effect border-border/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'stake' ? 'bg-purple-500/20 text-purple-500' :
                        activity.type === 'swap' ? 'bg-blue-500/20 text-blue-500' :
                        activity.type === 'claim' ? 'bg-green-500/20 text-green-500' :
                        'bg-orange-500/20 text-orange-500'
                      }`}>
                        {activity.type === 'stake' && <Lock className="w-4 h-4" />}
                        {activity.type === 'swap' && <RefreshCw className="w-4 h-4" />}
                        {activity.type === 'claim' && <Gift className="w-4 h-4" />}
                        {activity.type === 'bridge' && <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{activity.asset}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Staked Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="glass-effect border-border/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Staked Assets</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {stakedAssets.map((stake, index) => (
                <div key={index} className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{stake.pool}</p>
                      <p className="text-sm text-muted-foreground">{stake.amount.toLocaleString()} tokens</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-sm font-bold">
                      {stake.apy}% APY
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value: ${stake.value.toLocaleString()}</span>
                    <span className="text-muted-foreground">{stake.daysLeft} days left</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* NFTs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass-effect border-border/50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Image className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">NFT Collection</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nfts.map((nft) => (
                <div key={nft.id} className="p-4 rounded-xl bg-secondary/50">
                  <div className="w-full aspect-square rounded-lg gradient-primary mb-3 flex items-center justify-center">
                    <Image className="w-12 h-12 text-primary-foreground/50" />
                  </div>
                  <p className="font-semibold text-sm truncate">{nft.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{nft.collection}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-purple-500/20 text-purple-500'
                    }`}>
                      {nft.rarity}
                    </span>
                    <span className="text-xs text-muted-foreground">Floor: {nft.floorPrice} ETH</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;