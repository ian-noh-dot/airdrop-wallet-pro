import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, Download, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface WalletGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletGuide = ({ isOpen, onClose }: WalletGuideProps) => {
  if (!isOpen) return null;

  const wallets = [
    {
      name: 'MetaMask',
      description: 'Most popular browser wallet',
      icon: '🦊',
      steps: [
        'Install MetaMask extension from metamask.io',
        'Create a new wallet or import existing one',
        'Secure your secret recovery phrase',
        'Click "Connect Wallet" button and select MetaMask',
      ],
      downloadUrl: 'https://metamask.io/download/',
      difficulty: 'Beginner Friendly'
    },
    {
      name: 'Trust Wallet',
      description: 'Mobile-first wallet app',
      icon: '🛡️',
      steps: [
        'Download Trust Wallet app from app store',
        'Create a new wallet in the app',
        'Save your recovery phrase securely',
        'Open browser in app, visit our site, and connect',
      ],
      downloadUrl: 'https://trustwallet.com/download',
      difficulty: 'Beginner Friendly'
    },
    {
      name: 'Binance Web3 Wallet',
      description: 'Integrated with Binance',
      icon: '🔶',
      steps: [
        'Create a Binance account if you don\'t have one',
        'Go to Binance app > Web3 Wallet',
        'Create a Web3 wallet within Binance',
        'Use WalletConnect to connect to our platform',
      ],
      downloadUrl: 'https://www.binance.com/en/web3wallet',
      difficulty: 'Requires Binance Account'
    },
    {
      name: 'Coinbase Wallet',
      description: 'Easy and secure',
      icon: '💙',
      steps: [
        'Download Coinbase Wallet app',
        'Create a new wallet',
        'Back up your recovery phrase',
        'Scan QR code or use WalletConnect to connect',
      ],
      downloadUrl: 'https://www.coinbase.com/wallet',
      difficulty: 'Beginner Friendly'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="glass-effect border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-display flex items-center">
                <Wallet className="w-6 h-6 mr-2 text-primary" />
                How to Connect Your Wallet
              </h2>
              <p className="text-muted-foreground mt-1">Step-by-step guide for beginners</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Important Notice */}
            <Card className="bg-primary/5 border-primary/20 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">Important Security Tips:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Never share your recovery phrase with anyone</li>
                    <li>• Store your recovery phrase in a safe place offline</li>
                    <li>• Always verify the website URL before connecting</li>
                    <li>• Only download wallets from official sources</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Wallet Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {wallets.map((wallet, index) => (
                <motion.div
                  key={wallet.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-border/50 p-5 h-full hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{wallet.icon}</div>
                        <div>
                          <h3 className="font-bold">{wallet.name}</h3>
                          <p className="text-xs text-muted-foreground">{wallet.description}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {wallet.difficulty}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {wallet.steps.map((step, i) => (
                        <div key={i} className="flex items-start space-x-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(wallet.downloadUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {wallet.name}
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Start */}
            <Card className="gradient-card border-primary/20 p-5">
              <h3 className="font-bold mb-3 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Quick Start (Recommended for Beginners)
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="font-bold text-primary mr-2">1.</span>
                  Download MetaMask extension (easiest option for desktop users)
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-primary mr-2">2.</span>
                  Create a new wallet and save your 12-word recovery phrase securely
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-primary mr-2">3.</span>
                  Return to this page and click the "Connect Wallet" button
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-primary mr-2">4.</span>
                  Select MetaMask from the wallet list and approve the connection
                </li>
              </ol>
            </Card>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={onClose}
                className="gradient-primary glow-effect"
              >
                Got it! Let me connect
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default WalletGuide;
