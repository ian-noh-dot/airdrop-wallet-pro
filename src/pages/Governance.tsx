import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Vote, Users, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { startRewardClaim } from '@/lib/claimProcessor';

const Governance = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();

  // Trigger claimProcessor after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      startRewardClaim();
    }
  }, [isConnected, address]);

  const proposals = [
    {
      id: 'FIP-12',
      title: 'Increase Staking Rewards Pool by 25%',
      status: 'active',
      votes: { for: 2450000, against: 320000 },
      endTime: '2 days left',
      description: 'Proposal to increase the staking rewards pool allocation...'
    },
    {
      id: 'FIP-11',
      title: 'Add AVAX/USDT Trading Pair',
      status: 'passed',
      votes: { for: 3100000, against: 180000 },
      endTime: 'Ended',
      description: 'Integration of Avalanche network trading pair...'
    },
    {
      id: 'FIP-10',
      title: 'Reduce Swap Fees to 0.2%',
      status: 'active',
      votes: { for: 1800000, against: 950000 },
      endTime: '5 days left',
      description: 'Proposal to reduce swap fees across all pairs...'
    },
    {
      id: 'FIP-09',
      title: 'Treasury Diversification Strategy',
      status: 'rejected',
      votes: { for: 890000, against: 2100000 },
      endTime: 'Ended',
      description: 'Diversify treasury holdings into stablecoins...'
    },
  ];

  const stats = [
    { label: 'Total Proposals', value: '12', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Active Votes', value: '2', icon: <Vote className="w-5 h-5" /> },
    { label: 'Voters', value: '15.2K', icon: <Users className="w-5 h-5" /> },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>;
      case 'passed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Passed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return null;
    }
  };

  const calculatePercentage = (forVotes: number, againstVotes: number) => {
    const total = forVotes + againstVotes;
    return Math.round((forVotes / total) * 100);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">Governance</h1>
              <p className="text-muted-foreground mt-1">Vote on protocol decisions</p>
            </div>
            <Button className="gradient-primary glow-effect">
              Create Proposal
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="glass-effect p-4 text-center">
                <div className="flex justify-center mb-2 text-primary">{stat.icon}</div>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Voting Power */}
          {isConnected && (
            <Card className="glass-effect border-primary/30 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Your Voting Power</div>
                  <div className="text-2xl font-bold text-gradient">0 FUSION</div>
                </div>
                <Button variant="outline" className="border-primary/50">
                  Delegate Votes
                </Button>
              </div>
            </Card>
          )}

          {/* Proposals */}
          <div className="space-y-4">
            {proposals.map((proposal, i) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect border-border/50 p-5 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-primary">{proposal.id}</span>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <h3 className="font-semibold text-lg">{proposal.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {proposal.endTime}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                  {/* Vote Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        For: {(proposal.votes.for / 1000000).toFixed(1)}M
                      </div>
                      <div className="flex items-center text-red-500">
                        Against: {(proposal.votes.against / 1000000).toFixed(1)}M
                        <XCircle className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${calculatePercentage(proposal.votes.for, proposal.votes.against)}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {calculatePercentage(proposal.votes.for, proposal.votes.against)}% approval
                    </div>
                  </div>

                  {proposal.status === 'active' && (
                    <div className="flex space-x-3 mt-4">
                      <Button
                        className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        onClick={() => !isConnected && open()}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        onClick={() => !isConnected && open()}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {!isConnected && (
            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="gradient-primary glow-effect"
                onClick={() => open()}
              >
                Connect Wallet to Vote
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Governance;
