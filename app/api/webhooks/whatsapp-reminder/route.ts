import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMetaTextMessage } from '@/services/whatsapp';
import { processTodoCompletion } from '@/lib/xp-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const WEBHOOK_VERIFY_TOKEN =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'abcdefghijklmnopqrstuvwxyz';

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ok' });
    }

    const from = message.from;
    const formattedPhone = from.startsWith('+') ? from : `+${from}`;

    let action = '';
    let todoId = '';
    let intent = '';

    if (message.type === 'interactive') {
      const buttonReply = message.interactive?.button_reply;

      if (buttonReply?.id) {
        const payload = buttonReply.id;

        const parts = payload.split('_');
        action = parts[0];
        todoId = parts.slice(1).join('_');

        const todo = await prisma.todo.findUnique({
          where: { id: todoId }
        });

        if (!todo) {
          await sendMetaTextMessage(from, "Task not found.");
          return NextResponse.json({ status: 'ok' });
        }

        if (action === 'DONE') {
          const result = await processTodoCompletion({
            prisma,
            todoId,
          });

          await sendMetaTextMessage(
            from,
            `🔥 ${result.earnedXp >= 0 ? '+' : ''}${result.earnedXp} XP for: ${result.task}`
          );
        }
        if (action === 'LATER') {
          await sendMetaTextMessage(
            from,
            `No worries! You can complete it later: ${todo.task}`
          );
        }

        return NextResponse.json({ status: 'ok' });
      }
    }

    if (message.type === 'text') {
      intent = message.text.body.toLowerCase();

      const user = await prisma.user.findFirst({
        where: { phone: formattedPhone }
      });

      if (!user) return NextResponse.json({ status: 'ok' });

      const pendingTodo = await prisma.todo.findFirst({
        where: { userId: user.id, completed: false },
        orderBy: { startTime: 'asc' }
      });

      if (!pendingTodo) {
        await sendMetaTextMessage(
          from,
          "You don't have any pending tasks right now. ☕"
        );
        return NextResponse.json({ status: 'ok' });
      }

      if (
        intent.includes('done') ||
        intent.includes('completed') ||
        intent.includes('yes')
      ) {
        await prisma.todo.update({
          where: { id: pendingTodo.id },
          data: {
            completed: true,
            completedAt: new Date()
          }
        });

        const earnedXp = (pendingTodo.plannedTime || 10) * 2;

        await prisma.user.update({
          where: { id: user.id },
          data: { xp: { increment: earnedXp } }
        });

        await sendMetaTextMessage(
          from,
          `✅ Completed: ${pendingTodo.task} (+${earnedXp} XP)`
        );
      } else if (intent.includes('skip')) {
        await sendMetaTextMessage(
          from,
          `⏩ Skipped: ${pendingTodo.task}`
        );
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}