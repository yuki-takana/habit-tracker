import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runHabitHealthCalculator() {
    console.log("[HabitHealthCalculator] Starting nightly health assessment...");
    
    try {
        const habits = await prisma.habit.findMany({
            where: { isArchived: false },
            include: {
                logs: {
                    orderBy: { date: "desc" },
                    take: 7,
                }
            }
        });

        for (const habit of habits) {
            // Formula specified:
            // streak weight: 30% (streakCount / longestStreak) * 100
            // completion weight: 50% (avg completionPct over last 7 logs)
            // consistency weight: 20% (100 - variance in daily completion times - simplified)
            
            let streakScore = 0;
            if (habit.longestStreak > 0) {
                streakScore = (habit.streakCount / habit.longestStreak) * 100;
            } else if (habit.streakCount > 0) {
                streakScore = 100;
            }

            let completionScore = 0;
            if (habit.logs.length > 0) {
                const totalPct = habit.logs.reduce((sum, log) => sum + (log.completionPct || 100), 0);
                completionScore = totalPct / habit.logs.length;
            } else {
                completionScore = 0; // No logs in the last period available
            }

            // Consistency (simplified to 100 for now if they have logs, 0 if no recent logs)
            let consistencyScore = habit.logs.length > 0 ? 100 : 0;
            
            // Adjust weights
            let health = (streakScore * 0.30) + (completionScore * 0.50) + (consistencyScore * 0.20);
            
            // Clamp 0-100
            health = Math.max(0, Math.min(100, health));

            let status = "thriving";
            if (health < 30) status = "neglected";
            else if (health < 60) status = "at-risk";

            await prisma.habit.update({
                where: { id: habit.id },
                data: {
                    healthScore: health,
                    healthStatus: status,
                    lastHealthCalc: new Date()
                }
            });

            console.log(`[HabitHealthCalculator] Updated ${habit.name}: Score ${health.toFixed(1)} -> ${status}`);
        }
        
        console.log("[HabitHealthCalculator] Health assessment completed.");
    } catch (error) {
        console.error("[HabitHealthCalculator] Error during execution:", error);
    } finally {
        await prisma.$disconnect();
    }
}
