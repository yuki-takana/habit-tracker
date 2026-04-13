import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMetaTextMessage, sendInteractiveWhatsAppReminder, getWhatsAppProvider } from '@/services/whatsapp';
import { processTodoCompletion } from '@/lib/xp-engine';
import { REMINDER_LEAD_TIME_MINS } from '@/lib/constants';

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

        if (action === 'START') {
          await prisma.todo.update({
             where: { id: todoId },
             data: { startedAt: new Date(), status: 'in_progress' }
          });
          await sendMetaTextMessage(
            from,
            `🚀 Awesome! "${todo.task}" is now in progress.\n\nReply 'Done' when you've finished to earn your XP!`
          );
        } else if (action === '15MIN' || action === '30MIN') {
          const addMins = action === '15MIN' ? 15 : 30;
          const newStartTime = new Date(Date.now() + addMins * 60000); 
          const newReminderTime = new Date(newStartTime.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
          
          await prisma.todo.update({
              where: { id: todoId },
              data: {
                  startTime: newStartTime,
                  reminderTime: newReminderTime,
                  delayCount: (todo.delayCount || 0) + 1,
                  lastDelayedAt: new Date(),
                  status: 'upcoming',
                  whatsappNotified: false
              }
          });
          await sendMetaTextMessage(
            from,
            `Understood! 🕒 I've delayed "${todo.task}" by ${addMins} minutes. I'll catch up with you again soon!`
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
        const result = await processTodoCompletion({
            prisma,
            todoId: pendingTodo.id,
        });

        const xp = result.earnedXp;
        let responseMessage = '';
        if (xp < 0) {
            responseMessage = `🔥 Task Marked Done. \n\nAh, we missed our mark and lost ${Math.abs(xp)} XP. It's okay, let's bounce back stronger on the next one!`;
        } else if (xp > 10) {
            responseMessage = `🚀 Awesome velocity! \n\nYou crushed it early and earned +${xp} XP. Keep that high energy flowing!`;
        } else {
            responseMessage = `✅ Solid job! \n\nCompleted. (+${xp} XP). Keep it up!`;
        }

        let nextTodoToRemind: any = null;

        // --- CHAIN NEXT TODO ---
        const nextTodo = await prisma.todo.findFirst({
            where: {
                userId: user.id,
                completed: false,
                id: { not: pendingTodo.id },
                status: { notIn: ['failed', 'missed', 'completed'] }
            },
            orderBy: { startTime: 'asc' }
        });

        if (nextTodo) {
            const now = new Date();
            nextTodoToRemind = nextTodo;
            // Force to 'ready' if start time is in the future
            if (!nextTodo.startedAt && nextTodo.startTime && nextTodo.startTime > now) {
                nextTodoToRemind = await prisma.todo.update({
                    where: { id: nextTodo.id },
                    data: {
                        startTime: now,
                        reminderTime: new Date(now.getTime() - REMINDER_LEAD_TIME_MINS * 60000)
                    }
                });
            }
            responseMessage += `\n\n🎯 Check below for your next task!`;
        }

        await sendMetaTextMessage(from, responseMessage);

        if (nextTodoToRemind) {
            const provider = await getWhatsAppProvider();
            await sendInteractiveWhatsAppReminder(
                from,
                nextTodoToRemind.task,
                user.name || 'User',
                nextTodoToRemind.id,
                provider
            );
            
            await prisma.todo.update({
                where: { id: nextTodoToRemind.id },
                data: { whatsappNotified: true }
            });
        }
      } else if (intent.includes('skip') || intent.includes('later')) {
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