import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInteractiveWhatsAppReminder, getWhatsAppProvider } from '@/services/whatsapp';
import { getGlobalWhatsappStatus } from '@/app/action';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  console.log("⏰ [Cron] Reminder Check Started at:", new Date().toLocaleTimeString());

  // 1.5 Global Toggle Check
  const isGlobalEnabled = await getGlobalWhatsappStatus();
  console.log("Global Status:", isGlobalEnabled ? "✅ Enabled" : "❌ Disabled");
  
  if (!isGlobalEnabled) {
    return NextResponse.json({ success: true, processed: 0, message: "WhatsApp reminders are globally disabled." });
  }

  try {
    const now = new Date();
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
    
    console.log(`🔍 Searching for todos between [${now.toISOString()}] and [${fiveMinsFromNow.toISOString()}]`);

    // 2. Find todos
    const todos = await prisma.todo.findMany({
      where: {
        reminderTime: { lte: fiveMinsFromNow, gte: now },
        whatsappNotified: false,
        completed: false,
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

    console.log(`Found ${todos.length} pending todos for notification.`);

    const results = [];
    for (const todo of todos) {
      console.log(`Processing Todo ID: ${todo.id} | Task: ${todo.task} | User: ${todo.user?.name}`);

      if (todo?.user?.phone) {
        try {
          const provider = await getWhatsAppProvider();
          console.log(`Using Provider: ${provider} for ${todo.user.phone}`);

          await sendInteractiveWhatsAppReminder(
            todo.user.phone,
            todo.task,
            todo.user.name || 'User',
            todo.id,
            provider
          );

          await prisma.todo.update({
            where: { id: todo.id },
            data: { whatsappNotified: true }
          });
          
          console.log(`Successfully notified and updated Todo: ${todo.id}`);
          results.push({ id: todo.id, status: 'success' });
        } catch (error: any) {
          console.error(`Failed to send to ${todo.user.phone}:`, error.message);
          // results.push({ id: id: todo.id, status: 'error', error: String(error) });
        }
      } else {
        console.warn(`User for Todo ${todo.id} has no phone number.`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: todos.length,
      results
    });
  } catch (error: any) {
    console.error('🔥 Heavy Cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}