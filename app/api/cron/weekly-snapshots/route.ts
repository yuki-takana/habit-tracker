import { generateWeeklySnapshot } from "@/lib/memory/generateWeeklySnapshot";
import { prisma } from "@/lib/prisma";

/**
 * Weekly snapshot cron — runs every Sunday night.
 * Generates LLM-summarised weekly ProgressSnapshot for every active user
 * then rebuilds their UserContext.promptContext string.
 *
 * Vercel schedule: "0 23 * * 0" (Sunday 11 PM UTC = Monday 4:30 AM IST)
 * Secured with CRON_SECRET environment variable.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Only process users who have at least one todo (i.e., active users)
  const users = await prisma.user.findMany({
    select: { id: true },
    where: { todos: { some: {} } },
  });

  let processed = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await generateWeeklySnapshot(user.id);
      processed++;
    } catch (err) {
      console.error(`[cron/weekly-snapshots] Failed for userId=${user.id}:`, err);
      failed++;
    }
  }

  return Response.json({ processed, failed, total: users.length });
}
