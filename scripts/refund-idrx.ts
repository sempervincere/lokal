/**
 * Refund script — sends IDRX from platform wallet back to your wallet.
 *
 * Usage: npx tsx scripts/refund-idrx.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

const RECIPIENT_WALLET = '3psJ1RBf4Ci9GxQdqyuC5HgqKntwyzr1jxuHaFyEVfJt';
const REFUND_AMOUNT_IDRX = 400_000; // 170K IDRX
const IDRX_DECIMALS = 6;
const REFUND_BASE_UNITS = REFUND_AMOUNT_IDRX * Math.pow(10, IDRX_DECIMALS);

async function main() {
  const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
  if (!rpcUrl) throw new Error('HELIUS_RPC_URL (or NEXT_PUBLIC_HELIUS_RPC_URL) not set');

  const idrxMintStr = process.env.NEXT_PUBLIC_IDRX_MINT_ADDRESS || process.env.IDRX_MINT_ADDRESS;
  if (!idrxMintStr) throw new Error('IDRX_MINT_ADDRESS not set');

  const platformKeypairBytes = JSON.parse(process.env.PLATFORM_KEYPAIR!);
  if (!platformKeypairBytes) throw new Error('PLATFORM_KEYPAIR not set');

  const connection = new Connection(rpcUrl, 'confirmed');
  const platformWallet = Keypair.fromSecretKey(Uint8Array.from(platformKeypairBytes));
  const idrxMint = new PublicKey(idrxMintStr);
  const recipientWallet = new PublicKey(RECIPIENT_WALLET);

  console.log('🔍 Checking balances...');
  console.log(`   Platform wallet: ${platformWallet.publicKey.toBase58()}`);
  console.log(`   Recipient:       ${RECIPIENT_WALLET}`);

  const platformAta = getAssociatedTokenAddressSync(idrxMint, platformWallet.publicKey);
  const recipientAta = getAssociatedTokenAddressSync(idrxMint, recipientWallet);

  // Check platform balance
  let platformBalance;
  try {
    platformBalance = await connection.getTokenAccountBalance(platformAta);
  } catch {
    throw new Error(`Platform ATA not found: ${platformAta.toBase58()}`);
  }

  const balanceIdrx = Number(platformBalance.value.uiAmount);
  const balanceBase = Number(platformBalance.value.amount);

  console.log(`   Platform IDRX:   ${balanceIdrx.toLocaleString('id')} IDRX (${balanceBase} base units)`);

  if (balanceBase < REFUND_BASE_UNITS) {
    throw new Error(`Insufficient balance. Need ${REFUND_AMOUNT_IDRX.toLocaleString('id')} IDRX, have ${balanceIdrx.toLocaleString('id')} IDRX`);
  }

  // Ensure recipient ATA exists
  console.log('🔍 Checking recipient ATA...');
  try {
    await connection.getTokenAccountBalance(recipientAta);
    console.log(`   Recipient ATA exists: ${recipientAta.toBase58()}`);
  } catch {
    console.log(`   Creating recipient ATA...`);
    // Create ATA for recipient
    const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
    const createAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        platformWallet.publicKey, // payer (platform)
        recipientAta,            // ata to create
        recipientWallet,         // owner
        idrxMint,                // mint
      )
    );
    const sig = await sendAndConfirmTransaction(connection, createAtaTx, [platformWallet], { commitment: 'confirmed' });
    console.log(`   ATA created: ${sig.slice(0, 16)}...`);
  }

  // Create transfer
  console.log(`\n💸 Sending ${REFUND_AMOUNT_IDRX.toLocaleString('id')} IDRX...`);
  console.log(`   From: ${platformAta.toBase58()}`);
  console.log(`   To:   ${recipientAta.toBase58()}`);

  const transferIx = createTransferCheckedInstruction(
    platformAta,
    idrxMint,
    recipientAta,
    platformWallet.publicKey,
    BigInt(REFUND_BASE_UNITS),
    IDRX_DECIMALS,
  );

  const tx = new Transaction().add(transferIx);
  const signature = await sendAndConfirmTransaction(connection, tx, [platformWallet], { commitment: 'confirmed' });

  console.log(`\n✅ Refund complete!`);
  console.log(`   Amount:    ${REFUND_AMOUNT_IDRX.toLocaleString('id')} IDRX`);
  console.log(`   Tx:        ${signature}`);
  console.log(`   Explorer:  https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Verify
  const newBalance = await connection.getTokenAccountBalance(platformAta);
  console.log(`\n📊 Platform wallet remaining: ${Number(newBalance.value.uiAmount).toLocaleString('id')} IDRX`);
}

main().catch((err) => {
  console.error('❌ Refund failed:', err);
  process.exit(1);
});
