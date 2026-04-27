
import { prisma } from "@/lib/prisma";
import { sendTodoStartReminderTemplate } from "@/services/whatsapp-templates";

export async function runWhatsappReminder() {
  const now = new Date();
  const next = new Date(now.getTime() + 5 * 60000);

  const todos = await prisma.todo.findMany({
    where: {
      reminderTime: { lte: next, gte: now },
      whatsappNotified: false,
      completed: false,
    },
    include: {
      user: { select: { phone: true, name: true } }
    }
  });

  for (const todo of todos) {
    if (!todo.user?.phone) continue;

    await sendTodoStartReminderTemplate(
      todo.user.phone,
      todo.user.name || "User",
      todo.task,
      "30",
      todo.id
    );

    await prisma.todo.update({
      where: { id: todo.id },
      data: { whatsappNotified: true }
    });
  }

  console.log("✅ WhatsApp reminders sent:", todos.length);
}