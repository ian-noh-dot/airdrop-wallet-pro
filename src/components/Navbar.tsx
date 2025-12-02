import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Wallet, Zap, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { open } = useWeb3Modal();
  const { open: modalOpen } = useWeb3ModalState();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const formatBalanceValue = (bal: typeof balance) => {
    if (!bal) return '0';
    const value = Number(bal.value) / Math.pow(10, bal.decimals);
    return value.toFixed(4);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Airdrop', badge: 'HOT' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/swap', label: 'Exchange' },
    { path: '/stake', label: 'Stake', badge: '500%' },
    { path: '/bridge', label: 'Bridge', badge: 'NEW' },
    { path: '/nft', label: 'NFT' },
    { path: '/faq', label: 'FAQ' },
  ];

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-effect border-b border-border/50' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center glow-effect"
            >
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-xl md:text-2xl font-bold text-gradient font-display">
                Fusion
              </span>
              <span className="text-xs text-muted-foreground block -mt-1">Exchange</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full gradient-accent text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Language & Wallet Section */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <LanguageSelector />
            {isConnected ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                {/* Chain indicator */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg glass-effect">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">{chain?.name || 'Unknown'}</span>
                </div>

                {/* Balance & Address */}
                <Button
                  variant="outline"
                  onClick={() => open({ view: 'Account' })}
                  className="glass-effect border-primary/30 hover:border-primary/60 hover:glow-effect"
                >
                  <Wallet className="w-4 h-4 mr-2 text-primary" />
                  <span className="hidden sm:inline mr-2 text-muted-foreground">
                    {formatBalanceValue(balance)} {balance?.symbol || 'ETH'}
                  </span>
                  <span className="font-mono text-sm">{formatAddress(address!)}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <Button
                onClick={handleConnect}
                className="gradient-primary glow-effect font-semibold"
                disabled={modalOpen}
              >
                <Wallet className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-effect border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full gradient-accent text-accent-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}

              {isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-border/50"
                >
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDisconnect}
                  >
                    Disconnect Wallet
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
