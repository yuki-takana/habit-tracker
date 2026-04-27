
import { prisma } from "@/lib/prisma";
import { sendDeadlineAlertTemplate } from "@/services/whatsapp-templates";

export async function runDeadlineReminder() {
  const now = new Date();
  const next = new Date(now.getTime() + 5 * 60000);

  const todos = await prisma.todo.findMany({
    where: {
      deadline: { lte: next, gte: now },
      whatsappDeadlineNotified: false,
      completed: false,
    },
    include: {
      user: { select: { phone: true, name: true } }
    }
  });

  for (const todo of todos) {
    if (!todo.user?.phone) continue;

    await sendDeadlineAlertTemplate(
      todo.user.phone,
      todo.user.name || "User",
      todo.task,
      "5",
      todo.id
    );

    await prisma.todo.update({
      where: { id: todo.id },
      data: { whatsappDeadlineNotified: true }
    });
  }

  console.log("✅ Deadline reminders sent:", todos.length);
}