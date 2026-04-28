import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET /api/sessions/[id]
// Returns session status, report status, and report sections when ready.
// Frontend polls this every 3s to track report generation progress.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        clusterId: true,
        status: true,
        activatedAt: true,
        expiresAt: true,
        conceptForm: {
          select: {
            fbSubcategory: true,
            conceptName: true,
            conceptDescription: true,
            targetCustomer: true,
            specificQuestions: true,
            menuItems: true,
          },
        },
        report: {
          select: {
            id: true,
            status: true,
            sections: true,
            errorMessage: true,
            generationTimeMs: true,
            completedAt: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error('[GET /api/sessions/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
