import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Wallet,
  RefreshCw,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { isMobile, isIOS, isAndroid, getWalletName, getMobileDeepLink } from '@/config/web3';

interface MobileWalletHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  walletError?: string;
}

const MobileWalletHelper = ({ isOpen, onClose, onRetry, walletError }: MobileWalletHelperProps) => {
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);

  useEffect(() => {
    setCurrentWallet(getWalletName());
  }, [isOpen]);

  const walletGuides = [
    {
      name: 'MetaMask',
      icon: '🦊',
      color: 'from-orange-500 to-amber-500',
      steps: [
        'Open MetaMask app',
        'Tap the browser icon at bottom',
        'Enter this site URL',
        'Connect when prompted',
      ],
      deepLink: getMobileDeepLink('metamask'),
    },
    {
      name: 'Trust Wallet',
      icon: '🛡️',
      color: 'from-blue-500 to-cyan-500',
      steps: [
        'Open Trust Wallet app',
        'Go to Browser (DApps)',
        'Enter this site URL',
        'Approve connection',
      ],
      deepLink: getMobileDeepLink('trust'),
    },
    {
      name: 'Coinbase',
      icon: '💰',
      color: 'from-blue-600 to-blue-400',
      steps: [
        'If seeing "Declined" error - this is normal',
        'Use WalletConnect option instead',
        'Scan QR code with Coinbase app',
        'Approve connection in app',
      ],
      deepLink: getMobileDeepLink('coinbase'),
      warning: 'Coinbase often shows "Declined" - use WalletConnect instead!',
    },
    {
      name: 'Phantom',
      icon: '👻',
      color: 'from-purple-500 to-pink-500',
      steps: [
        'Open Phantom app',
        'Tap browser icon (🌐)',
        'Enter this site URL in Phantom browser',
        'Connect when prompted',
      ],
      deepLink: getMobileDeepLink('phantom'),
      warning: 'Phantom ONLY works inside its in-app browser!',
    },
    {
      name: 'Binance',
      icon: '🔶',
      color: 'from-yellow-500 to-orange-500',
      steps: [
        'Open Binance app → Wallets',
        'Select Web3 wallet',
        'Use built-in browser',
        'Navigate to this site',
      ],
      deepLink: getMobileDeepLink('binance'),
      warning: 'You must have Web3 wallet enabled in Binance app first',
    },
  ];

  const generalTips = [
    {
      icon: <RefreshCw className="w-4 h-4" />,
      text: 'If stuck, close wallet app completely and try again',
    },
    {
      icon: <Smartphone className="w-4 h-4" />,
      text: 'Make sure your wallet app is updated to latest version',
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      text: 'Some wallets work best when you open the site FROM the wallet app',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: 'After connecting, you should be automatically returned here',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Mobile Wallet Connection Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {walletError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Connection Issue Detected</p>
                  <p className="text-sm text-muted-foreground mt-1">{walletError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Detected Wallet */}
          {currentWallet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">Detected: {currentWallet}</span>
              </div>
            </motion.div>
          )}

          {/* Wallet Guides */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Quick Guides by Wallet
            </h3>
            
            {walletGuides.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 glass-effect border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${wallet.color} flex items-center justify-center text-xl flex-shrink-0`}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2">{wallet.name}</h4>
                      
                      {wallet.warning && (
                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-2">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⚠️ {wallet.warning}
                          </p>
                        </div>
                      )}

                      <ol className="space-y-1">
                        {wallet.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs flex-shrink-0">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>

                      {wallet.deepLink && isMobile() && (
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => {
                            if (wallet.deepLink) {
                              window.location.href = wallet.deepLink;
                            }
                          }}
                        >
                          Open {wallet.name}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* General Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold">General Tips</h3>
            <div className="grid gap-2">
              {generalTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary">{tip.icon}</span>
                  {tip.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Retry Button */}
          {onRetry && (
            <Button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="w-full gradient-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Connecting Again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileWalletHelper;
