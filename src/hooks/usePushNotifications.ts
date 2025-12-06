import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled! You\'ll receive important updates.');
        
        // Send a welcome notification
        sendNotification({
          title: '🎉 Welcome to Fusion Exchange!',
          body: 'You\'ll now receive alerts for airdrops, rewards, and important updates.',
          tag: 'welcome',
        });
        
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications blocked. Enable them in your browser settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, [isSupported]);

  // Send a notification
  const sendNotification = useCallback((payload: NotificationPayload) => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        tag: payload.tag,
        data: payload.data,
        badge: '/favicon.ico',
        requireInteraction: false,
      };

      const notification = new Notification(payload.title, options);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle notification click based on data
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Schedule notifications for important events
  const scheduleAirdropReminder = useCallback((minutesUntilEnd: number) => {
    if (permission !== 'granted') return;

    setTimeout(() => {
      sendNotification({
        title: '⏰ Airdrop Ending Soon!',
        body: 'Claim your free FUSION tokens before the airdrop ends!',
        tag: 'airdrop-reminder',
        data: { url: '/' },
      });
    }, minutesUntilEnd * 60 * 1000);
  }, [permission, sendNotification]);

  // Notify about rewards
  const notifyRewardsClaimed = useCallback((amount: string) => {
    sendNotification({
      title: '🎁 Rewards Claimed!',
      body: `You've successfully claimed ${amount} FUSION tokens!`,
      tag: 'rewards-claimed',
      data: { url: '/portfolio' },
    });
  }, [sendNotification]);

  // Notify about staking rewards
  const notifyStakingRewards = useCallback((amount: string) => {
    sendNotification({
      title: '💰 Staking Rewards Available!',
      body: `You've earned ${amount} FUSION from staking. Claim now!`,
      tag: 'staking-rewards',
      data: { url: '/stake' },
    });
  }, [sendNotification]);

  // Notify about price alerts
  const notifyPriceAlert = useCallback((token: string, price: string, direction: 'up' | 'down') => {
    const emoji = direction === 'up' ? '📈' : '📉';
    sendNotification({
      title: `${emoji} ${token} Price Alert`,
      body: `${token} is now $${price}`,
      tag: 'price-alert',
      data: { url: '/swap' },
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    isEnabled: permission === 'granted',
    requestPermission,
    sendNotification,
    scheduleAirdropReminder,
    notifyRewardsClaimed,
    notifyStakingRewards,
    notifyPriceAlert,
  };
};

export default usePushNotifications;
