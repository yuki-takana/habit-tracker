import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addXpToUser } from "@/lib/gamify";

export async function POST(req: Request) {
    // Validate cron secret if deployed to Vercel
    // const authHeader = req.headers.get('authorization');
    // if (
    //     process.env.CRON_SECRET && 
    //     authHeader !== `Bearer ${process.env.CRON_SECRET}`
    // ) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const users = await prisma.user.findMany({
            include: {
                todos: true,
                habits: true,
                progressTrees: true,
            }
        });

        // Evaluate for yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        for (const user of users) {
            const yesterdayTodos = user.todos.filter(t => 
                t.createdAt >= yesterday && t.createdAt < todayStart
            );

            const totalTodos = yesterdayTodos.length;
            const completedTodos = yesterdayTodos.filter(t => t.completed).length;

            let updatedTotalStreakDays = user.totalStreakDays;
            let updatedShields = user.streakShields;
            let updatedLastGrace = user.lastGraceActivation;

            // 1. Inactivity Decay (7 days missed)
            // Determine if they've been inactive for 7 days
            const lastActiveTodo = user.todos.filter(t => t.completed).sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0];
            if (lastActiveTodo && lastActiveTodo.completedAt) {
                const diffDays = Math.floor((todayStart.getTime() - lastActiveTodo.completedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    const decay = Math.floor(user.xp * 0.05);
                    await addXpToUser(prisma, user.id, -decay);
                }
            }

            if (totalTodos === 0) {
                // Neutral day. No streak progression, no penalty.
                continue;
            }

            const dailyCompletionRate = completedTodos / totalTodos;

            // 2. Perfect Day Bonus
            if (dailyCompletionRate >= 1.0) {
                const perfectBonus = user.totalStreakDays >= 7 ? 35 : 25;
                await addXpToUser(prisma, user.id, perfectBonus);
            }

            // 3. Streak Logic (60% Rule)
            if (dailyCompletionRate >= 0.60) {
                updatedTotalStreakDays += 1;
                // Note: The logic for 200% grace period is highly complex and usually implemented dynamically upon the 200% day.
                // For now, we will track continuous streaks.
            } else {
                // Streak break condition
                if (user.streakShields > 0 && user.autoShieldEnabled) {
                    // Shield consumed
                    updatedShields -= 1;
                    await addXpToUser(prisma, user.id, -30);
                    // Streak preserved, not incremented
                } else {
                    // Break streak
                    await addXpToUser(prisma, user.id, -50);
                    updatedTotalStreakDays = 0;
                }
            }

            // Unsaved updates to user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    totalStreakDays: updatedTotalStreakDays,
                    streakShields: updatedShields,
                    lastGraceActivation: updatedLastGrace,
                }
            });

            // 4. Tree Growth & Shrink Rule (tied to Habits)
            for (const habit of user.habits) {
                const tree = user.progressTrees.find(pt => pt.referenceId === habit.id);
                if (!tree) continue;

                // Let's find todos purely for this habit
                const habitTodos = user.todos.filter(t => t.habitId === habit.id);
                
                // Sort descending by date
                const sortedHabitTodos = habitTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                // Find last 2 days for consecutive misses check
                // For a robust system, we would query the specific dates.
                const lastTwoTodosScope = sortedHabitTodos.slice(0, 2);
                const consecutiveMisses = lastTwoTodosScope.filter(t => !t.completed).length === 2 && lastTwoTodosScope.length === 2;

                // 3-day rolling rate
                const lastThreeTodosScope = sortedHabitTodos.slice(0, 3);
                const complete3Day = lastThreeTodosScope.filter(t => t.completed).length;
                const total3Day = lastThreeTodosScope.length;
                const rollingRate3Day = total3Day > 0 ? (complete3Day / total3Day) : 1;

                let newStage = tree.stage;
                let newState = tree.state;

                if (consecutiveMisses || rollingRate3Day < 0.50) {
                    newStage = Math.max(0, newStage - 1);
                }

                if (newStage === 0 && tree.stage > 0) {
                    newState = "ghost";
                }

                // Growth logic
                // If thriving, grow. "Sprout: 1-3 days completed. Sapling 4-7 days... etc"
                // It's tied to the habit's overall streak which is stored on Habit currently?
                // `habit.streakCount`
                if (habit.streakCount >= 180 && rollingRate3Day >= 0.90) newStage = 7;
                else if (habit.streakCount >= 90 && rollingRate3Day >= 0.85) newStage = 6;
                else if (habit.streakCount >= 30 && rollingRate3Day >= 0.80) newStage = 5;
                else if (habit.streakCount >= 14 && rollingRate3Day >= 0.75) newStage = 4;
                else if (habit.streakCount >= 4 && rollingRate3Day >= 0.70) newStage = 3;
                else if (habit.streakCount >= 1) newStage = Math.max(newStage, 1);

                // Ghost Tree Revival logic
                if (tree.state === "ghost") {
                    const lastThreeGhostScope = sortedHabitTodos.slice(0, 3);
                    if (lastThreeGhostScope.length === 3 && lastThreeGhostScope.every(t => t.completed)) {
                        newState = "alive";
                        newStage = 1;
                        await addXpToUser(prisma, user.id, 80); // Revival Bonus
                    }
                }

                // Forest Retirement
                if (newStage === 7) {
                    // Wait for a full todo set completion to retire? "When Glowing Tree completes a full todo set". Let's say if dailyCompletionRate >= 1.0 today
                    if (dailyCompletionRate >= 1.0) {
                        newState = "retired";
                        newStage = 0; // reset tree
                    }
                }

                if (newStage !== tree.stage || newState !== tree.state) {
                    await prisma.progressTree.update({
                        where: { id: tree.id },
                        data: {
                            stage: newStage,
                            state: newState,
                        }
                    });
                }
            }
        }

        return NextResponse.json({ message: "Midnight cron executed successfully" });

    } catch (error) {
        console.error("Cron Error", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
