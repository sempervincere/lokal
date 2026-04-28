import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { buildPaidChatSystemPrompt } from '@/lib/ai/freeChat';
import { callAnthropicStream, readAnthropicStream } from '@/lib/ai/anthropicClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clusterId, sessionId, messages } = body as {
      clusterId: string;
      sessionId?: string;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!clusterId || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing clusterId or messages' }, { status: 400 });
    }

    // Find active session for this user+cluster (or use provided sessionId)
    const session = await prisma.session.findFirst({
      where: sessionId
        ? { id: sessionId, userId: user.id }
        : { userId: user.id, clusterId, status: 'ACTIVE' },
      include: {
        conceptForm: true,
        report: { select: { sections: true } },
      },
      orderBy: { activatedAt: 'desc' },
    });

    if (!session) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 });
    }

    // Check session not expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'SESSION_EXPIRED' }, { status: 403 });
    }

    const conceptForm = session.conceptForm;
    if (!conceptForm) {
      return NextResponse.json({ error: 'No concept form for this session' }, { status: 400 });
    }

    const menuItems = (conceptForm.menuItems as Array<{ name: string; price: number; description?: string }>) ?? [];

    const systemPrompt = await buildPaidChatSystemPrompt(
      clusterId,
      {
        fbSubcategory: conceptForm.fbSubcategory,
        conceptName: conceptForm.conceptName,
        conceptDescription: conceptForm.conceptDescription,
        targetCustomer: conceptForm.targetCustomer,
        specificQuestions: conceptForm.specificQuestions,
        menuItems,
      },
      session.report?.sections as Record<string, unknown> | null,
    );

    let aiRes: Response;
    try {
      aiRes = await callAnthropicStream(systemPrompt, messages, 800, 0.65);
    } catch (err) {
      console.error('[paid chat] AI call failed:', err);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const fullContent = await readAnthropicStream(aiRes, {
            onDelta: (text) => {
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            },
            onDone: () => {},
          });

          const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
          if (lastUserMsg) {
            await prisma.message.create({
              data: {
                userId: user.id,
                clusterId,
                sessionId: session.id,
                role: 'user',
                content: lastUserMsg.content,
                isFree: false,
              },
            }).catch(console.error);
          }
          await prisma.message.create({
            data: {
              userId: user.id,
              clusterId,
              sessionId: session.id,
              role: 'assistant',
              content: fullContent || '(Tidak ada respons)',
              isFree: false,
            },
          }).catch(console.error);

          controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (err) {
          console.error('[paid chat stream]', err);
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[POST /api/chat/paid]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
