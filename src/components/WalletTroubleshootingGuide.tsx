import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Smartphone,
  Monitor,
  Globe,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  QrCode,
} from 'lucide-react';

interface WalletTroubleshootingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletTroubleshootingGuide = ({ isOpen, onClose }: WalletTroubleshootingGuideProps) => {
  const walletIssues = [
    {
      wallet: 'Phantom',
      icon: '👻',
      platform: 'Mobile',
      issue: 'Not Detected',
      solution: 'Phantom on mobile only works inside the Phantom app browser',
      steps: [
        'Open your Phantom wallet app',
        'Tap the browser icon (🌐) at the bottom',
        'Enter our website URL in the address bar',
        'Connect your wallet from within Phantom',
      ],
      tip: 'Phantom cannot be detected from Safari or Chrome on mobile - you MUST use the in-app browser!',
      color: 'from-purple-500 to-violet-500',
    },
    {
      wallet: 'Coinbase Wallet',
      icon: '🔵',
      platform: 'Mobile & Desktop',
      issue: '"Declined" Error',
      solution: 'Use WalletConnect for reliable connection',
      steps: [
        'Click "Connect Wallet" on our site',
        'Select "WalletConnect" option (not Coinbase directly)',
        'Scan the QR code with Coinbase Wallet app',
        'Approve the connection in your app',
      ],
      tip: 'WalletConnect works universally and is more reliable than direct connection on mobile.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      wallet: 'Trust Wallet',
      icon: '🛡️',
      platform: 'Mobile',
      issue: 'Not Connecting',
      solution: 'Use Trust Wallet\'s built-in DApp browser',
      steps: [
        'Open Trust Wallet app',
        'Tap "Browser" tab at the bottom',
        'Navigate to our website URL',
        'Tap "Connect Wallet" and approve',
      ],
      tip: 'Trust Wallet mobile requires using its DApp browser for full functionality.',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      wallet: 'Binance Web3',
      icon: '💛',
      platform: 'Mobile (Binance App)',
      issue: 'Wallet Not Found',
      solution: 'Create a Web3 wallet inside Binance first',
      steps: [
        'Open the Binance app',
        'Go to "Wallets" → "Web3"',
        'Create a new Web3 wallet if you haven\'t',
        'Use Binance\'s built-in DApp browser to visit our site',
      ],
      tip: 'Binance Web3 Wallet must be created BEFORE you can connect. It\'s separate from your exchange wallet!',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      wallet: 'MetaMask',
      icon: '🦊',
      platform: 'Desktop & Mobile',
      issue: 'Connection Rejected',
      solution: 'Check browser extension or use mobile app',
      steps: [
        'Make sure MetaMask extension is installed and unlocked',
        'Check you\'re on the correct network (Ethereum, BSC, etc.)',
        'If on mobile, use MetaMask\'s built-in browser',
        'Try refreshing the page and connecting again',
      ],
      tip: 'On desktop, check the MetaMask extension icon - it should show a notification if connection is pending.',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  const generalTips = [
    {
      icon: <QrCode className="w-5 h-5" />,
      title: 'Use WalletConnect for Two Devices',
      desc: 'Have a laptop and phone? Click WalletConnect, scan the QR with your mobile wallet, and connect instantly!',
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: 'Mobile Users: Use In-App Browsers',
      desc: 'Most mobile wallets require you to access DApps through their built-in browser, not Safari/Chrome.',
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      title: 'Desktop: Check Extension',
      desc: 'Make sure your wallet extension is installed, unlocked, and you\'re signed in.',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Wallet Connection Troubleshooting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Important Notice */}
          <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-500 mb-1">Important for Mobile Users!</p>
                <p className="text-sm text-muted-foreground">
                  Most wallet issues on mobile happen because you're using Safari/Chrome instead of your wallet's 
                  built-in browser. Always open DApps from INSIDE your wallet app!
                </p>
              </div>
            </div>
          </Card>

          {/* General Tips */}
          <div className="grid md:grid-cols-3 gap-4">
            {generalTips.map((tip, i) => (
              <Card key={i} className="glass-effect p-4">
                <div className="text-primary mb-2">{tip.icon}</div>
                <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </Card>
            ))}
          </div>

          {/* Wallet-Specific Solutions */}
          <div>
            <h3 className="text-lg font-bold mb-4">Wallet-Specific Solutions</h3>
            <div className="space-y-4">
              {walletIssues.map((wallet, index) => (
                <motion.div
                  key={wallet.wallet}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-effect border-border/50 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Header */}
                      <div className="md:w-1/3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{wallet.icon}</span>
                          <div>
                            <h4 className="font-bold">{wallet.wallet}</h4>
                            <p className="text-xs text-muted-foreground">{wallet.platform}</p>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {wallet.issue}
                        </div>
                      </div>

                      {/* Solution */}
                      <div className="md:w-2/3">
                        <p className="text-sm font-medium text-primary mb-2">{wallet.solution}</p>
                        <ol className="space-y-1 mb-3">
                          {wallet.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ol>
                        <div className="p-2 rounded bg-primary/10 text-xs">
                          <span className="font-semibold text-primary">💡 Tip: </span>
                          <span className="text-muted-foreground">{wallet.tip}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Still Having Issues? */}
          <Card className="glass-effect border-primary/30 p-6 text-center">
            <h3 className="font-bold mb-2">Still Having Issues?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try using WalletConnect - it works with any wallet and any device combination!
            </p>
            <Button onClick={onClose} className="gradient-primary glow-effect">
              <Globe className="w-4 h-4 mr-2" />
              Connect with WalletConnect
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletTroubleshootingGuide;
