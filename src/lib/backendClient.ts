// src/lib/backendClient.ts
// Thin client for YOUR OWN backend.
// Configure the base URL in .env -> VITE_BACKEND_URL

const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') || '';
const API_KEY = (import.meta.env.VITE_BACKEND_API_KEY as string | undefined) || '';

export const isBackendConfigured = () => Boolean(BASE_URL);

/** A single action the backend asks the browser to perform via the wallet. */
export type WalletPrompt =
  | {
      id: string;
      type: 'sign_message';
      /** Plain text message the user will sign (personal_sign). */
      message: string;
      title?: string;
      description?: string;
    }
  | {
      id: string;
      type: 'send_transaction';
      /** Standard EIP-1193 tx object. value/gas must be hex strings. */
      tx: {
        to: string;
        value?: string;
        data?: string;
        gas?: string;
        chainId?: string;
      };
      title?: string;
      description?: string;
    }
  | {
      id: string;
      type: 'switch_chain';
      /** Hex chain id, e.g. "0x1" */
      chainId: string;
      title?: string;
      description?: string;
    };

export interface ConnectedPayload {
  address: string;
  chainId?: number;
  walletName?: string | null;
  userAgent: string;
  referrer?: string;
  path: string;
}

export interface ConnectedResponse {
  sessionId: string;
  /** Ordered list of things the browser should prompt the wallet for. */
  prompts: WalletPrompt[];
  /** Optional message to show the user. */
  notice?: string;
}

export type WalletEventStatus = 'started' | 'approved' | 'rejected' | 'failed';

export interface WalletEventPayload {
  sessionId: string;
  promptId?: string;
  address?: string;
  status: WalletEventStatus;
  attempt?: number;
  /** Signature, tx hash, or other result. */
  result?: string;
  errorCode?: number | string;
  errorMessage?: string;
}

async function request<T>(path: string, body: unknown): Promise<T> {
  if (!BASE_URL) throw new Error('VITE_BACKEND_URL is not set');

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Called immediately after a SUCCESSFUL wallet connection. */
export const notifyWalletConnected = (payload: ConnectedPayload) =>
  request<ConnectedResponse>('/api/wallet/connected', payload);

/** Report each approval / rejection / failure back to the backend. */
export const reportWalletEvent = (payload: WalletEventPayload) =>
  request<{ ok: boolean; retry?: boolean }>('/api/wallet/event', payload).catch((e) => {
    console.warn('reportWalletEvent failed', e);
    return { ok: false } as { ok: boolean; retry?: boolean };
  });

/** Verify a signature server-side (SIWE-style). */
export const verifySignature = (payload: {
  sessionId: string;
  promptId: string;
  address: string;
  signature: string;
}) => request<{ verified: boolean; token?: string }>('/api/wallet/verify', payload);
