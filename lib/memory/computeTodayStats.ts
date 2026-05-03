import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export interface TodayStats {
  todosTotal: number;
  todosCompleted: number;
  completionPct: number;
  xpToday: number;
  totalXp: number;
  level: number;
  streak: number;
  shields: number;
  habitsLogged: number;
  habitNames: string[];
  activeSession: { task: string; status: string } | null;
  pendingTodos: string[];
}

/**
 * Computes a real-time snapshot of today's activity for a given user.
 * Called before every WhatsApp reply and by the morning-context-refresh cron.
 */
export async function computeTodayStats(userId: string): Promise<TodayStats> {
  // Day boundaries using user's local clock — simplified to server UTC for now
  // (can enhance with per-user timezone from UserMemory later)
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [todos, habits, activeSession, user] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      select: { completed: true, status: true, task: true, earnedXp: true },
    }),
    prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: dayStart, lte: dayEnd },
      },
      include: { habit: { select: { name: true } } },
    }),
    prisma.todoSession.findFirst({
      where: { userId, status: "RUNNING" },
      include: { todo: { select: { task: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, totalStreakDays: true, streakShields: true, level: true },
    }),
  ]);

  const todosCompleted = todos.filter((t) => t.completed).length;
  const xpToday = todos.reduce((sum, t) => sum + (t.earnedXp ?? 0), 0);

  return {
    todosTotal: todos.length,
    todosCompleted,
    completionPct: todos.length > 0 ? Math.round((todosCompleted / todos.length) * 100) : 0,
    xpToday,
    totalXp: user?.xp ?? 0,
    level: user?.level ?? 1,
    streak: user?.totalStreakDays ?? 0,
    shields: user?.streakShields ?? 0,
    habitsLogged: habits.length,
    habitNames: habits.map((h) => h.habit.name),
    activeSession: activeSession
      ? { task: activeSession.todo.task, status: activeSession.status }
      : null,
    pendingTodos: todos
      .filter((t) => !t.completed && t.status !== "completed")
      .map((t) => t.task)
      .slice(0, 5),
  };
}
