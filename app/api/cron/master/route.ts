// /app/api/cron/master/route.ts

import { runWhatsappReminder } from "@/lib/cron/whatsappReminder";
import { runDeadlineReminder } from "@/lib/cron/deadlineReminder";
import { runDailyGoals } from "@/lib/cron/dailyGoals";
import { runWakatimeSync } from "@/lib/cron/wakatime";
import { runMorningBriefing } from "@/lib/cron/morningBriefing";
import { runEodSummary } from "@/lib/cron/eodSummary";
import { runFailOverdue } from "@/lib/cron/failOverdue";
import { runMidnight } from "@/lib/cron/midnight";

export async function POST() {
  const now = new Date();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  console.log("🚀 Master cron running:", now.toISOString());

  await runWhatsappReminder();
  await runDeadlineReminder();

  // ⏰ Hourly
  if (minutes === 0) {
    await runWakatimeSync();
  }

  // 🌅 Morning
  if (hours === 6 && minutes < 5) {
    await runMorningBriefing();
  }

  // 🎯 Daily goals
  if (hours === 5 && minutes < 5) {
    await runDailyGoals();
  }

  // 🌙 EOD
  if (hours === 22 && minutes < 5) {
    await runEodSummary();
  }

  // ❌ Fail overdue
  if (hours === 0 && minutes < 5) {
    await runFailOverdue();
  }

  // 🌌 Midnight
  if (hours === 0 && minutes < 5) {
    await runMidnight();
  }

  return Response.json({ success: true });
}