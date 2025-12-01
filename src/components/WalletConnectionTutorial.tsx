import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle2, AlertCircle, ArrowRight, Download, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';

interface WalletConnectionTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const WalletConnectionTutorial = ({ isOpen, onClose, onConnect }: WalletConnectionTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<'mobile' | 'desktop' | null>(null);

  const platforms = [
    {
      id: 'desktop' as const,
      name: 'Desktop / Browser',
      icon: <Monitor className="w-8 h-8" />,
      description: 'Using laptop or desktop computer',
    },
    {
      id: 'mobile' as const,
      name: 'Mobile Device',
      icon: <Smartphone className="w-8 h-8" />,
      description: 'Using phone or tablet',
    },
  ];

  const desktopSteps = [
    {
      title: 'Install MetaMask Extension',
      description: 'MetaMask is the most popular wallet for desktop users',
      steps: [
        'Visit metamask.io in your browser',
        'Click "Download" for Chrome, Firefox, or Brave',
        'Add the extension to your browser',
        'Click the MetaMask fox icon in your toolbar',
      ],
      image: '🦊',
    },
    {
      title: 'Create Your Wallet',
      description: 'Set up a new wallet in just a few clicks',
      steps: [
        'Click "Create a new wallet"',
        'Create a strong password',
        'Write down your 12-word recovery phrase on paper',
        'Confirm your recovery phrase to complete setup',
      ],
      image: '🔐',
    },
    {
      title: 'Connect to Fusion',
      description: 'You\'re ready to connect!',
      steps: [
        'Return to Fusion Exchange',
        'Click the "Connect Wallet" button',
        'Select MetaMask from the list',
        'Approve the connection request',
      ],
      image: '✅',
    },
  ];

  const mobileSteps = [
    {
      title: 'Download Trust Wallet',
      description: 'Trust Wallet is the easiest mobile wallet',
      steps: [
        'Open App Store (iOS) or Play Store (Android)',
        'Search for "Trust Wallet"',
        'Download and install the official app',
        'Open Trust Wallet after installation',
      ],
      image: '🛡️',
    },
    {
      title: 'Create Your Wallet',
      description: 'Set up your mobile wallet',
      steps: [
        'Tap "Create a new wallet"',
        'Write down your 12-word recovery phrase',
        'Store it safely offline (never screenshot)',
        'Verify your recovery phrase',
      ],
      image: '📱',
    },
    {
      title: 'Connect via Browser',
      description: 'Access Fusion from Trust Wallet browser',
      steps: [
        'Open Trust Wallet app',
        'Tap the Browser tab at the bottom',
        'Navigate to Fusion Exchange',
        'Tap "Connect Wallet" and approve',
      ],
      image: '🔗',
    },
  ];

  const steps = selectedPlatform === 'mobile' ? mobileSteps : desktopSteps;

  const handlePlatformSelect = (platform: 'mobile' | 'desktop') => {
    setSelectedPlatform(platform);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onConnect();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedPlatform(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-effect border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Wallet className="w-6 h-6 mr-2 text-primary" />
            {!selectedPlatform ? 'Choose Your Platform' : 'Wallet Setup Guide'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedPlatform ? (
            <motion.div
              key="platform-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground">
                First, let's determine the best wallet setup for your device:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <Card
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform.id)}
                    className="glass-effect border-border/50 p-6 cursor-pointer hover:border-primary/50 hover:glow-effect transition-all"
                  >
                    <div className="text-center">
                      <div className="text-primary mb-3 flex justify-center">{platform.icon}</div>
                      <h3 className="font-bold text-lg mb-2">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Security Warning */}
              <Card className="bg-primary/5 border-primary/20 p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">🔒 Security Reminders:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Never share your recovery phrase with anyone</li>
                      <li>• Store it offline in a safe place</li>
                      <li>• Official wallets never ask for your phrase via email or DM</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((_, idx) => (
                  <div key={idx} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                        idx <= currentStep
                          ? 'gradient-primary text-primary-foreground'
                          : 'glass-effect text-muted-foreground'
                      }`}
                    >
                      {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded ${
                          idx < currentStep ? 'bg-primary' : 'bg-secondary'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">{steps[currentStep].image}</div>
                <h3 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h3>
                <p className="text-muted-foreground">{steps[currentStep].description}</p>
              </div>

              <Card className="glass-effect border-border/50 p-6">
                <ol className="space-y-4">
                  {steps[currentStep].steps.map((step, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm mr-3 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-muted-foreground pt-0.5">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  ← Back
                </Button>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <Button onClick={handleNext} className="gradient-primary glow-effect">
                  {currentStep === steps.length - 1 ? (
                    <>Connect Now <Wallet className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectionTutorial;
