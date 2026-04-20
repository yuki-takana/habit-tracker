import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWhatsAppProvider } from '@/services/whatsapp';
import { sendDeadlineAlertTemplate } from '@/services/whatsapp-templates';
import { getGlobalWhatsappStatus } from '@/app/action';
import { DEADLINE_REMINDER_LEAD_TIME_MINS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  // console.log("⏰ [Cron] Deadline Reminder Check Started at:", new Date().toLocaleTimeString());

  const isGlobalEnabled = await getGlobalWhatsappStatus();
  if (!isGlobalEnabled) {
    return NextResponse.json({ success: true, processed: 0, message: "WhatsApp reminders are globally disabled." });
  }

  try {
    const now = new Date();
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
    
    console.log(`🔍 Searching for todos with deadlines between [${now.toISOString()}] and [${fiveMinsFromNow.toISOString()}]`);

    // Find todos approaching deadline
    const todos = await prisma.todo.findMany({
      where: {
        deadline: { lte: fiveMinsFromNow, gte: now },
        completed: false,
        status: { notIn: ['completed', 'failed'] },
        user: {
          whatsappEnabled: true,
          phone: { not: null },
        }
      },
      include: {
        user: {
          select: { phone: true, name: true }
        }
      }
    });
    console.log(`Found ${todos.length} todos nearing deadline for notification.`);

    const results = [];
    for (const todo of todos) {
      if (todo?.user?.phone) {
        try {
          const provider = await getWhatsAppProvider();
          
          if (provider === 'meta') {
            await sendDeadlineAlertTemplate(
              todo.user.phone,
              todo.user.name || 'User',
              todo.task,
              '15', // default minutesLeft string
              todo.id
            );
          } else {
             console.log(`Fallback twilio / local not implemented for new templates: ${provider}`);
          }

          await prisma.todo.update({
            where: { id: todo.id },
            data: { whatsappDeadlineNotified: true }
          });
          
          results.push({ id: todo.id, status: 'success' });
        } catch (error: any) {
          console.error(`Failed to send deadline reminder to ${todo.user.phone}:`, error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: todos.length,
      results
    });
  } catch (error: any) {
    console.error('🔥 Deadline Cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
