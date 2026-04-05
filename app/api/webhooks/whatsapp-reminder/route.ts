import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMetaTextMessage } from '@/services/whatsapp';

// 1. GET: Webhook Verification (Meta Dashboard के लिए)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'abcdefghijklmnopqrstuvwxyz';

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const from = message.from;
    const formattedPhone = from.startsWith("+") ? from : `+${from}`;

    let intent = '';
    if (message.type === 'button') {
      intent = message.button.text.toLowerCase();
    } else if (message.type === 'text') {
      intent = message.text.body.toLowerCase();
    }

    if (intent.includes('done') || intent.includes('skip') || intent.includes('completed') || intent.includes('yes')) {
      const user = await prisma.user.findFirst({
        where: { phone: formattedPhone }
      });

      if (user) {
        // Find nearest pending todo for today
        const pendingTodo = await prisma.todo.findFirst({
          where: { userId: user.id, completed: false },
          orderBy: { createdAt: 'desc' }
        });

        if (pendingTodo) {
          const isDone = intent.includes('done') || intent.includes('completed') || intent.includes('yes');
          
          await prisma.todo.update({
            where: { id: pendingTodo.id },
            data: { 
              completed: true,
              completedAt: new Date(),
            }
          });

          if (isDone) {
            const earnedXp = (pendingTodo.plannedTime || 10) * 2;
            await prisma.user.update({
              where: { id: user.id },
              data: { xp: { increment: earnedXp } }
            });
            await sendMetaTextMessage(from, `✅ Great job! You earned ${earnedXp} XP for completing: ${pendingTodo.task}`);
          } else {
            // Skipped
            await sendMetaTextMessage(from, `⏩ Skipped: ${pendingTodo.task}`);
          }
        } else {
          await sendMetaTextMessage(from, "You don't have any pending tasks right now. Take a break! ☕");
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}