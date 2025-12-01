import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId, featuredWalletIds } from './config/web3';
import Navbar from './components/Navbar';
import Airdrop from "./pages/Airdrop";
import Dashboard from "./pages/Dashboard";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Stake from "./pages/Stake";
import Governance from "./pages/Governance";
import RewardsCalculator from "./pages/RewardsCalculator";
import FAQ from "./pages/FAQ";
import NFTMinting from "./pages/NFTMinting";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Airdrop />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/liquidity" element={<Liquidity />} />
              <Route path="/stake" element={<Stake />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/calculator" element={<RewardsCalculator />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/nft" element={<NFTMinting />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
