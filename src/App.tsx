import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId, featuredWalletIds } from './config/web3';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveChatBot from './components/LiveChatBot';
import SocialProofPopups from './components/SocialProofPopups';
import PromoBanner from './components/PromoBanner';
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create Web3Modal - shows ALL 500+ wallets with featured ones at top
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  featuredWalletIds, // Features these wallets at top
  allWallets: 'SHOW', // Shows ALL 500+ wallets
  // DO NOT use includeWalletIds - it restricts the wallet list!
  themeVariables: {
    '--w3m-accent': 'hsl(165 80% 45%)',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
  },
});

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background flex flex-col">
              <PromoBanner />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Airdrop />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/liquidity" element={<Liquidity />} />
                  <Route path="/stake" element={<Stake />} />
                  <Route path="/bridge" element={<Bridge />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/calculator" element={<RewardsCalculator />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/nft" element={<NFTMinting />} />
                  <Route path="/history" element={<TransactionHistory />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <LiveChatBot />
              <SocialProofPopups />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
