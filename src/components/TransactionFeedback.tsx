import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

interface TransactionFeedbackProps {
  status: TransactionStatus;
  title?: string;
  message?: string;
  txHash?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

const TransactionFeedback = ({
  status,
  title,
  message,
  txHash,
  onClose,
  onRetry,
}: TransactionFeedbackProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'idle') return null;

  const statusConfigs: Record<Exclude<TransactionStatus, 'idle'>, StatusConfig> = {
    pending: {
      icon: <Loader2 className="w-16 h-16 animate-spin text-primary" />,
      title: title || 'Waiting for Confirmation',
      message: message || 'Please confirm the transaction in your wallet...',
      color: 'from-primary/20 to-accent/20',
    },
    confirming: {
      icon: <Loader2 className="w-16 h-16 animate-spin text-yellow-500" />,
      title: title || 'Transaction Submitted',
      message: message || 'Waiting for blockchain confirmation...',
      color: 'from-yellow-500/20 to-orange-500/20',
    },
    success: {
      icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
      title: title || 'Transaction Successful!',
      message: message || 'Your transaction has been confirmed on the blockchain.',
      color: 'from-green-500/20 to-emerald-500/20',
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: title || 'Transaction Failed',
      message: message || 'Something went wrong. Please try again.',
      color: 'from-red-500/20 to-pink-500/20',
    },
  };

  const config = statusConfigs[status];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-border/50 p-8 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-50 blur-3xl`} />
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="mb-6 flex justify-center"
              >
                {config.icon}
              </motion.div>

              <h2 className="text-2xl font-bold mb-3 font-display">{config.title}</h2>
              <p className="text-muted-foreground mb-6">{config.message}</p>

              {txHash && (status === 'confirming' || status === 'success') && (
                <div className="mb-6 p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono truncate max-w-[200px]">{txHash}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {(status === 'pending' || status === 'confirming') && (
                <div className="flex justify-center gap-4 mb-6">
                  {['Pending', 'Confirming', 'Complete'].map((step, i) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        i === 0 ? 'bg-primary' :
                        i === 1 && status === 'confirming' ? 'bg-yellow-500' :
                        'bg-muted'
                      } ${i < 2 && status === 'confirming' ? 'animate-pulse' : ''}`} />
                      {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {status === 'error' && onRetry && (
                  <Button onClick={onRetry} className="gradient-primary">Try Again</Button>
                )}
                {(status === 'success' || status === 'error') && onClose && (
                  <Button variant="outline" onClick={onClose}>Close</Button>
                )}
              </div>

              {(status === 'pending' || status === 'confirming') && (
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionFeedback;
