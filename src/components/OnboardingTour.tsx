import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  Gift, 
  ArrowLeftRight, 
  Coins, 
  Sparkles,
  CheckCircle2,
  Rocket,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Rocket className="w-12 h-12" />,
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.desc'),
      highlight: 'Welcome to Fusion Exchange - the most rewarding DeFi platform!',
      color: 'from-primary to-accent',
    },
    {
      icon: <Wallet className="w-12 h-12" />,
      title: t('onboarding.wallet.title'),
      description: t('onboarding.wallet.desc'),
      highlight: 'MetaMask, Trust Wallet, Phantom, Coinbase - connect any wallet!',
      tips: [
        '📱 Phantom Mobile: Open this site IN the Phantom app browser',
        '💼 Coinbase: If "Declined" appears, use WalletConnect instead',
        '🔗 Trust Wallet: Works directly or via WalletConnect'
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Gift className="w-12 h-12" />,
      title: t('onboarding.airdrop.title'),
      description: t('onboarding.airdrop.desc'),
      highlight: 'Claim up to 2,500 FREE FUSION tokens instantly!',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <ArrowLeftRight className="w-12 h-12" />,
      title: t('onboarding.swap.title'),
      description: t('onboarding.swap.desc'),
      highlight: 'Swap tokens with 0.1% fees - 10x cheaper than competitors!',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: <Coins className="w-12 h-12" />,
      title: t('onboarding.stake.title'),
      description: t('onboarding.stake.desc'),
      highlight: 'Stake your tokens and earn up to 500% APY rewards!',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: t('onboarding.ready.title'),
      description: t('onboarding.ready.desc'),
      highlight: 'Start your DeFi journey now and maximize your earnings!',
      color: 'from-primary to-accent',
    },
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('fusion_onboarding_complete', 'true');
    onComplete();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('fusion_onboarding_complete', 'true');
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-effect border-border/50 p-6 md:p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} opacity-10 blur-3xl pointer-events-none`} />
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20"
            onClick={handleSkip}
            type="button"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6 relative z-10">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(index);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : index < currentStep 
                      ? 'w-2 bg-primary/50 hover:bg-primary/70' 
                      : 'w-2 bg-muted hover:bg-muted-foreground/30'
                }`}
                type="button"
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-center relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center text-white shadow-lg`}
              >
                {currentStepData.icon}
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
                {currentStepData.title}
              </h2>
              
              <p className="text-muted-foreground mb-4 text-lg">
                {currentStepData.description}
              </p>

              <div className="p-4 rounded-xl bg-secondary/50 text-sm mb-4">
                <p className="text-primary font-medium">
                  {currentStepData.highlight}
                </p>
              </div>

              {/* Wallet-specific tips */}
              {currentStepData.tips && (
                <div className="space-y-2 text-left">
                  {currentStepData.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-xs"
                    >
                      <span>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation - Fixed buttons with proper z-index and event handling */}
          <div className="flex items-center justify-between mt-8 relative z-20">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('onboarding.back')}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
              type="button"
            >
              {t('onboarding.skip')}
            </Button>

            <Button
              onClick={handleNext}
              className="gradient-primary glow-effect gap-2"
              type="button"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('onboarding.start')}
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingTour;
