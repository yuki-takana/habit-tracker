// app/api/cron/habit-reminders/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase/firebase-admin";

export async function GET() {
  try {
    // Fetch all tokens
    const tokens = await prisma.fcmToken.findMany({
      select: {
        userId: true,
        token: true,
      },
    });

    await Promise.allSettled(
      tokens.map((t) =>
        sendPushNotification(
          t.token,
          "🌱 Daily Habits",
          "Your habits are waiting. Keep the streak alive!"
        )
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Habit Reminder Cron Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}