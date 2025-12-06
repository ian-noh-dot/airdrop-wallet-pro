import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet, bsc, polygon, avalanche, arbitrum, optimism, base } from 'wagmi/chains';

// WalletConnect Cloud Project ID
export const projectId = '4befee5804ba195f11eb1ca06b263f1e';

// Get current URL for deep linking
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://fusion-exchange.app';
};

const metadata = {
  name: 'Fusion Exchange',
  description: 'Next Generation DeFi Trading Platform - Trade, Stake & Earn',
  url: getAppUrl(),
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  verifyUrl: getAppUrl(),
};

// Supported chains
export const chains = [mainnet, bsc, polygon, avalanche, arbitrum, optimism, base] as const;

// Create wagmi config with comprehensive wallet support
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  coinbasePreference: 'all',
});

// Featured wallet IDs for Web3Modal
export const featuredWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3
  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
];

// Check if we're on mobile
export const isMobile = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if we're on iOS
export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Check if we're on Android
export const isAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

// Check if running inside a wallet browser
export const isWalletBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ethereum = (window as any).ethereum;
  return !!(
    ethereum?.isMetaMask ||
    ethereum?.isTrust ||
    ethereum?.isPhantom ||
    ethereum?.isCoinbaseWallet ||
    ethereum?.isBinance ||
    ethereum?.isRainbow
  );
};

// Get wallet name from provider
export const getWalletName = (): string | null => {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  
  if (ethereum.isBinance) return 'Binance';
  if (ethereum.isMetaMask) return 'MetaMask';
  if (ethereum.isTrust) return 'Trust Wallet';
  if (ethereum.isPhantom) return 'Phantom';
  if (ethereum.isCoinbaseWallet) return 'Coinbase';
  if (ethereum.isRainbow) return 'Rainbow';
  return null;
};

// Mobile wallet deep links with improved redirect handling
export const getMobileDeepLink = (walletType: string, wcUri?: string) => {
  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const encodedUri = wcUri ? encodeURIComponent(wcUri) : '';
  const host = typeof window !== 'undefined' ? window.location.host : 'fusion-exchange.app';

  const deepLinks: Record<string, { ios: string; android: string; universal: string }> = {
    metamask: {
      ios: wcUri ? `metamask://wc?uri=${encodedUri}` : `https://metamask.app.link/dapp/${host}`,
      android: wcUri ? `metamask://wc?uri=${encodedUri}` : `https://metamask.app.link/dapp/${host}`,
      universal: `https://metamask.app.link/dapp/${host}`,
    },
    trust: {
      ios: wcUri ? `trust://wc?uri=${encodedUri}` : `trust://open_url?coin_id=60&url=${currentUrl}`,
      android: wcUri ? `trust://wc?uri=${encodedUri}` : `trust://open_url?coin_id=60&url=${currentUrl}`,
      universal: `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`,
    },
    coinbase: {
      ios: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
      android: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
      universal: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
    },
    phantom: {
      ios: `phantom://browse/${currentUrl}`,
      android: `phantom://browse/${currentUrl}`,
      universal: `https://phantom.app/ul/browse/${currentUrl}`,
    },
    rainbow: {
      ios: wcUri ? `rainbow://wc?uri=${encodedUri}` : 'rainbow://',
      android: wcUri ? `rainbow://wc?uri=${encodedUri}` : 'rainbow://',
      universal: 'https://rainbow.me',
    },
    binance: {
      ios: `bnc://app.binance.com/cedefi/wc?uri=${encodedUri}`,
      android: `bnc://app.binance.com/cedefi/wc?uri=${encodedUri}`,
      universal: `https://app.binance.com/cedefi`,
    },
  };

  const links = deepLinks[walletType.toLowerCase()];
  if (!links) return null;

  if (isIOS()) return links.ios;
  if (isAndroid()) return links.android;
  return links.universal;
};

// Enhanced wallet redirect handler with focus management
export const setupWalletRedirect = () => {
  if (typeof window === 'undefined') return;

  // Store the current URL before connecting
  const currentUrl = window.location.href;
  sessionStorage.setItem('fusion_return_url', currentUrl);
  sessionStorage.setItem('fusion_connect_time', Date.now().toString());

  // Handle visibility changes (when user returns from wallet)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const connectTime = sessionStorage.getItem('fusion_connect_time');
      if (connectTime) {
        const elapsed = Date.now() - parseInt(connectTime);
        // If user returns within 30 seconds, they likely just connected
        if (elapsed < 30000) {
          // Trigger a page focus event
          window.dispatchEvent(new Event('walletReturnFocus'));
          sessionStorage.removeItem('fusion_connect_time');
        }
      }
    }
  };

  // Handle page show event (for back/forward cache)
  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      // Page was restored from bfcache
      window.dispatchEvent(new Event('walletReturnFocus'));
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
  };
};

// Force refocus to browser after wallet interaction
export const forceReturnToBrowser = () => {
  if (typeof window === 'undefined') return;
  
  // Try multiple methods to bring focus back
  try {
    // Method 1: Focus the window
    window.focus();
    
    // Method 2: Use location reload if coming from external app
    if (document.hidden) {
      const returnUrl = sessionStorage.getItem('fusion_return_url');
      if (returnUrl && window.location.href !== returnUrl) {
        window.location.href = returnUrl;
      }
    }
    
    // Method 3: Dispatch custom event for components to handle
    window.dispatchEvent(new CustomEvent('walletConnected', { 
      detail: { timestamp: Date.now() } 
    }));
  } catch (e) {
    console.log('Return to browser handled');
  }
};

// Connection state manager
export class WalletConnectionManager {
  private static instance: WalletConnectionManager;
  private connectionAttemptTime: number = 0;
  private isConnecting: boolean = false;
  private connectionCallback: (() => void) | null = null;

  static getInstance() {
    if (!WalletConnectionManager.instance) {
      WalletConnectionManager.instance = new WalletConnectionManager();
    }
    return WalletConnectionManager.instance;
  }

  startConnection(callback?: () => void) {
    this.connectionAttemptTime = Date.now();
    this.isConnecting = true;
    this.connectionCallback = callback || null;
    setupWalletRedirect();
  }

  completeConnection() {
    this.isConnecting = false;
    forceReturnToBrowser();
    if (this.connectionCallback) {
      this.connectionCallback();
      this.connectionCallback = null;
    }
  }

  getConnectionDuration(): number {
    return Date.now() - this.connectionAttemptTime;
  }

  isCurrentlyConnecting(): boolean {
    return this.isConnecting;
  }
}

// Generate WalletConnect URI for mobile deep linking
export const generateWcUri = async (): Promise<string | null> => {
  // This would be implemented with actual WalletConnect logic
  // For now, return null as the Web3Modal handles this automatically
  return null;
};

// Initialize wallet connection tracking
export const initWalletTracking = () => {
  if (typeof window === 'undefined') return;

  // Listen for account changes
  const ethereum = (window as any).ethereum;
  if (ethereum) {
    ethereum.on?.('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        WalletConnectionManager.getInstance().completeConnection();
      }
    });

    ethereum.on?.('chainChanged', () => {
      // Chain changed, refresh page for safety
      window.location.reload();
    });
  }

  // Handle custom wallet return event
  window.addEventListener('walletReturnFocus', () => {
    WalletConnectionManager.getInstance().completeConnection();
  });
};
