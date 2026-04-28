import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { buildFreeChatSystemPrompt } from '@/lib/ai/freeChat';
import { callAnthropicStream, readAnthropicStream } from '@/lib/ai/anthropicClient';
import { FREE_MESSAGE_LIMIT } from '@/lib/constants/pricing';

// GET /api/chat?clusterId=... — free message count for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ count: 0, remaining: FREE_MESSAGE_LIMIT });

    const { searchParams } = new URL(request.url);
    const clusterId = searchParams.get('clusterId');
    if (!clusterId) return NextResponse.json({ count: 0, remaining: FREE_MESSAGE_LIMIT });

    const count = await prisma.message.count({
      where: {
        userId: user.id,
        clusterId,
        isFree: true,
        sessionId: null,
        role: 'user',
      },
    });

    return NextResponse.json({
      count,
      remaining: Math.max(0, FREE_MESSAGE_LIMIT - count),
    });
  } catch {
    return NextResponse.json({ count: 0, remaining: FREE_MESSAGE_LIMIT });
  }
}

// POST /api/chat — streaming free chat (up to 7 messages)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clusterId, messages } = body as {
      clusterId: string;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!clusterId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing clusterId or messages' }, { status: 400 });
    }

    // DB message count (user messages only)
    const freeCount = await prisma.message.count({
      where: {
        userId: user.id,
        clusterId,
        isFree: true,
        sessionId: null,
        role: 'user',
      },
    });

    if (freeCount >= FREE_MESSAGE_LIMIT) {
      return NextResponse.json({ error: 'FREE_LIMIT_REACHED' }, { status: 402 });
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    const systemPrompt = await buildFreeChatSystemPrompt(clusterId);

    // Save user message
    const savedUserMsg = await prisma.message.create({
      data: {
        userId: user.id,
        clusterId,
        sessionId: null,
        role: 'user',
        content: lastUserMessage.content,
        isFree: true,
        messageNum: freeCount + 1,
      },
    });

    const newCount = freeCount + 1;
    const isLastFree = newCount >= FREE_MESSAGE_LIMIT;

    // Stream from Anthropic
    let aiRes: Response;
    try {
      aiRes = await callAnthropicStream(systemPrompt, messages, 600, 0.65);
    } catch (err) {
      await prisma.message.delete({ where: { id: savedUserMsg.id } }).catch(() => {});
      console.error('[POST /api/chat] AI call failed:', err);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const outStream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        try {
          const fullText = await readAnthropicStream(aiRes, {
            onDelta: (text) => {
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            },
            onDone: () => {},
          });

          // Save assistant message
          await prisma.message.create({
            data: {
              userId: user.id,
              clusterId,
              sessionId: null,
              role: 'assistant',
              content: fullText || '(Tidak ada respons)',
              isFree: true,
              messageNum: newCount,
            },
          }).catch(err => console.error('[chat] save assistant msg failed:', err));

          controller.enqueue(
            enc.encode(`data: ${JSON.stringify({ done: true, count: newCount, isLastFree })}\n\n`)
          );
        } catch (err) {
          console.error('[chat stream]', err);
          controller.enqueue(
            enc.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(outStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[POST /api/chat]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
