import { addXpToUser } from "../gamify";
import { prisma } from "../prisma";

export async function applyDailyPenalty() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const start = new Date(yesterday.setHours(0, 0, 0, 0));
    const end = new Date(yesterday.setHours(23, 59, 59, 999));

    const users = await prisma.user.findMany();

    for (const user of users) {
        const completedCount = await prisma.todo.count({
            where: {
                userId: user.id,
                completed: true,
                completedAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        if (completedCount === 0) {
            console.log(`⚠️ User ${user.id} inactive yesterday`);

            const penalty = 20;

            await addXpToUser(prisma, user.id, -penalty);

            console.log("💀 Inactivity Penalty Applied:", penalty);
        }
    }
}