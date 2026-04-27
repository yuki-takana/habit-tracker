import { sendMorningBriefing } from "@/lib/briefing";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Security Check
  // const { searchParams } = new URL(req.url);
  // const secret = searchParams.get('secret');

  // if (secret !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // 2. Business Logic
  try {
    // You can fetch all users with 7am wakeup time here
    // For now, testing with your specific phone
    const users = await prisma.user.findMany({
      where: {
        id: "699dcea62f527ae04ef24336",
        whatsappEnabled: true,
        phone: { not: null },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        wakeUpTime: true,
      },
    });
    await Promise.all(
      users.map((user) =>
        sendMorningBriefing({
          userId: user.id,
          phone: user.phone!,
          name: user.name || "Champion",
          wakeupTime: user.wakeUpTime,
        })
      )
    );

    return NextResponse.json({ success: true, message: `Sent to ${users.length} users` });
  } catch (err) {
    console.error("Error sending briefings:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}