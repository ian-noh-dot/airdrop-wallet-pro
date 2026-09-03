import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ExternalLink, X, Copy, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { isMobile, isWalletBrowser, getMobileDeepLink } from '@/config/web3';

const WALLETS = [
  { key: 'metamask', name: 'MetaMask', icon: '🦊' },
  { key: 'trust', name: 'Trust Wallet', icon: '🛡️' },
  { key: 'coinbase', name: 'Coinbase Wallet', icon: '💰' },
  { key: 'phantom', name: 'Phantom', icon: '👻' },
  { key: 'binance', name: 'Binance Web3', icon: '🔶' },
];

const DISMISS_KEY = 'fusion_inapp_prompt_dismissed';

const InAppBrowserPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    if (isWalletBrowser()) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const openWallet = (key: string, name: string) => {
    const link = getMobileDeepLink(key);
    if (!link) return;
    toast({
      title: `Opening ${name}…`,
      description: 'If nothing happens, install the app or open the site from the wallet browser.',
    });
    window.location.href = link;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: 'Link copied', description: 'Paste it into your wallet app browser.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: window.location.href });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[91] rounded-t-3xl border-t border-border/60 bg-card p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">For the smoothest experience, open in your wallet browser</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wallet connections, claims and swaps work best inside the wallet app's built-in
                  browser. Tap your wallet below and we'll take you straight there.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {WALLETS.map((w) => (
                <Button
                  key={w.key}
                  variant="secondary"
                  className="h-12 w-full justify-between"
                  onClick={() => openWallet(w.key, w.name)}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <span className="font-medium">Open in {w.name}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 opacity-60" />
                </Button>
              ))}
            </div>

            <Button variant="outline" className="mt-3 h-11 w-full" onClick={copyLink}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy site link
            </Button>

            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
              Phantom and Binance Web3 only work inside their own in-app browser. For Coinbase, use
              WalletConnect if you see a "Declined" message.
            </p>

            <button
              onClick={dismiss}
              className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Continue in this browser
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InAppBrowserPrompt;
