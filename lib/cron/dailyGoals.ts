
import { prisma } from "@/lib/prisma";
import { fetchProgressData, runDailyGoalArchitect } from "@/lib/agents/daily-goal-architect/architect";

export async function runDailyGoals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      dailyGoalsEnabled: true,
    },
    include: { userProfile: true }
  });

  for (const user of users) {
    const progressData = await fetchProgressData(user.id, prisma);

    await runDailyGoalArchitect({
      userId: user.id,
      wakeUpTime: user.wakeUpTime || "06:30",
      currentDate: new Date(),
      progressData: progressData as any
    });
  }

  console.log("✅ Daily goals done");
}