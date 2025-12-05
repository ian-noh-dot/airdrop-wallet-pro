import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId, featuredWalletIds } from './config/web3';
import { LanguageProvider } from './contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveChatBot from './components/LiveChatBot';
import SocialProofPopups from './components/SocialProofPopups';
import PromoBanner from './components/PromoBanner';
import OnboardingTour from './components/OnboardingTour';
import PageTransition from './components/PageTransition';
import Airdrop from "./pages/Airdrop";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Stake from "./pages/Stake";
import Bridge from "./pages/Bridge";
import Governance from "./pages/Governance";
import RewardsCalculator from "./pages/RewardsCalculator";
import FAQ from "./pages/FAQ";
import NFTMinting from "./pages/NFTMinting";
import TransactionHistory from "./pages/TransactionHistory";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import HowItWorksPage from "./pages/HowItWorksPage";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create Web3Modal with better wallet support
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  featuredWalletIds,
  allWallets: 'SHOW',
  themeVariables: {
    '--w3m-accent': 'hsl(165 80% 45%)',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
  },
});

// Animated Routes component
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Airdrop /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/swap" element={<PageTransition><Swap /></PageTransition>} />
        <Route path="/liquidity" element={<PageTransition><Liquidity /></PageTransition>} />
        <Route path="/stake" element={<PageTransition><Stake /></PageTransition>} />
        <Route path="/bridge" element={<PageTransition><Bridge /></PageTransition>} />
        <Route path="/governance" element={<PageTransition><Governance /></PageTransition>} />
        <Route path="/calculator" element={<PageTransition><RewardsCalculator /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/nft" element={<PageTransition><NFTMinting /></PageTransition>} />
        <Route path="/history" element={<PageTransition><TransactionHistory /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorksPage /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('fusion_onboarding_complete');
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <div className="min-h-screen bg-background flex flex-col">
                <PromoBanner />
                <Navbar />
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
                <Footer />
                <LiveChatBot />
                <SocialProofPopups />
              </div>
              {showOnboarding && (
                <OnboardingTour onComplete={() => setShowOnboarding(false)} />
              )}
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
