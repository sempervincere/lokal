import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeClusterOnChain, anchorFieldHashOnChain, getClusterPda } from '../src/lib/solana/anchorClient';
import { computeFieldHash } from '../src/lib/solana/fieldHash';

const CLUSTER_SLUG = 'depok-margonda-001';
const CLUSTER_NAME = 'Jalan Margonda Corridor';

async function main() {
  console.log('🔗 Testing Anchor TypeScript client...\n');
  console.log(`   Program ID:   4F2xbVhpy1idLj5FDdKPpRW1t7shYd21okXCSwyaxmoQ`);
  console.log(`   Cluster PDA:  ${getClusterPda(CLUSTER_SLUG).toBase58()}\n`);

  // ── Step 1: initialize cluster (skip if already exists) ────────────────────
  console.log('Step 1: initializeCluster...');
  console.log('  (If this fails with "already in use", the PDA already exists — that is OK)');
  try {
    const initTx = await initializeClusterOnChain(CLUSTER_SLUG, CLUSTER_NAME);
    console.log(`  ✅ initializeCluster tx: ${initTx}`);
    console.log(`     Explorer: https://explorer.solana.com/tx/${initTx}?cluster=devnet\n`);
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err);
    if (msg.includes('already in use') || msg.includes('custom program error')) {
      console.log(`  ℹ️  Cluster PDA already initialized — skipping.\n`);
    } else {
      throw err;
    }
  }

  // ── Step 2: anchor a sample field hash ─────────────────────────────────────
  console.log('Step 2: anchorFieldHash for field B1...');
  const hash = computeFieldHash('B1', { max_wtp: 28000, category: 'coffee' });
  console.log(`  Hash: ${hash}`);

  const hashTx = await anchorFieldHashOnChain(CLUSTER_SLUG, 'B1', hash);
  console.log(`  ✅ anchorFieldHash tx: ${hashTx}`);
  console.log(`     Explorer: https://explorer.solana.com/tx/${hashTx}?cluster=devnet`);
  console.log(`     (Open Explorer → Program Logs → find LOKAL|depok-margonda-001|B1|...)\n`);

  console.log('✅ T-13 Anchor client smoke test complete!');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
