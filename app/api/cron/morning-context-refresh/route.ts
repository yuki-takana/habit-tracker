import { computeTodayStats } from "@/lib/memory/computeTodayStats";
import { prisma } from "@/lib/prisma";

/**
 * Morning context refresh cron — runs every morning.
 * Refreshes UserContext.todayStats for all WhatsApp-enabled users so the
 * first message of the day gets instant, pre-computed data.
 *
 * Vercel schedule: "0 1 * * *" (1 AM UTC = 6:30 AM IST)
 * Secured with CRON_SECRET environment variable.
 */

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { whatsappEnabled: true },
    select: { id: true },
  });

  let processed = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const todayStats = await computeTodayStats(user.id);
      await prisma.userContext.upsert({
        where: { userId: user.id },
        update: { todayStats: todayStats as any, lastUpdated: new Date() },
        create: {
          userId: user.id,
          activeGoals: {},
          coreStrengths: [],
          coreWeakness: [],
          todayStats: todayStats as any,
        },
      });
      processed++;
    } catch (err) {
      console.error(`[cron/morning-context-refresh] Failed for userId=${user.id}:`, err);
      failed++;
    }
  }

  return Response.json({ processed, failed, total: users.length });
}
