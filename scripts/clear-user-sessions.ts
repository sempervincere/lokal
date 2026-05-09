/**
 * scripts/clear-user-sessions.ts
 *
 * Safely removes ALL sessions (+ reports, messages, concept forms) for a given
 * user email — without deleting the User record or touching CoEarning data.
 *
 * Usage:
 *   npx tsx scripts/clear-user-sessions.ts
 *   EMAIL=someone@example.com npx tsx scripts/clear-user-sessions.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is required in .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const TARGET_EMAIL = process.env.EMAIL ?? 'business@lokal.id';

async function main() {
  console.log(`\n🔍 Looking up user: ${TARGET_EMAIL}`);

  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: { sessions: { select: { id: true } } },
  });

  if (!user) {
    console.error(`❌ User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const sessionIds = user.sessions.map((s) => s.id);
  console.log(`✅ Found user: ${user.fullName} (${user.id})`);
  console.log(`📋 Sessions to delete: ${sessionIds.length}`);

  if (sessionIds.length === 0) {
    console.log('ℹ️  No sessions found. Nothing to delete.');
    return;
  }

  // ── Safe deletion inside a transaction, respecting FK order ─────────────
  const result = await prisma.$transaction(async (tx) => {
    // 1. Messages (nullable FK to session)
    const { count: msgCount } = await tx.message.deleteMany({
      where: { sessionId: { in: sessionIds } },
    });

    // 2. Reports (1-to-1 with session)
    const { count: reportCount } = await tx.report.deleteMany({
      where: { sessionId: { in: sessionIds } },
    });

    // 3. Concept forms (1-to-1 with session)
    const { count: conceptCount } = await tx.conceptForm.deleteMany({
      where: { sessionId: { in: sessionIds } },
    });

    // 4. Sessions themselves
    const { count: sessionCount } = await tx.session.deleteMany({
      where: { userId: user.id },
    });

    return { msgCount, reportCount, conceptCount, sessionCount };
  });

  console.log('\n✅ Deletion complete:');
  console.log(`   💬 Messages deleted    : ${result.msgCount}`);
  console.log(`   📄 Reports deleted     : ${result.reportCount}`);
  console.log(`   📝 Concept forms deleted: ${result.conceptCount}`);
  console.log(`   🗂️  Sessions deleted    : ${result.sessionCount}`);
  console.log('\n🎉 User account is clean. The User record is intact.\n');
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
