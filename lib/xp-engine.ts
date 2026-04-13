// /lib/xp-engine.ts

import { LATE_PENALTY_XP } from "./constants";
import { addXpToUser, calculateTodoXP } from "./gamify";

export async function processTodoCompletion({
  prisma,
  todoId,
}: {
  prisma: any;
  todoId: string;
}) {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { user: true },
  });

  if (!todo) throw new Error("Todo not found");

  const now = Date.now();

  // ─── DAILY STREAK ───
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const completedTodayCount = await prisma.todo.count({
    where: {
      userId: todo.userId,
      completed: true,
      completedAt: { gte: startOfDay },
    },
  });

  const isFirstOfDay = completedTodayCount === 0;

  // ─── EARLY ───
  let isEarly = false;
  if (todo.deadline) {
    const diffMs = todo.deadline.getTime() - now;
    if (diffMs >= 1 * 60 * 60 * 1000) {
      isEarly = true;
    }
  }

  // ─── LATE ───
  let isLate = false;
  if (todo.deadline) {
    if (now > todo.deadline.getTime()) isLate = true;
  }

  // ─── STARTED LATE ───
  let startedLate = false;
  if (todo.startTime && todo.startedAt) {
    if (todo.startedAt.getTime() > todo.startTime.getTime()) {
      startedLate = true;
    }
  }

  // ─── CALCULATE XP ───
  let earnedXp = calculateTodoXP({
    isAIGenerated: todo.isAIGenerated,
    isEarly,
    isLate,
    isFirstOfDay,
    userLevel: todo.user.level || 1,
    delayCount: todo.delayCount || 0,
    startedLate,
  });
  console.log("xp earned or burned", earnedXp)

  if (isLate) {
    earnedXp = -LATE_PENALTY_XP;
  }

  // ─── UPDATE TODO ───
  await prisma.todo.update({
    where: { id: todoId },
    data: {
      completed: true,
      completedAt: new Date(),
      earnedXp,
    },
  });

  // ─── UPDATE USER ───
  await addXpToUser(prisma, todo.userId, earnedXp);

  return {
    earnedXp,
    task: todo.task,
  };
}