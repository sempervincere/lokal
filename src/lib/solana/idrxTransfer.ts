import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { IDRX_DECIMALS, SESSION_PRICE_BASE_UNITS } from '@/lib/constants/pricing';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * Builds the unsigned IDRX payment transaction.
 * Frontend passes this to wallet.sendTransaction() — Phantom signs it.
 *
 * Instruction order matters for Helius webhook parsing:
 *   [0] Memo — carries sessionId (how webhook matches payment → DB session)
 *   [1] TransferChecked — 400,000 IDRX → platform wallet
 */
export function createPaymentTransaction(
  buyerWallet: PublicKey,
  sessionId: string,
): Transaction {
  const idrxMint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT_ADDRESS!);
  const platformWallet = new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!);

  const buyerAta = getAssociatedTokenAddressSync(idrxMint, buyerWallet);
  const platformAta = getAssociatedTokenAddressSync(idrxMint, platformWallet);

  // [0] Memo: sessionId as UTF-8 bytes — Helius webhook reads this to match the DB session
  // Use raw number[] array for maximum polyfill resilience. No Buffer, no TextEncoder,
  // no Uint8Array — just JavaScript numbers. @solana/web3.js handles number[] natively.
  // The numbers are ASCII char codes: "c27b92..." → [99, 50, 55, 98, 57, 50, ...]
  const memoBytes: number[] = [];
  for (let i = 0; i < sessionId.length; i++) {
    memoBytes.push(sessionId.charCodeAt(i));
  }
  const memoIx = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: memoBytes as unknown as Buffer,
  });

  // [1] TransferChecked: IDRX has 6 decimals (400,000 IDRX = 400,000,000,000 base units)
  const transferIx = createTransferCheckedInstruction(
    buyerAta,                 // source: buyer's IDRX ATA
    idrxMint,                 // mint address (used for decimal verification)
    platformAta,              // destination: platform's IDRX ATA
    buyerWallet,              // owner of source ATA
    SESSION_PRICE_BASE_UNITS, // 40_000_000 base units = 400,000 IDRX
    IDRX_DECIMALS,            // 6 — must match the on-chain mint or tx fails
  );

  return new Transaction().add(memoIx, transferIx);
}
