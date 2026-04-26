/**
 * Server-side Anchor client for the lokal_core program.
 * NEVER import this in components marked "use client".
 *
 * Uses PLATFORM_KEYPAIR as the authority signer.
 * Anchor 1.0 auto-resolves clusterRecord (PDA seeds in IDL) and systemProgram (fixed address in IDL).
 * Memo program must be passed via remainingAccounts — it is not declared in the Rust Context struct.
 */
import * as anchor from '@anchor-lang/core';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import idl from '../../../anchor/target/idl/lokal_core.json';

const PROGRAM_ID = new PublicKey('4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function getProgram(): anchor.Program {
  const rpcUrl = (process.env.HELIUS_RPC_URL ?? process.env.NEXT_PUBLIC_HELIUS_RPC_URL)!;
  if (!rpcUrl) throw new Error('HELIUS_RPC_URL (or NEXT_PUBLIC_HELIUS_RPC_URL) is not set');

  const keypairBytes = JSON.parse(process.env.PLATFORM_KEYPAIR!) as number[];
  const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairBytes));

  const connection = new Connection(rpcUrl, 'confirmed');
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new anchor.Program(idl as any, provider);
}

/**
 * Creates the Margonda cluster PDA on Solana.
 * Call ONCE per cluster — will fail with account-already-exists if called twice.
 * Returns the transaction signature for Explorer bookmarking.
 */
export async function initializeClusterOnChain(slug: string, name: string): Promise<string> {
  const program = getProgram();

  const txSig = await program.methods
    .initializeCluster(slug, name)
    .accounts({ authority: program.provider.publicKey! })
    .rpc({ commitment: 'confirmed' });

  console.log(`[anchorClient] initializeCluster tx: ${txSig}`);
  return txSig;
}

/**
 * Anchors a field's SHA-256 hash to Solana via the Memo program.
 * Called by the admin field validation API (T-16) after verifying a field.
 * Returns the transaction signature — stored in cluster_field_values.sol_tx_signature.
 *
 * Memo format written on-chain: LOKAL|{slug}|{fieldCode}|{hash}|{timestamp}
 */
export async function anchorFieldHashOnChain(
  slug: string,
  fieldCode: string,
  hash: string,
): Promise<string> {
  const program = getProgram();

  const txSig = await program.methods
    .anchorFieldHash(slug, fieldCode, hash)
    .accounts({ authority: program.provider.publicKey! })
    .remainingAccounts([
      { pubkey: MEMO_PROGRAM_ID, isWritable: false, isSigner: false },
    ])
    .rpc({ commitment: 'confirmed' });

  console.log(`[anchorClient] anchorFieldHash tx: ${txSig} (${fieldCode})`);
  return txSig;
}

/**
 * Derives the PDA address for a cluster slug — useful for fetching on-chain state.
 */
export function getClusterPda(slug: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('cluster'), Buffer.from(slug)],
    PROGRAM_ID,
  )[0];
}
