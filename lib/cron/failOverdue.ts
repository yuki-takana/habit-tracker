import { prisma } from "@/lib/prisma";

export async function runFailOverdue() {

    const now = new Date();
    await prisma.todo.updateMany({
        where: {
            completed: false,
            status: { not: "failed" },
            OR: [
                { deadline: { lte: now } },
                {
                    // If no deadline, but it was created before today, it's overdue
                    deadline: null,
                    createdAt: { lt: new Date(now.setHours(0, 0, 0, 0)) }
                }
            ]
        },
        data: {
            status: "failed",
        }
    });
}