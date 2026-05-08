import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateReport } from '@/lib/ai/reportGenerator';

// POST /api/sessions/[id]/concept
// Submits the concept form for a paid session and triggers report generation.
// Requires: session.status === PAYMENT_CONFIRMED
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // Verify session exists and belongs to user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true, status: true, clusterId: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.status !== 'PAYMENT_CONFIRMED') {
      return NextResponse.json(
        { error: 'PAYMENT_REQUIRED', message: 'Payment must be confirmed before submitting the concept form' },
        { status: 402 },
      );
    }

    const body = await request.json();
    const {
      fbSubcategory,
      conceptName,
      conceptDescription,
      targetCustomer,
      specificQuestions,
      menuItems,
    } = body as {
      fbSubcategory: string;
      conceptName: string;
      conceptDescription: string;
      targetCustomer: string;
      specificQuestions?: string;
      menuItems: Array<{ name: string; price: number; description?: string }>;
    };

    if (!fbSubcategory || !conceptName || !conceptDescription || !targetCustomer || !Array.isArray(menuItems)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create concept form + report in one transaction
    const { report } = await prisma.$transaction(async (tx) => {
      // Check that concept form doesn't already exist (idempotency)
      const existingForm = await tx.conceptForm.findUnique({ where: { sessionId } });
      if (existingForm) {
        throw new Error('Concept form already submitted for this session');
      }

      await tx.conceptForm.create({
        data: {
          sessionId,
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
          sessionId,
          status: 'PENDING',
        },
      });

      return { report };
    });

    // Fire-and-forget report generation
    generateReport(sessionId).catch((err) => {
      console.error(`[sessions/concept] generateReport failed for ${sessionId}:`, err);
    });

    return NextResponse.json({ sessionId, reportId: report.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message.includes('already submitted')) {
      return NextResponse.json({ error: 'Concept form already submitted' }, { status: 409 });
    }
    console.error('[POST /api/sessions/[id]/concept]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
