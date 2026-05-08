import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');

  // Find BO user (the one creating sessions)
  const boSession = await prisma.session.findFirst({ 
    where: { status: 'PENDING_PAYMENT' },
    orderBy: { createdAt: 'desc' },
    select: { userId: true }
  });
  
  if (!boSession) { console.log('No sessions found'); return; }
  
  const boUser = await prisma.user.findUnique({
    where: { id: boSession.userId },
    select: { id: true, email: true, role: true, walletAddress: true }
  });
  
  console.log('BO user (creates sessions):');
  console.log('  id:', boUser?.id);
  console.log('  email:', boUser?.email);
  console.log('  role:', boUser?.role);
  console.log('  wallet:', boUser?.walletAddress || 'NULL');

  // Find CO user (owns the wallet)
  const coUser = await prisma.user.findUnique({
    where: { walletAddress: '3psJ1RBf4Ci9GxQdqyuC5HgqKntwyzr1jxuHaFyEVfJt' },
    select: { id: true, email: true, role: true }
  });
  
  console.log('\nCO user (owns wallet 3psJ1...):');
  console.log('  id:', coUser?.id);
  console.log('  email:', coUser?.email);
  console.log('  role:', coUser?.role);
  
  // Fix: move wallet from CO user to BO user (for testing)
  if (coUser && boUser && coUser.id !== boUser.id) {
    console.log('\n⚠️  Wallet mismatch! Moving wallet to BO user...');
    await prisma.user.update({ where: { id: coUser.id }, data: { walletAddress: null } });
    await prisma.user.update({ where: { id: boUser.id }, data: { walletAddress: '3psJ1RBf4Ci9GxQdqyuC5HgqKntwyzr1jxuHaFyEVfJt' } });
    console.log('✓ Wallet moved: CO → BO user');
  } else if (boUser && !boUser.walletAddress) {
    console.log('\n⚠️  BO user has no wallet! Setting it...');
    await prisma.user.update({ where: { id: boUser.id }, data: { walletAddress: '3psJ1RBf4Ci9GxQdqyuC5HgqKntwyzr1jxuHaFyEVfJt' } });
    console.log('✓ Wallet set on BO user');
  } else {
    console.log('\n✓ Wallet already correctly assigned');
  }
  
  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
