import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  
  const user = await prisma.user.findFirst({
    where: { walletAddress: '3psJ1RBf4Ci9GxQdqyuC5HgqKntwyzr1jxuHaFyEVfJt' },
    select: { id: true, email: true, walletAddress: true, role: true }
  });
  
  console.log('Wallet in DB:', user ? 'YES' : 'NO');
  if (user) {
    console.log('  user.id:', user.id);
    console.log('  email:', user.email);
    console.log('  role:', user.role);
  } else {
    const users = await prisma.user.findMany({ where: { walletAddress: { not: null } }, select: { email: true, walletAddress: true } });
    console.log('Users with wallets:', users.length);
    users.forEach(u => console.log(' ', u.walletAddress?.slice(0,12) + '...', u.email));
  }
  
  const pending = await prisma.session.findMany({ 
    where: { status: 'PENDING_PAYMENT' },
    select: { id: true, userId: true, clusterId: true, createdAt: true }
  });
  console.log('\nPENDING_PAYMENT sessions:', pending.length);
  pending.forEach(s => console.log(' ', s.id.slice(0,8) + '... user=' + s.userId.slice(0,8) + '... created=' + s.createdAt.toISOString().slice(0,19)));
  
  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
