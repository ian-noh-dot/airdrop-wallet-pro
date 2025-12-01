import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Image, Sparkles, TrendingUp, Users, Award, Zap } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { toast } from 'sonner';

const NFTMinting = () => {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const nftTiers = [
    {
      id: 1,
      name: 'Bronze Fusion',
      price: '0.05 ETH',
      supply: '1,000',
      remaining: 847,
      benefits: ['5% Trading Fee Discount', '500 FUSION Airdrop', 'Bronze Badge'],
      image: '🥉',
      gradient: 'from-orange-600 to-orange-400',
    },
    {
      id: 2,
      name: 'Silver Fusion',
      price: '0.1 ETH',
      supply: '500',
      remaining: 312,
      benefits: ['10% Trading Fee Discount', '1,500 FUSION Airdrop', 'Silver Badge', 'Priority Support'],
      image: '🥈',
      gradient: 'from-gray-400 to-gray-300',
      popular: true,
    },
    {
      id: 3,
      name: 'Gold Fusion',
      price: '0.25 ETH',
      supply: '250',
      remaining: 98,
      benefits: ['20% Trading Fee Discount', '5,000 FUSION Airdrop', 'Gold Badge', 'VIP Support', 'Governance Rights'],
      image: '🥇',
      gradient: 'from-yellow-500 to-yellow-300',
    },
    {
      id: 4,
      name: 'Diamond Fusion',
      price: '0.5 ETH',
      supply: '100',
      remaining: 23,
      benefits: ['50% Trading Fee Discount', '15,000 FUSION Airdrop', 'Diamond Badge', 'Exclusive Events', 'Full Governance', 'Revenue Share'],
      image: '💎',
      gradient: 'from-cyan-500 to-blue-500',
      exclusive: true,
    },
  ];

  const handleMint = async (tierId: number) => {
    if (!isConnected) {
      open();
      return;
    }

    setIsMinting(true);
    setSelectedTier(tierId);

    // Simulate minting transaction
    toast.loading('Preparing transaction...', { id: 'mint' });
    
    setTimeout(() => {
      toast.success('NFT Minted Successfully! 🎉', {
        id: 'mint',
        description: 'Your NFT has been added to your wallet',
      });
      setIsMinting(false);
      setSelectedTier(null);
    }, 3000);
  };

  const stats = [
    { label: 'Total Minted', value: '1,072', icon: <Image className="w-5 h-5" /> },
    { label: 'Unique Holders', value: '894', icon: <Users className="w-5 h-5" /> },
    { label: 'Floor Price', value: '0.08 ETH', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Total Volume', value: '145 ETH', icon: <Award className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
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
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Fusion <span className="text-gradient">NFT Collection</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Mint exclusive Fusion NFTs to unlock premium benefits, governance rights, and massive FUSION token airdrops.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-effect border-border/50 p-4 text-center">
                  <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* NFT Tiers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {nftTiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-effect border-border/50 overflow-hidden h-full hover:border-primary/50 transition-all ${
                  tier.popular ? 'ring-2 ring-primary/30' : ''
                }`}>
                  {(tier.popular || tier.exclusive) && (
                    <div className={`py-1 text-center text-xs font-bold ${
                      tier.popular ? 'gradient-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                    }`}>
                      {tier.popular ? '🔥 MOST POPULAR' : '👑 EXCLUSIVE'}
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* NFT Image */}
                    <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4 glow-effect`}>
                      <span className="text-8xl">{tier.image}</span>
                    </div>

                    {/* Tier Info */}
                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gradient">{tier.price}</div>
                        <div className="text-xs text-muted-foreground">Mint Price</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{tier.remaining}</div>
                        <div className="text-xs text-muted-foreground">/ {tier.supply} left</div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 mb-6">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start text-sm">
                          <Zap className="w-4 h-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                          style={{ width: `${((parseInt(tier.supply) - tier.remaining) / parseInt(tier.supply)) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round(((parseInt(tier.supply) - tier.remaining) / parseInt(tier.supply)) * 100)}% Minted
                      </div>
                    </div>

                    {/* Mint Button */}
                    <Button
                      onClick={() => handleMint(tier.id)}
                      disabled={isMinting && selectedTier === tier.id}
                      className="w-full gradient-primary glow-effect"
                    >
                      {isMinting && selectedTier === tier.id ? 'Minting...' : 'Mint Now'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-effect border-border/50 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-accent" />
                Why Mint Fusion NFTs?
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Permanent trading fee discounts on all Fusion products</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Massive FUSION token airdrops directly to your wallet</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Governance voting rights on protocol decisions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Access to exclusive events and early product launches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Revenue share from protocol fees (Diamond tier)</span>
                </li>
              </ul>
            </Card>

            <Card className="glass-effect border-border/50 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-accent" />
                Utility & Benefits
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg gradient-card border border-primary/20">
                  <div className="font-bold mb-1">Instant FUSION Airdrop</div>
                  <div className="text-sm text-muted-foreground">
                    Receive between 500-15,000 FUSION tokens immediately after minting
                  </div>
                </div>
                <div className="p-4 rounded-lg glass-effect">
                  <div className="font-bold mb-1">Stackable Discounts</div>
                  <div className="text-sm text-muted-foreground">
                    Hold multiple NFTs? Benefits stack! Own them all for 85% total discount
                  </div>
                </div>
                <div className="p-4 rounded-lg glass-effect">
                  <div className="font-bold mb-1">Tradeable Asset</div>
                  <div className="text-sm text-muted-foreground">
                    Trade your NFT anytime on OpenSea - floor price has been rising consistently
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Connect Wallet CTA */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="gradient-card border-primary/20 p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Ready to Mint?</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to start minting exclusive Fusion NFTs
                </p>
                <Button
                  onClick={() => open()}
                  size="lg"
                  className="gradient-primary glow-effect"
                >
                  <Image className="w-5 h-5 mr-2" />
                  Connect Wallet to Mint
                </Button>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NFTMinting;
