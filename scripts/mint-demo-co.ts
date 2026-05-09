import { config } from 'dotenv';
config({ path: '.env.local' });
import { mintCoCredentialNft } from '../src/lib/solana/mintCoNft';

const CO_NAME = 'Rizky Setiawan';
const CLUSTER_SLUG = 'depok-margonda-001';
const CO_WALLET = process.env.DEMO_CO_WALLET!;

async function main() {
  if (!CO_WALLET) {
    console.error('❌ DEMO_CO_WALLET is not set in .env.local');
    process.exit(1);
  }
  if (!process.env.PLATFORM_KEYPAIR) {
    console.error('❌ PLATFORM_KEYPAIR is not set in .env.local');
    process.exit(1);
  }

  console.log('🎨 Minting soulbound CO credential NFT...');
  console.log(`   CO:        ${CO_NAME}`);
  console.log(`   Cluster:   ${CLUSTER_SLUG}`);
  console.log(`   Recipient: ${CO_WALLET}`);

  const { mintAddress, txSignature } = await mintCoCredentialNft(CO_NAME, CLUSTER_SLUG, CO_WALLET);

  // Decode base64 sig → hex for Explorer URL
  const txHex = Buffer.from(txSignature, 'base64').toString('hex');

  console.log('\n✅ Mint complete!');
  console.log(`   Mint address:  ${mintAddress}`);
  console.log(`   Tx signature:  ${txSignature}`);
  console.log('\n📋 Explorer links (save these for DEMO):');
  console.log(`   NFT:  https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
  console.log(`   TX:   https://explorer.solana.com/tx/${txHex}?cluster=devnet`);
  console.log('\n👉 Open Phantom → NFT tab → confirm it shows as frozen (non-transferable)');
}

main().catch((err) => {
  console.error('❌ Mint failed:', err);
  process.exit(1);
});
