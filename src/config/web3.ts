// src/config/web3.ts
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet, bsc, polygon, avalanche, arbitrum, optimism, base } from 'wagmi/chains';

const env = import.meta.env as Record<string, string | undefined>;

export const projectId = env.VITE_WALLETCONNECT_PROJECT_ID || '4befee5804ba195f11eb1ca06b263f1e';

// ── ONE source of truth for supported chains ──
export const chains = [mainnet, bsc, polygon, avalanche, arbitrum, optimism, base] as const;

export const SUPPORTED_CHAINS: readonly number[] = chains.map((c) => c.id);
export const isChainSupported = (chainId: number): boolean =>
  SUPPORTED_CHAINS.includes(chainId);

// ── RPC failover: env override first, then public fallbacks (rotate on failure) ──
export const RPC_ENDPOINTS: Record<number, string[]> = {
  1: [env.VITE_RPC_MAINNET, 'https://eth.llamarpc.com', 'https://rpc.ankr.com/eth', 'https://cloudflare-eth.com']
    .filter(Boolean) as string[],
  56: [env.VITE_RPC_BSC, 'https://bsc-dataseed.bnbchain.org', 'https://bsc.publicnode.com', 'https://binance.llamarpc.com']
    .filter(Boolean) as string[],
  137: [env.VITE_RPC_POLYGON, 'https://polygon-rpc.com', 'https://polygon-bor-rpc.publicnode.com']
    .filter(Boolean) as string[],
  42161: [env.VITE_RPC_ARBITRUM, 'https://arb1.arbitrum.io/rpc', 'https://arbitrum-one-rpc.publicnode.com']
    .filter(Boolean) as string[],
  10: [env.VITE_RPC_OPTIMISM, 'https://mainnet.optimism.io', 'https://optimism.llamarpc.com']
    .filter(Boolean) as string[],
  8453: [env.VITE_RPC_BASE, 'https://mainnet.base.org', 'https://base-rpc.publicnode.com']
    .filter(Boolean) as string[],
  43114: [env.VITE_RPC_AVALANCHE, 'https://api.avax.network/ext/bc/C/rpc', 'https://avalanche-c-chain-rpc.publicnode.com']
    .filter(Boolean) as string[],
};

const getAppUrl = () => (typeof window !== 'undefined' ? window.location.origin : 'https://fusion-exchange.app');

const metadata = {
  name: 'Fusion Exchange',
  description: 'Next Generation DeFi Trading Platform - Trade, Stake & Earn',
  url: getAppUrl(),
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  verifyUrl: getAppUrl(),
};

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

export const featuredWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance
  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
];

// ── Environment helpers (unchanged API) ──
export const isMobile = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};
export const isAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};
export const isWalletBrowser = () => {
  if (typeof window === 'undefined') return false;
  const eth = (window as any).ethereum;
  return !!(eth?.isMetaMask || eth?.isTrust || eth?.isPhantom || eth?.isCoinbaseWallet || eth?.isBinance || eth?.isRainbow);
};
export const getWalletName = (): string | null => {
  if (typeof window === 'undefined') return null;
  const eth = (window as any).ethereum;
  if (!eth) return null;
  if (eth.isBinance) return 'Binance';
  if (eth.isMetaMask) return 'MetaMask';
  if (eth.isTrust) return 'Trust Wallet';
  if (eth.isPhantom) return 'Phantom';
  if (eth.isCoinbaseWallet) return 'Coinbase';
  if (eth.isRainbow) return 'Rainbow';
  return null;
};

// ── Mobile deep links (unchanged) ──
export const getMobileDeepLink = (walletType: string, wcUri?: string) => {
  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const encodedUri = wcUri ? encodeURIComponent(wcUri) : '';
  const pathWithQuery =
    typeof window !== 'undefined'
      ? `${window.location.host}${window.location.pathname}${window.location.search}`
      : 'fusion-exchange.app';

  const deepLinks: Record<string, { ios: string; android: string; universal: string }> = {
    metamask: {
      ios: wcUri ? `https://metamask.app.link/wc?uri=${encodedUri}` : `https://metamask.app.link/dapp/${pathWithQuery}`,
      android: wcUri ? `https://metamask.app.link/wc?uri=${encodedUri}` : `https://metamask.app.link/dapp/${pathWithQuery}`,
      universal: `https://metamask.app.link/dapp/${pathWithQuery}`,
    },
    trust: {
      ios: wcUri ? `https://link.trustwallet.com/wc?uri=${encodedUri}` : `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`,
      android: wcUri ? `https://link.trustwallet.com/wc?uri=${encodedUri}` : `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`,
      universal: `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`,
    },
    coinbase: {
      ios: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
      android: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
      universal: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
    },
    phantom: {
      ios: `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`,
      android: `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`,
      universal: `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`,
    },
    rainbow: {
      ios: wcUri ? `https://rnbwapp.com/wc?uri=${encodedUri}` : `https://rnbwapp.com/dapp?url=${currentUrl}`,
      android: wcUri ? `https://rnbwapp.com/wc?uri=${encodedUri}` : `https://rnbwapp.com/dapp?url=${currentUrl}`,
      universal: `https://rnbwapp.com/dapp?url=${currentUrl}`,
    },
    binance: {
      ios: wcUri ? `https://app.binance.com/cedefi/wc?uri=${encodedUri}` : `https://app.binance.com/cedefi/dapp?url=${currentUrl}`,
      android: wcUri ? `https://app.binance.com/cedefi/wc?uri=${encodedUri}` : `https://app.binance.com/cedefi/dapp?url=${currentUrl}`,
      universal: `https://app.binance.com/cedefi/dapp?url=${currentUrl}`,
    },
  };

  const links = deepLinks[walletType.toLowerCase()];
  if (!links) return null;
  if (isIOS()) return links.ios;
  if (isAndroid()) return links.android;
  return links.universal;
};

// ── Redirect + focus handling ──
export const setupWalletRedirect = () => {
  if (typeof window === 'undefined') return;

  const currentUrl = window.location.href;
  sessionStorage.setItem('fusion_return_url', currentUrl);
  sessionStorage.setItem('fusion_connect_time', Date.now().toString());

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      const connectTime = sessionStorage.getItem('fusion_connect_time');
      if (connectTime) {
        const elapsed = Date.now() - parseInt(connectTime);
        if (elapsed < 30000) {
          window.dispatchEvent(new Event('walletReturnFocus'));
          sessionStorage.removeItem('fusion_connect_time');
        }
      }
    }
  };

  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) window.dispatchEvent(new Event('walletReturnFocus'));
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
  };
};

export const forceReturnToBrowser = () => {
  if (typeof window === 'undefined') return;
  try {
    window.focus();
    if (document.hidden) {
      const returnUrl = sessionStorage.getItem('fusion_return_url');
      if (returnUrl && window.location.href !== returnUrl) window.location.href = returnUrl;
    }
    window.dispatchEvent(new CustomEvent('walletConnected', { detail: { timestamp: Date.now() } }));
  } catch {
    /* noop */
  }
};
