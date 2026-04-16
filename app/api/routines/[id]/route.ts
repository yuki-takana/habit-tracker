import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/routines/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const routine = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (!routine)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: routine });
}

// PUT /api/routines/[id] — update metadata (name, description, wakeUpTime, color, emoji)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, wakeUpTime, color, emoji } = body;
  const { id } = await params;

  // Ensure routine belongs to this user
  const existing = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const updated = await prisma.routine.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(wakeUpTime !== undefined && { wakeUpTime }),
      ...(color !== undefined && { color }),
      ...(emoji !== undefined && { emoji }),
    },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/routines/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.routine.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  await prisma.routine.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "Routine deleted" });
}
