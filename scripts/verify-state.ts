import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  
  const boUser = await prisma.user.findFirst({ where: { email: 'business@lokal.id' }, select: { id: true, email: true, walletAddress: true } });
  const coUser = await prisma.user.findFirst({ where: { email: 'rizky_setiawan@lokal.id' }, select: { id: true, walletAddress: true } });
  const pending = await prisma.session.count({ where: { status: 'PENDING_PAYMENT' } });
  
  console.log('BO user wallet:', boUser?.walletAddress || 'NULL');
  console.log('CO user wallet:', coUser?.walletAddress || 'NULL');
  console.log('Pending sessions:', pending, '(should be 0)');
  
  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
