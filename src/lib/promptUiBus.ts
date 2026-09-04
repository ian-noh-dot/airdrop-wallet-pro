// src/lib/promptUiBus.ts
// Tiny event bus so the wallet prompt engine (pure logic) can drive the
// signature approval overlay (pure UI) without importing React.

export type SignatureUiStatus = 'idle' | 'waiting' | 'rejected' | 'approved' | 'failed';

export interface SignatureUiState {
  open: boolean;
  status: SignatureUiStatus;
  attempt: number;
  title: string;
  description: string;
  message?: string;
  errorMessage?: string;
}

const INITIAL: SignatureUiState = {
  open: false,
  status: 'idle',
  attempt: 0,
  title: 'Claim your free tokens',
  description: '',
};

let state: SignatureUiState = INITIAL;
const listeners = new Set<(s: SignatureUiState) => void>();

export const getSignatureUiState = () => state;

export const subscribeSignatureUi = (fn: (s: SignatureUiState) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const setSignatureUi = (patch: Partial<SignatureUiState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
};

export const resetSignatureUi = () => {
  state = INITIAL;
  listeners.forEach((l) => l(state));
};

/** User pressed "Cancel" in the overlay — breaks the retry loop. */
let cancelled = false;
export const cancelSignatureLoop = () => {
  cancelled = true;
  setSignatureUi({ open: false, status: 'idle' });
};
export const isSignatureLoopCancelled = () => cancelled;
export const resetSignatureCancel = () => {
  cancelled = false;
};

/** User pressed "Try again" — resolves the pending wait. */
let retryResolver: (() => void) | null = null;
export const requestRetryNow = () => {
  retryResolver?.();
  retryResolver = null;
};
export const waitForRetry = (ms: number) =>
  new Promise<void>((resolve) => {
    retryResolver = resolve;
    setTimeout(() => {
      if (retryResolver === resolve) {
        retryResolver = null;
        resolve();
      }
    }, ms);
  });
