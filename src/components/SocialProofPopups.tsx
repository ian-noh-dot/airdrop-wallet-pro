import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, TrendingUp, Users, Zap } from 'lucide-react';

interface Notification {
  id: number;
  type: 'claim' | 'stake' | 'referral' | 'nft';
  user: string;
  amount: string;
  time: string;
}

const SocialProofPopups = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);

  const notifications: Notification[] = [
    { id: 1, type: 'claim', user: '0x8f2a...3d4b', amount: '2,500 FUSION', time: '2 mins ago' },
    { id: 2, type: 'stake', user: '0x1b7c...9e2f', amount: '5,000 FUSION', time: '3 mins ago' },
    { id: 3, type: 'referral', user: '0x4d9e...7a1c', amount: '500 FUSION', time: '5 mins ago' },
    { id: 4, type: 'claim', user: '0x6c3f...8b2d', amount: '2,750 FUSION', time: '6 mins ago' },
    { id: 5, type: 'nft', user: '0x2a8d...5e9f', amount: 'Gold NFT', time: '8 mins ago' },
    { id: 6, type: 'stake', user: '0x9e1b...4c7a', amount: '10,000 FUSION', time: '10 mins ago' },
    { id: 7, type: 'claim', user: '0x7f4a...2d8e', amount: '3,000 FUSION', time: '12 mins ago' },
    { id: 8, type: 'referral', user: '0x3b6c...9a1f', amount: '1,000 FUSION', time: '15 mins ago' },
    { id: 9, type: 'nft', user: '0x5d2e...7b3c', amount: 'Diamond NFT', time: '18 mins ago' },
    { id: 10, type: 'claim', user: '0x8a9f...1c4d', amount: '2,500 FUSION', time: '20 mins ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'stake':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'referral':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'nft':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
    }
  };

  const getMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'claim':
        return `claimed ${notification.amount}`;
      case 'stake':
        return `staked ${notification.amount}`;
      case 'referral':
        return `earned ${notification.amount} from referral`;
      case 'nft':
        return `minted ${notification.amount}`;
      default:
        return `received ${notification.amount}`;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'claim':
        return 'from-green-500/10 to-green-500/5 border-green-500/30';
      case 'stake':
        return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
      case 'referral':
        return 'from-purple-500/10 to-purple-500/5 border-purple-500/30';
      case 'nft':
        return 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30';
      default:
        return 'from-primary/10 to-primary/5 border-primary/30';
    }
  };

  useEffect(() => {
    // Initialize queue with shuffled notifications
    const shuffled = [...notifications].sort(() => Math.random() - 0.5);
    setNotificationQueue(shuffled);
  }, []);

  useEffect(() => {
    if (notificationQueue.length === 0) return;

    // Show first notification after initial delay
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, [notificationQueue]);

  const showNextNotification = () => {
    if (notificationQueue.length === 0) {
      // Refill queue
      const shuffled = [...notifications].sort(() => Math.random() - 0.5);
      setNotificationQueue(shuffled);
      return;
    }

    const next = notificationQueue[0];
    setCurrentNotification(next);
    setNotificationQueue(prev => prev.slice(1));

    // Hide after 5 seconds
    setTimeout(() => {
      setCurrentNotification(null);
      
      // Show next notification after random delay (8-15 seconds)
      const nextDelay = 8000 + Math.random() * 7000;
      setTimeout(showNextNotification, nextDelay);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 left-4 z-40 max-w-[320px]"
        >
          <div className={`bg-gradient-to-r ${getBackgroundColor(currentNotification.type)} backdrop-blur-xl rounded-xl border p-4 shadow-2xl`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background/50 flex items-center justify-center">
                {getIcon(currentNotification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="font-mono text-sm font-semibold truncate">
                    {currentNotification.user}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {getMessage(currentNotification)}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {currentNotification.time}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofPopups;
