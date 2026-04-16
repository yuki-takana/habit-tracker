import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/routines/[id]/activate
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const routine = await prisma.routine.findFirst({ where: { id, userId } });
  if (!routine)
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.routine.updateMany({ where: { userId }, data: { isActive: false } }),
    prisma.routine.update({ where: { id }, data: { isActive: true } }),
  ]);

  const updated = await prisma.routine.findUnique({
    where: { id },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({
    success: true,
    message: `"${routine.name}" is now your active routine.`,
    data: updated,
  });
}

// DELETE /api/routines/[id]/activate — deactivate without switching
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

  const updated = await prisma.routine.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: "Routine deactivated.", data: updated });
}
