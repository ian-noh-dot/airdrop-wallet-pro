import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet, bsc, polygon, avalanche, arbitrum, optimism, base } from 'wagmi/chains';

// WalletConnect Cloud Project ID
export const projectId = '4befee5804ba195f11eb1ca06b263f1e';

const metadata = {
  name: 'Fusion Exchange',
  description: 'Next Generation DeFi Trading Platform - Claim Your Exclusive Airdrop',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://fusion-exchange.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  verifyUrl: typeof window !== 'undefined' ? window.location.origin : undefined
};

// Supported chains
export const chains = [mainnet, bsc, polygon, avalanche, arbitrum, optimism, base] as const;

// Create wagmi config with improved wallet support
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true, // Auto-detects installed wallets like Phantom
  enableCoinbase: true,
  coinbasePreference: 'all', // Shows all Coinbase options including mobile
});

// Featured wallet IDs for Web3Modal - these appear first
export const featuredWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3
  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
];

// Mobile deep links for direct wallet opening
export const getMobileDeepLink = (walletType: string, uri?: string) => {
  const encodedUri = uri ? encodeURIComponent(uri) : '';
  const currentUrl = encodeURIComponent(window.location.href);
  
  const deepLinks: Record<string, string> = {
    metamask: uri ? `metamask://wc?uri=${encodedUri}` : `https://metamask.app.link/dapp/${window.location.host}`,
    trust: uri ? `trust://wc?uri=${encodedUri}` : `trust://open_url?coin_id=60&url=${currentUrl}`,
    coinbase: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`,
    phantom: `phantom://browse/${window.location.href}`,
    rainbow: uri ? `rainbow://wc?uri=${encodedUri}` : `https://rnbwapp.com`,
  };
  return deepLinks[walletType] || null;
};

// Check if we're on mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
