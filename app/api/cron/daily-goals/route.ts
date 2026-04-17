import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchProgressData, runDailyGoalArchitect } from '@/lib/agents/daily-goal-architect/architect';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  // 1. Security Check
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Find users who want automated goals
    const users = await prisma.user.findMany({
      where: {
        dailyGoalsEnabled: true,
      },
      include: {
        userProfile: true
      }
    });
    const localDate = today.toLocaleDateString('en-CA');

    console.log(`[Cron: Daily Goals] Processing ${users.length} users..., ${JSON.stringify(users)}`);

    const results = [];
    for (const user of users) {
      try {
        // Skip if goals already created today
        const analysisMemoryKey = `daily_analysis_${localDate}`;
        const existingAnalysis = await prisma.agentMemory.findFirst({
          where: {
            userId: user.id,
            key: analysisMemoryKey,
            domain: "daily_goals"
          }
        });
        console.log("===========================================================================")
        if (existingAnalysis) {
          results.push({ email: user.email, status: 'skipped', reason: 'already_generated' });
          continue;
        }

        const wakeUpTime = user.userProfile?.wakeUpTime || "06:30";

        console.log(`[Cron: Daily Goals] Architecting for ${user.email} (Wakeup: ${wakeUpTime})...`);

        const progressData = await fetchProgressData(user.id, prisma);
        const result = await runDailyGoalArchitect({
          userId: user.id,
          wakeUpTime,
          currentDate: new Date(),
          progressData: progressData as any
        });

        results.push({
          email: user.email,
          status: result.success ? 'success' : 'error',
          error: result.success ? null : result.message
        });

      } catch (err: any) {
        console.error(`[Cron: Daily Goals] Failed for user ${user.id}:`, err);
        results.push({ email: user.email, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: users.length,
      results
    });
  } catch (error: any) {
    console.error('[Cron: Daily Goals] Global error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
