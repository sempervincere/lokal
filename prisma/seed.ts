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
  // ── 1. Admin user ─────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lokal.id' },
    update: {},
    create: {
      email: 'admin@lokal.id',
      fullName: 'LOKAL Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✓  User: ${admin.email} (${admin.id})`);

  // ── 2. ClusterOwner profile for admin ────────────────────────────────────
  const co = await prisma.clusterOwner.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      coScore: 85,
      isActive: true,
    },
  });
  console.log(`✓  ClusterOwner: ${co.id}`);

  // ── 3. Margonda cluster shell ─────────────────────────────────────────────
  const cluster = await prisma.cluster.upsert({
    where: { slug: 'depok-margonda-001' },
    update: {},
    create: {
      slug: 'depok-margonda-001',
      name: 'Jalan Margonda Corridor',
      ownerId: co.id,
      anchorLat: -6.3728,
      anchorLng: 106.8315,
      anchorLabel: 'Universitas Indonesia Gate',
      radiusKm: 1.5,
      status: 'SEEDING',
      confidenceScore: 0,
      dataCompleteness: 0,
      totalValidatedFields: 0,
    },
  });
  console.log(`✓  Cluster: ${cluster.slug} (${cluster.id})`);

  console.log('\n🌱  Seed complete — Margonda shell is ready.');
  console.log('    Next: run scripts/seed-margonda.ts (T-15) to fill the 20 Tier 1 fields.');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
