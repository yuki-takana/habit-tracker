// app/(dashboard)/todos/page.tsx  ← Server Component (no "use client")
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TodosPage from "./todos-client";

// Helper: classify tasks into groups (same logic as your /api/todos/dashboard)
function groupTasks(tasks: any[]) {
  const now = new Date();

  const grouped = {
    today: [] as any[],
    timeUp: [] as any[],
    completed: [] as any[],
    inProgress: [] as any[],
    failed: [] as any[],
  };

  tasks.forEach((task) => {
    if (task.completed || task.status === "completed") {
      grouped.completed.push(task);
    } else if (task.status === "failed") {
      grouped.failed.push(task);
    } else if (task.status === "in_progress") {
      grouped.inProgress.push(task);
    } else if (task.deadline && new Date(task.deadline) < now) {
      grouped.timeUp.push(task);
    } else {
      grouped.today.push(task);
    }
  });

  return grouped;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  // @ts-ignore
  const userId = session.user.id as string;

  // Single DB query — fetch everything needed upfront
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [tasks, userMeta] = await Promise.all([
    prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        userGoals: { take: 1, select: { id: true } },
        routines: { take: 1, select: { id: true } },
      },
    }),
  ]);

  const grouped = groupTasks(tasks);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed || t.status === "completed").length,
    today: tasks.filter(t => {
      const d = t.createdAt ? new Date(t.createdAt) : null;
      return d && d >= today && d < tomorrow;
    }).length,
    timeUps: grouped.timeUp.length,
    inProgress: grouped.inProgress.length,
    failed: grouped.failed.length,
  };

  const hasGoal = !!userMeta?.userGoals?.[0];
  const hasRoutine = !!userMeta?.routines?.[0];

  return (
    <TodosPage
      initialGrouped={grouped}
      initialStats={stats}
      initialHasGoal={hasGoal}
      initialHasRoutine={hasRoutine}
    />
  );
}