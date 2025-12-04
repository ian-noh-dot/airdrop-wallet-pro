import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, Bell, Gift } from 'lucide-react';
import { toast } from 'sonner';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail('');

    toast.success('Successfully subscribed! 🎉', {
      description: 'You\'ll receive airdrop updates and exclusive offers.',
    });
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-2xl p-6 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <h4 className="font-bold mb-2">You're Subscribed!</h4>
        <p className="text-sm text-muted-foreground">
          Watch your inbox for exclusive updates and early access opportunities.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h4 className="font-bold">Stay Updated</h4>
          <p className="text-xs text-muted-foreground">Get airdrop alerts & exclusive offers</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <Gift className="w-4 h-4 text-accent" />
        <span className="text-muted-foreground">Subscribers get <span className="text-accent font-semibold">+100 bonus tokens</span></span>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          className="w-full gradient-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            'Subscribe for Updates'
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default Newsletter;