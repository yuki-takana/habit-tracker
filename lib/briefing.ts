import { prisma } from "@/lib/prisma";
import { sendMorningBriefingTemplate } from "@/services/whatsapp-templates";

interface BriefingUser {
  userId: string;
  name: string;
  phone: string | null;
  wakeupTime: string | null;
}

export async function sendMorningBriefing({
  userId,
  phone,
  name,
}: BriefingUser) {
  if (!phone) return;
  console.log("Sending morning briefing to", phone);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const workoutPlan = await prisma.workoutPlan.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      workouts: {
        where: { dayOfWeek: today },
        include: { exercises: true },
      },
    },
  });

  let todayTopTasks = "";
  let missedYesterday = "No missed tasks yesterday ✅";

  // 3. Handle rest day
  if (!workoutPlan || workoutPlan.workouts.length === 0) {
    todayTopTasks = "Rest & Recovery Day 🧘‍♂️ Focus on nutrition and recovery.";
  } else {
    const workout = workoutPlan.workouts[0];

    // Convert exercises → readable string
    todayTopTasks = workout.exercises
      .map(
        (ex, i) =>
          `${i + 1}. ${ex.name} (${ex.sets}x${ex.reps})`
      )
      .join(",");
  }

  // 4. Send template message
  return await sendMorningBriefingTemplate(
    phone,
    name || "Champion",
    missedYesterday,
    todayTopTasks
  );
}