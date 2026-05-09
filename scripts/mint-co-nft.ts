/**
 * scripts/mint-co-nft.ts
 *
 * Mints a soulbound Cluster Owner credential NFT via Metaplex Core.
 * The NFT is permanently non-transferable (PermanentFreezeDelegate).
 *
 * Usage:
 *   CO_NAME="Rizky Setiawan" \
 *   CLUSTER_SLUG="depok-margonda-001" \
 *   CO_WALLET="7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX" \
 *   npx tsx scripts/mint-co-nft.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { mintCoCredentialNft } from '../src/lib/solana/mintCoNft';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is required in .env.local');
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CO_NAME    = process.env.CO_NAME    ?? 'Rizky Setiawan';
const CLUSTER_SLUG = process.env.CLUSTER_SLUG ?? 'depok-margonda-001';
const CO_WALLET  = process.env.CO_WALLET  ?? '7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX';

async function main() {
  console.log('\n🎨 Minting CO Credential NFT...');
  console.log(`   Name    : ${CO_NAME}`);
  console.log(`   Cluster : ${CLUSTER_SLUG}`);
  console.log(`   Wallet  : ${CO_WALLET}`);
  console.log('');

  const { mintAddress, txSignature } = await mintCoCredentialNft(CO_NAME, CLUSTER_SLUG, CO_WALLET);

  console.log('✅ NFT Minted!');
  console.log(`   Mint Address : ${mintAddress}`);
  console.log(`   Tx Signature : ${txSignature}`);

  // Update the ClusterOwner record with the mint address
  const user = await prisma.user.findFirst({ where: { walletAddress: CO_WALLET } });
  if (user) {
    const co = await prisma.clusterOwner.findUnique({ where: { userId: user.id } });
    if (co) {
      await prisma.clusterOwner.update({
        where: { id: co.id },
        data: { nftMintAddress: mintAddress },
      });
      console.log(`\n📝 DB Updated: ClusterOwner ${co.id} → nftMintAddress set`);
    } else {
      console.log(`\n⚠️  No ClusterOwner record found for wallet ${CO_WALLET}. Mint address NOT saved to DB.`);
      console.log(`   Add it manually: UPDATE cluster_owners SET nft_mint_address = '${mintAddress}' WHERE user_id = '${user.id}';`);
    }
  } else {
    console.log(`\n⚠️  No User with wallet ${CO_WALLET} found. Mint succeeded but DB not updated.`);
    console.log(`   Mint address: ${mintAddress}`);
  }

  console.log('\n🔗 View on Explorer:');
  console.log(`   https://core.metaplex.com/explorer/${mintAddress}?env=devnet`);
}

main()
  .catch(e => {
    console.error('❌ Mint failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
