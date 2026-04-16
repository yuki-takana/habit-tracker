import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/routines/[id]/tasks — add a new task
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
    include: { tasks: { select: { order: true } } },
  });
  if (!routine)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const body = await req.json();
  const { title, category, startTime, duration, notes } = body;

  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!startTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime))
    return NextResponse.json({ error: "startTime must be HH:MM format" }, { status: 400 });
  if (!duration || duration < 5 || duration > 480)
    return NextResponse.json({ error: "Duration must be 5–480 minutes" }, { status: 400 });

  const maxOrder = routine.tasks.reduce((m, t) => Math.max(m, t.order), -1);

  const task = await prisma.routineTask.create({
    data: {
      routineId: id,
      title: title.trim(),
      category: category || null,
      startTime,
      duration,
      notes: notes?.trim() || null,
      order: maxOrder + 1,
    },
  });

  return NextResponse.json({ success: true, data: task }, { status: 201 });
}

// PUT /api/routines/[id]/tasks — bulk reorder
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!routine)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const body = await req.json();
  const { tasks } = body as { tasks: { id: string; order: number }[] };

  if (!Array.isArray(tasks))
    return NextResponse.json({ error: "tasks array required" }, { status: 400 });

  await Promise.all(
    tasks.map((t) => prisma.routineTask.update({ where: { id: t.id }, data: { order: t.order } }))
  );

  const updated = await prisma.routineTask.findMany({
    where: { routineId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ success: true, data: updated });
}
