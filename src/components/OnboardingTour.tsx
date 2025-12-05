import { useState, useEffect } from 'react';
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
  Rocket
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
      highlight: 'MetaMask, Trust Wallet, Phantom, Coinbase - connect any wallet! Mobile users: open this site IN your wallet app browser.',
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('fusion_onboarding_complete', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('fusion_onboarding_complete', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="glass-effect border-border/50 p-6 md:p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${steps[currentStep].color} opacity-10 blur-3xl`} />
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : index < currentStep 
                        ? 'w-2 bg-primary/50' 
                        : 'w-2 bg-muted'
                  }`}
                  layoutId={`dot-${index}`}
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
                className="text-center relative z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center text-white shadow-lg`}
                >
                  {steps[currentStep].icon}
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display">
                  {steps[currentStep].title}
                </h2>
                
                <p className="text-muted-foreground mb-4 text-lg">
                  {steps[currentStep].description}
                </p>

                <div className="p-4 rounded-xl bg-secondary/50 text-sm">
                  <p className="text-primary font-medium">
                    {steps[currentStep].highlight}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('onboarding.back')}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                {t('onboarding.skip')}
              </Button>

              <Button
                onClick={handleNext}
                className="gradient-primary glow-effect gap-2"
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
    </AnimatePresence>
  );
};

export default OnboardingTour;
