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
  // ── 1. Admin user (for field validation, cluster creation) ────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lokal.id' },
    update: {},
    create: {
      email: 'admin@lokal.id',
      fullName: 'LOKAL Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✓  Admin: ${admin.email} (${admin.id}, role: ${admin.role})`);

  // ── 2. Cluster Owner user (owns the Margonda data) ────────────────────────
  const coUser = await prisma.user.upsert({
    where: { email: 'dylansius.putra@gmail.com' },
    update: {},
    create: {
      email: 'dylansius.putra@gmail.com',
      fullName: 'Dylansius Putra Prasetio',
      role: 'CLUSTER_OWNER',
    },
  });
  console.log(`✓  CO User: ${coUser.email} (${coUser.id}, role: ${coUser.role})`);

  // ── 3. ClusterOwner profile for the CO user ───────────────────────────────
  const co = await prisma.clusterOwner.upsert({
    where: { userId: coUser.id },
    update: {},
    create: {
      userId: coUser.id,
      coScore: 85,
      isActive: true,
    },
  });
  console.log(`✓  ClusterOwner: ${co.id} (coScore: ${co.coScore})`);

  // ── 4. Margonda cluster shell ─────────────────────────────────────────────
  const cluster = await prisma.cluster.upsert({
    where: { slug: 'depok-margonda-001' },
    update: { ownerId: co.id },
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
  console.log(`✓  Cluster: ${cluster.slug} (${cluster.id}, ownerId: ${cluster.ownerId})`);

  // ── 5. Clean up orphaned ClusterOwner (from old seed — admin as CO) ───────
  const orphanedCo = await prisma.clusterOwner.findFirst({
    where: { userId: admin.id },
  });
  if (orphanedCo && orphanedCo.id !== co.id) {
    const clusterCount = await prisma.cluster.count({ where: { ownerId: orphanedCo.id } });
    if (clusterCount === 0) {
      const earningsCount = await prisma.coEarning.count({ where: { coId: orphanedCo.id } });
      if (earningsCount === 0) {
        await prisma.clusterOwner.delete({ where: { id: orphanedCo.id } });
        console.log(`✓  Cleaned up orphaned ClusterOwner: ${orphanedCo.id} (was linked to admin)`);
      } else {
        await prisma.clusterOwner.update({
          where: { id: orphanedCo.id },
          data: { isActive: false },
        });
        console.log(`✓  Deactivated orphaned ClusterOwner: ${orphanedCo.id} (${earningsCount} earnings preserved)`);
      }
    }
  }

  console.log('\n🌱  Seed complete — Margonda shell is ready.');
  console.log('    Admin: admin@lokal.id / adminlokal123');
  console.log('    CO:    dylansius.putra@gmail.com');
  console.log('    Next:  run scripts/seed-margonda.ts (T-15) to fill the 20 Tier 1 fields.');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
