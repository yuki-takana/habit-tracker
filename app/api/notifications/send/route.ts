import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Fetch tokens for this user
    const tokens = await prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (!tokens.length) {
      return NextResponse.json({ sent: 0 });
    }

    // Send notifications
    const results = await Promise.allSettled(
      tokens.map((t) =>
        sendPushNotification(t.token, title, body)
      )
    );

    return NextResponse.json({
      sent: tokens.length,
      success: results.filter(r => r.status === "fulfilled").length,
      failed: results.filter(r => r.status === "rejected").length,
    });

  } catch (error) {
    console.error("Send Notification Error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}