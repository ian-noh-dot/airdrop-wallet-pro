import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="relative bg-gradient-to-r from-primary via-accent to-primary overflow-hidden"
        style={{ zIndex: 60 }}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
        
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-center gap-2 sm:gap-4 py-2.5 sm:py-3 pr-8">
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="hidden sm:block"
            >
              <Gift className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            
            {/* Text */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-primary-foreground">
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                LIMITED TIME
              </span>
              <span className="text-xs sm:text-sm opacity-90">
                Claim 2,500 FREE tokens +
              </span>
              <span className="font-bold text-xs sm:text-sm text-yellow-300">
                500% APY
              </span>
              <span className="text-xs sm:text-sm opacity-90 hidden xs:inline">
                staking rewards!
              </span>
            </div>
            
            {/* CTA Button */}
            <Link to="/stake" className="shrink-0">
              <Button 
                size="sm" 
                variant="secondary"
                className="text-xs h-7 px-3 font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                <Zap className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Stake Now</span>
                <span className="sm:hidden">Go</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
            
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close banner"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;
