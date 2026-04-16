import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/routines — fetch all routines for current user (with tasks)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const routines = await prisma.routine.findMany({
    where: { userId: session.user.id },
    include: {
      tasks: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: routines });
}

// POST /api/routines — create a new routine
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, wakeUpTime, color, emoji } = body;

  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const routine = await prisma.routine.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      wakeUpTime: wakeUpTime || "06:00",
      color: color || null,
      emoji: emoji || null,
      isActive: false,
    },
    include: { tasks: true },
  });

  return NextResponse.json({ success: true, data: routine }, { status: 201 });
}
