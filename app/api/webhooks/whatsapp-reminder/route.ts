import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWhatsAppProvider } from '@/services/whatsapp';
import {
  sendTaskStartedReply,
  sendTaskCompletedReply,
  sendTaskFailedReply,
  sendSnoozeConfirmationReply,
  sendUnknownMessageReply,
  sendTodoStartReminderTemplate
} from '@/services/whatsapp-templates';
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
async function handleTodoAction(payload: string, from: string) {

  try {
    const parts = payload.split('_');
    const action = parts[0];
    const todoId = parts.slice(1).join('_');

    if (!todoId) {
      console.log("Missing todoId");
      return;
    }

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
      include: { user: true }
    });

    if (!todo || !todo.user) {
      console.log("Todo/User not found:", todoId);
      return;
    }

    const userName = todo.user.name || 'User';

    if (action === 'START') {
      
      await prisma.todo.update({
        where: { id: todoId },
        data: {
          startedAt: new Date(),
          status: 'in_progress'
        }
      });

      await sendTaskStartedReply(from, userName, todo.task);
    }

    else if (action === 'SNOOZE15' || action === 'SNOOZE30') {
      const addMins = action === 'SNOOZE15' ? 15 : 30;

      const newStartTime = new Date(Date.now() + addMins * 60000);
      const newReminderTime = new Date(
        newStartTime.getTime() - REMINDER_LEAD_TIME_MINS * 60000
      );

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

      await sendSnoozeConfirmationReply(from, todo.task, addMins);
    }

    else if (action === 'DONE') {
 
      const result = await processTodoCompletion({
        prisma,
        todoId: todo.id,
      });

      await sendTaskCompletedReply(from, userName, todo.task, result.earnedXp);
    }

    else if (action === 'FAIL') {
      console.log(`❌ FAIL for todoId: ${todoId}`);

      await prisma.todo.update({
        where: { id: todoId },
        data: {
          status: 'failed',
          completed: false
        }
      });

      console.log("⚠️ Marked failed:", todoId);

      await sendTaskFailedReply(from, userName, todo.task);
    }

    else {
      console.log("⚠️ Unknown action:", action);
    }

  } catch (error: any) {
    console.error("💥 Error handling payload:", payload);
    console.error(error.message || error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const change = body.entry?.[0]?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) {
      console.log("ℹ️ [WhatsApp Webhook] No message object in payload (could be status update).");
      return NextResponse.json({ status: 'ok' });
    }

    const from = message.from;
    const formattedPhone = from.startsWith('+') ? from : `+${from}`;

    let intent = '';

    if (message.type === 'interactive') {

      const payload = message.interactive?.button_reply?.id;

      if (!payload) {
        console.log("No interactive payload");
        return NextResponse.json({ status: 'ok' });
      }

      await handleTodoAction(payload, from);
      return NextResponse.json({ status: 'ok' });
    }
    if (message.type === 'button') {
      const payload = message.button?.payload;

      if (!payload) {
        console.log("No button payload");
        return NextResponse.json({ status: 'ok' });
      }

      await handleTodoAction(payload, from);
      return NextResponse.json({ status: 'ok' });
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
        await sendUnknownMessageReply(from, user.name || 'User');
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

        await sendTaskCompletedReply(from, user.name || 'User', pendingTodo.task, result.earnedXp);

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
        }

        if (nextTodoToRemind) {
          const provider = await getWhatsAppProvider();
          if (provider === 'meta') {
            await sendTodoStartReminderTemplate(
              from,
              user.name || 'User',
              nextTodoToRemind.task,
              '30',
              nextTodoToRemind.id
            );
          }

          await prisma.todo.update({
            where: { id: nextTodoToRemind.id },
            data: { whatsappNotified: true }
          });
        }
      } else if (intent.includes('skip') || intent.includes('later')) {
        await prisma.todo.update({
          where: { id: pendingTodo.id },
          data: { status: 'failed', completed: false }
        });
        await sendTaskFailedReply(from, user.name || 'User', pendingTodo.task);
      } else {
        await sendUnknownMessageReply(from, user.name || 'User');
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}