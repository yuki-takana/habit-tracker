import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMidnightSummaryTemplate } from '@/services/whatsapp-templates';
import { getGlobalWhatsappStatus } from '@/app/action';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // 1. Security Check (Only allow the cron provider to call this)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  // 1.5 Global Toggle Check
  const isGlobalEnabled = await getGlobalWhatsappStatus();
  if (!isGlobalEnabled) {
    return NextResponse.json({ success: true, processed: 0, message: "WhatsApp reminders are globally disabled." });
  }

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 2. Find users with WhatsApp enabled
    const users = await prisma.user.findMany({
      where: {
        whatsappEnabled: true,
        phone: { not: null },
      },
      select: {
        id: true,
        phone: true,
        name: true,
      }
    });

    const results = [];

    // 3. Aggregate stats and send Analysis
    for (const user of users) {
      if (user.phone) {
        try {
          // Fetch all todos meant for today (either completed today or created today/reminder today)
          // Simplified: All todos that have a reminderTime or createdAt today
          const totalTodosCount = await prisma.todo.count({
            where: {
              userId: user.id,
              OR: [
                { reminderTime: { gte: todayStart, lte: todayEnd } },
                { createdAt: { gte: todayStart, lte: todayEnd } }
              ]
            }
          });

          const completedTodosCount = await prisma.todo.count({
            where: {
              userId: user.id,
              completed: true,
              OR: [
                { completedAt: { gte: todayStart, lte: todayEnd } },
                // Fallback: If completedAt is missing but it was created today and is complete
                { createdAt: { gte: todayStart, lte: todayEnd } }
              ]
            }
          });

          if (totalTodosCount === 0) {
            // Skip sending analysis if user did absolutely nothing/had nothing today
            continue;
          }

          const completionRate = Math.round((completedTodosCount / totalTodosCount) * 100);
          const missedCount = totalTodosCount - completedTodosCount;

          await sendMidnightSummaryTemplate(
            user.phone,
            user.name || 'User',
            completedTodosCount,
            missedCount,
            completionRate,
            '🔥 Daily summary',
            '+0 XP' // Placeholder, would need to query XP ledger for accurate daily XP
          );

          results.push({ id: user.id, status: 'success' });
        } catch (error) {
          console.error(`Failed to send EOD Analysis WhatsApp to ${user.phone}:`, error);
          results.push({ id: user.id, status: 'error', error: String(error) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error: any) {
    console.error('Cron EOD Analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
