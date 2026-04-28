import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateReport } from '@/lib/ai/reportGenerator';

// POST /api/sessions
// Creates a session + concept form + report record, then triggers report generation.
// For hackathon demo: bypasses real IDRX payment — session activates immediately.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clusterId,
      fbSubcategory,
      conceptName,
      conceptDescription,
      targetCustomer,
      specificQuestions,
      menuItems,
    } = body as {
      clusterId: string;
      fbSubcategory: string;
      conceptName: string;
      conceptDescription: string;
      targetCustomer: string;
      specificQuestions?: string;
      menuItems: Array<{ name: string; price: number; description?: string }>;
    };

    if (!clusterId || !fbSubcategory || !conceptName || !conceptDescription || !targetCustomer || !Array.isArray(menuItems)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure user record exists in our DB (synced from Supabase Auth)
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in DB — please log out and log in again' }, { status: 404 });
    }

    // Ensure cluster exists
    const cluster = await prisma.cluster.findUnique({ where: { id: clusterId }, select: { id: true } });
    if (!cluster) {
      return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    // Create session + concept form + report in one transaction
    const { session, report } = await prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          userId: user.id,
          clusterId,
          status: 'PAYMENT_CONFIRMED',
          amountIdrx: 400000,
        },
      });

      await tx.conceptForm.create({
        data: {
          sessionId: session.id,
          fbSubcategory,
          conceptName,
          conceptDescription,
          targetCustomer,
          specificQuestions: specificQuestions ?? null,
          menuItems,
        },
      });

      const report = await tx.report.create({
        data: {
          sessionId: session.id,
          status: 'PENDING',
        },
      });

      return { session, report };
    });

    // Fire-and-forget report generation (Next.js route has 60s timeout on Pro)
    generateReport(session.id).catch((err) => {
      console.error(`[sessions] generateReport failed for ${session.id}:`, err);
    });

    return NextResponse.json({ sessionId: session.id, reportId: report.id });
  } catch (err) {
    console.error('[POST /api/sessions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
