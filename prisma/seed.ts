import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌  DATABASE_URL or DIRECT_URL is required in .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // ═══════════════════════════════════════════════════════════════════════
  // 1. ADMIN — dylansius.putra@gmail.com (Google OAuth)
  // ═══════════════════════════════════════════════════════════════════════
  const adminDy = await prisma.user.upsert({
    where: { email: 'dylansius.putra@gmail.com' },
    update: { role: 'ADMIN', fullName: 'Dylansius Putra' },
    create: {
      email: 'dylansius.putra@gmail.com',
      fullName: 'Dylansius Putra',
      role: 'ADMIN',
      kycCompleted: true,
      username: 'dylansius',
      referralSource: 'Friends',
    },
  });
  console.log(`✓  Admin (Google): ${adminDy.email} (role: ${adminDy.role})`);

  // ═══════════════════════════════════════════════════════════════════════
  // 2. ADMIN (email) — admin@lokal.id
  // ═══════════════════════════════════════════════════════════════════════
  const adminEmail = await prisma.user.upsert({
    where: { email: 'admin@lokal.id' },
    update: { role: 'ADMIN', fullName: 'LOKAL Admin' },
    create: {
      email: 'admin@lokal.id',
      fullName: 'LOKAL Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✓  Admin (email): ${adminEmail.email} (role: ${adminEmail.role})`);

  // ═══════════════════════════════════════════════════════════════════════
  // 3. BO — business@lokal.id (password: business123)
  // ═══════════════════════════════════════════════════════════════════════
  const boUser = await prisma.user.upsert({
    where: { email: 'business@lokal.id' },
    update: { role: 'BUSINESS_OWNER' },
    create: {
      email: 'business@lokal.id',
      fullName: 'Budi Santoso',
      role: 'BUSINESS_OWNER',
      companyName: 'Kopi Nusantara',
    },
  });
  console.log(`✓  BO: ${boUser.email} (role: ${boUser.role})`);

  // ═══════════════════════════════════════════════════════════════════════
  // 4. CO — rizky_setiawan@lokal.id (Margonda) + wallet
  //    Password: rizkylokal123
  // ═══════════════════════════════════════════════════════════════════════
  const rizkyUser = await prisma.user.upsert({
    where: { email: 'rizky_setiawan@lokal.id' },
    update: {
      fullName: 'Rizky Setiawan',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'rizky_setiawan',
      walletAddress: '7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX',
    },
    create: {
      email: 'rizky_setiawan@lokal.id',
      fullName: 'Rizky Setiawan',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'rizky_setiawan',
      referralSource: 'Campus',
      walletAddress: '7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX',
    },
  });
  console.log(`✓  CO Rizky: ${rizkyUser.email} (wallet: ${rizkyUser.walletAddress?.slice(0,6)}...)`);

  const rizkyCo = await prisma.clusterOwner.upsert({
    where: { userId: rizkyUser.id },
    update: { coScore: 85, trustScore: 85, isActive: true },
    create: { userId: rizkyUser.id, coScore: 85, trustScore: 85, isActive: true },
  });
  console.log(`✓  CO Profile Rizky: coScore=${rizkyCo.coScore}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 5. CO — christopher@lokal.id (BSD Serpong)
  //    Password: christopherlokal123
  // ═══════════════════════════════════════════════════════════════════════
  const chrisUser = await prisma.user.upsert({
    where: { email: 'christopher@lokal.id' },
    update: {
      fullName: 'Christopher BSD',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'christopher_bsd',
    },
    create: {
      email: 'christopher@lokal.id',
      fullName: 'Christopher BSD',
      role: 'CLUSTER_OWNER',
      kycCompleted: true,
      username: 'christopher_bsd',
      referralSource: 'Referral',
    },
  });
  console.log(`✓  CO Christopher: ${chrisUser.email} (role: ${chrisUser.role})`);

  const chrisCo = await prisma.clusterOwner.upsert({
    where: { userId: chrisUser.id },
    update: { coScore: 82, trustScore: 82, isActive: true },
    create: { userId: chrisUser.id, coScore: 82, trustScore: 82, isActive: true },
  });
  console.log(`✓  CO Profile Christopher: coScore=${chrisCo.coScore}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 6. Jalan Margonda cluster → Rizky
  // ═══════════════════════════════════════════════════════════════════════
  const margonda = await prisma.cluster.upsert({
    where: { slug: 'depok-margonda-001' },
    update: { ownerId: rizkyCo.id },
    create: {
      slug: 'depok-margonda-001',
      name: 'Jalan Margonda Corridor',
      ownerId: rizkyCo.id,
      anchorLat: -6.3728,
      anchorLng: 106.8315,
      anchorLabel: 'Universitas Indonesia Gate',
      radiusKm: 1.5,
      status: 'SEEDING',
    },
  });
  console.log(`✓  Margonda → Rizky (ownerId: ${margonda.ownerId.slice(0,8)}...)`);

  // ═══════════════════════════════════════════════════════════════════════
  // 7. BSD Serpong cluster → Christopher
  // ═══════════════════════════════════════════════════════════════════════
  const bsd = await prisma.cluster.upsert({
    where: { slug: 'tangerang-bsd-serpong-001' },
    update: { ownerId: chrisCo.id },
    create: {
      slug: 'tangerang-bsd-serpong-001',
      name: 'The Breeze BSD Corridor',
      ownerId: chrisCo.id,
      anchorLat: -6.3020,
      anchorLng: 106.6520,
      anchorLabel: 'The Breeze BSD City',
      radiusKm: 1.5,
      status: 'SEEDING',
    },
  });
  console.log(`✓  BSD → Christopher (ownerId: ${bsd.ownerId.slice(0,8)}...)`);

  // ═══════════════════════════════════════════════════════════════════════
  // 8. Clean up orphaned ClusterOwner records (preserve sawangan owner)
  // ═══════════════════════════════════════════════════════════════════════
  const activeCoIds = [rizkyCo.id, chrisCo.id];
  const clusteredCoIds = await prisma.cluster.findMany({
    select: { ownerId: true },
    distinct: ['ownerId'],
  });
  const allActiveIds = new Set([...activeCoIds, ...clusteredCoIds.map(c => c.ownerId)]);

  const orphanCos = await prisma.clusterOwner.findMany({
    where: { id: { notIn: Array.from(allActiveIds) } },
  });

  for (const orphan of orphanCos) {
    const earningsCount = await prisma.coEarning.count({ where: { coId: orphan.id } });
    if (earningsCount === 0) {
      // No earnings, no clusters → safe to delete
      try {
        await prisma.clusterOwner.delete({ where: { id: orphan.id } });
        console.log(`✓  Cleaned up orphan CO: ${orphan.id}`);
      } catch {
        await prisma.clusterOwner.update({
          where: { id: orphan.id },
          data: { isActive: false },
        });
        console.log(`✓  Deactivated orphan CO: ${orphan.id}`);
      }
    } else {
      // Has earnings → preserve, just deactivate
      await prisma.clusterOwner.update({
        where: { id: orphan.id },
        data: { isActive: false },
      });
      console.log(`✓  Deactivated CO (has earnings): ${orphan.id} (${earningsCount} records)`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n🌱  Seed complete — Both clusters ready.');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Email                         │ Password              │ Role         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ admin@lokal.id                │ adminlokal123         │ ADMIN        │');
  console.log('│ dylansius.putra@gmail.com     │ Google OAuth          │ ADMIN        │');
  console.log('│ business@lokal.id             │ business123           │ BO           │');
  console.log('│ rizky_setiawan@lokal.id       │ rizkylokal123         │ CO (Margonda)│');
  console.log('│ christopher@lokal.id          │ christopherlokal123   │ CO (BSD)     │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('\n    Next: run seed scripts to fill the 20 Tier 1 fields:');
  console.log('           npx tsx scripts/seed-margonda.ts');
  console.log('           npx tsx scripts/seed-bsd-serpong.ts');
  console.log('\n    Mint NFTs:');
  console.log('           curl -X POST http://localhost:3000/api/admin/mint-nft \\');
  console.log('             -H "Content-Type: application/json" \\');
  console.log('             -d \'{"coEmail":"rizky_setiawan@lokal.id","walletAddress":"7USd5h19BRgkegmJEXb89aS6Fzw7H1a746LLRCdkwaYX"}\'');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
