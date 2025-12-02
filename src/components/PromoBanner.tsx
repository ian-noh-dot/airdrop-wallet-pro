import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PromoBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-y border-primary/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3 text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">
              <span className="text-primary font-bold">LIMITED TIME:</span> Claim 2,500 FREE tokens + 
              <span className="text-green-500 font-bold"> 500% APY</span> staking rewards!
            </span>
          </div>
          <Link to="/stake">
            <Button size="sm" className="gradient-primary text-xs h-7">
              Stake Now <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PromoBanner;
