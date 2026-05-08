import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  
  // Clean all stale PENDING_PAYMENT sessions (from failed attempts)
  const result = await prisma.session.updateMany({
    where: { status: 'PENDING_PAYMENT' },
    data: { status: 'EXPIRED' }
  });
  
  console.log(`Cleaned ${result.count} stale PENDING_PAYMENT sessions → EXPIRED`);
  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
