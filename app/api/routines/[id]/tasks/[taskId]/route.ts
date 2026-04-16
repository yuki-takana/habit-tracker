import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; taskId: string }> };

// PUT /api/routines/[id]/tasks/[taskId]
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;

  const task = await prisma.routineTask.findFirst({
    where: { id: taskId, routineId: id, routine: { userId: session.user.id } },
  });
  if (!task)
    return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await req.json();
  const { title, category, startTime, duration, notes, order } = body;

  if (startTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime))
    return NextResponse.json({ error: "startTime must be HH:MM format" }, { status: 400 });

  const updated = await prisma.routineTask.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(category !== undefined && { category: category || null }),
      ...(startTime !== undefined && { startTime }),
      ...(duration !== undefined && { duration }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(order !== undefined && { order }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/routines/[id]/tasks/[taskId]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, taskId } = await params;

  const task = await prisma.routineTask.findFirst({
    where: { id: taskId, routineId: id, routine: { userId: session.user.id } },
  });
  if (!task)
    return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await prisma.routineTask.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true, message: "Task deleted" });
}
