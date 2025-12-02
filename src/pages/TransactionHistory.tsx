import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  Filter, 
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet
} from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const TransactionHistory = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [filter, setFilter] = useState('all');

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const transactions = [
    {
      id: '0x1234...5678',
      type: 'claim',
      description: 'FUSION Airdrop Claim',
      amount: '+2,500 FUSION',
      value: '$450.00',
      status: 'completed',
      time: '2 hours ago',
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: '0x8765...4321',
      type: 'stake',
      description: 'Stake FUSION (90 days)',
      amount: '-1,000 FUSION',
      value: '$180.00',
      status: 'completed',
      time: '5 hours ago',
      icon: <ArrowUpRight className="w-4 h-4" />,
    },
    {
      id: '0x9876...1234',
      type: 'swap',
      description: 'Swap ETH → FUSION',
      amount: '+500 FUSION',
      value: '$90.00',
      status: 'completed',
      time: '1 day ago',
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: '0x4321...8765',
      type: 'referral',
      description: 'Referral Bonus',
      amount: '+500 FUSION',
      value: '$90.00',
      status: 'completed',
      time: '2 days ago',
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: '0x5678...4321',
      type: 'withdraw',
      description: 'Unstake FUSION',
      amount: '+1,500 FUSION',
      value: '$270.00',
      status: 'pending',
      time: '3 days ago',
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      id: '0x6789...1234',
      type: 'nft',
      description: 'NFT Mint - Silver Fusion',
      amount: '-0.1 ETH',
      value: '$250.00',
      status: 'completed',
      time: '5 days ago',
      icon: <ArrowUpRight className="w-4 h-4" />,
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'claim', label: 'Claims' },
    { id: 'stake', label: 'Stakes' },
    { id: 'swap', label: 'Swaps' },
    { id: 'referral', label: 'Referrals' },
  ];

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return '';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-12 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <History className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Transaction <span className="text-gradient">History</span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connect your wallet to view your transaction history, claims, stakes, and rewards
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
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold font-display">
                Transaction <span className="text-gradient">History</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                View all your activities on Fusion Exchange
              </p>
            </div>
            <Button variant="outline" className="glass-effect">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card className="glass-effect border-border/50 p-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {filters.map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.id)}
                  className={filter === f.id ? "gradient-primary" : ""}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Transactions List */}
          <Card className="glass-effect border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.amount.startsWith('+') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {tx.icon}
                        </div>
                        <div>
                          <div className="font-semibold">{tx.description}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-mono">{tx.id}</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {tx.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">{tx.value}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        <span className="ml-1 capitalize">{tx.status}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{tx.time}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>

          {/* Load More */}
          <div className="text-center mt-6">
            <Button variant="outline" className="glass-effect">
              Load More Transactions
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionHistory;
