/**
 * Script: Setup Demo Accounts
 * 
 * Creates:
 * - Business Owner: business@lokal.id
 * - New Cluster Owner: rizky_setiawan@lokal.id (for Jalan Margonda)
 * - Transfers Margonda cluster to rizky_setiawan
 * - Keeps dylansius.putra@gmail.com as CO for BSD Serpong cluster
 * - Mints soulbound NFT for rizky_setiawan
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DIRECT_URL or DATABASE_URL is required in .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log('Setting up demo accounts...\n');

  // ── 1. Business Owner user ──────────────────────────────────────────
  const boUser = await prisma.user.upsert({
    where: { email: 'business@lokal.id' },
    update: { role: 'BUSINESS_OWNER' },
    create: {
      email: 'business@lokal.id',
      fullName: 'Budi Santoso',
      role: 'BUSINESS_OWNER',
      companyName: 'Kopi Nusantara',
      phoneNumber: '08123456789',
    },
  });
  console.log(`✓  BO User: ${boUser.email} (${boUser.id}, role: ${boUser.role})`);

  // ── 2. New Cluster Owner user for Margonda ──────────────────────────
  const rizkyUser = await prisma.user.upsert({
    where: { email: 'rizky_setiawan@lokal.id' },
    update: { 
      fullName: 'Rizky Setiawan',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'rizky_setiawan',
    },
    create: {
      email: 'rizky_setiawan@lokal.id',
      fullName: 'Rizky Setiawan',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'rizky_setiawan',
      referralSource: 'Campus',
    },
  });
  console.log(`✓  New CO User: ${rizkyUser.email} (${rizkyUser.id}, role: ${rizkyUser.role})`);

  // ── 3. ClusterOwner profile for Rizky ───────────────────────────────
  const rizkyCo = await prisma.clusterOwner.upsert({
    where: { userId: rizkyUser.id },
    update: { coScore: 85, trustScore: 85, isActive: true },
    create: {
      userId: rizkyUser.id,
      coScore: 85,
      trustScore: 85,
      isActive: true,
    },
  });
  console.log(`✓  Rizky ClusterOwner: ${rizkyCo.id} (coScore: ${rizkyCo.coScore})`);

  // ── 4. Transfer Margonda cluster to Rizky ───────────────────────────
  const margondaCluster = await prisma.cluster.update({
    where: { slug: 'depok-margonda-001' },
    data: { ownerId: rizkyCo.id },
  });
  console.log(`✓  Margonda cluster → Rizky (ownerId: ${margondaCluster.ownerId})`);

  // ── 5. Update dylansius user (keep as CO for BSD only) ─────────────
  const dylansiusUser = await prisma.user.findUnique({
    where: { email: 'dylansius.putra@gmail.com' },
  });

  if (dylansiusUser) {
    // BSD cluster should already be assigned to dylansius's ClusterOwner
    const bsdCluster = await prisma.cluster.findUnique({
      where: { slug: 'tangerang-bsd-serpong-001' },
    });

    if (bsdCluster) {
      const dylansiusCo = await prisma.clusterOwner.findUnique({
        where: { userId: dylansiusUser.id },
      });

      if (dylansiusCo && bsdCluster.ownerId !== dylansiusCo.id) {
        await prisma.cluster.update({
          where: { slug: 'tangerang-bsd-serpong-001' },
          data: { ownerId: dylansiusCo.id },
        });
        console.log(`✓  BSD cluster → Dylansius`);
      }
    }
    console.log(`✓  Dylansius CO preserved for BSD cluster`);
  }

  // ── 6. Summary ──────────────────────────────────────────────────────
  console.log('\n=== Account Setup Complete ===');
  console.log('Accounts:');
  console.log('  Admin:    admin@lokal.id / adminlokal123');
  console.log('  BO:       business@lokal.id / (Supabase Google OAuth)');
  console.log('  CO 1:     dylansius.putra@gmail.com → BSD Serpong cluster');
  console.log('  CO 2:     rizky_setiawan@lokal.id → Jalan Margonda cluster');
  console.log('\nNFT minting: run the mint-nft API endpoint separately.');
  console.log(`  Wallet: 7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX`);
}

main()
  .catch((e) => {
    console.error('Setup failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
