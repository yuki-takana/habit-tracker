import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();

    const tokens = await prisma.fcmToken.findMany({
      select: { token: true },
    });

    await Promise.allSettled(
      tokens.map((t) =>
        sendPushNotification(t.token, title, body, { url })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}