import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, subDays } from "date-fns";
import { processUserDailyProgress } from "@/lib/progress";
import { REMINDER_LEAD_TIME_MINS } from "@/lib/constants";
import { getTodayEndIST } from "@/lib/utils/getTodayEndIST";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        
        // Process progress updates (lazy sync)
        await processUserDailyProgress(userId);

        const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

        // 1. Fetch data in parallel
        const [habitsFromDb, todos, workouts, wakatime, incomePlans, activeChallenge, autoHabits, userData] = await Promise.all([
            prisma.habit.findMany({
                where: { userId },
                include: { logs: { where: { date: { gte: sevenDaysAgo } } } }
            }),
            prisma.todo.findMany({
                where: { userId, createdAt: { gte: sevenDaysAgo } }
            }),
            prisma.workout.findMany({
                where: {
                    workoutPlan: { userId },
                    completedAt: { gte: sevenDaysAgo }
                },
                select: { dayOfWeek: true, isCompleted: true, completedAt: true }
            }),
            prisma.wakaTime.findMany({
                where: { userId, date: { gte: sevenDaysAgo } },
                orderBy: { date: 'asc' }
            }),
            prisma.incomePlan.findMany({
                where: { userId, isActive: true },
                include: { weeks: { include: { tasks: true } } }
            }),
            prisma.challenge.findFirst({
                where: { userId, status: "active" },
                orderBy: { createdAt: "desc" }
            }),
            prisma.habit.findMany({
                where: { userId, autoCreateTodos: true }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    totalStreakDays: true,
                    streakShields: true,
                    streakShieldContinuity: true,
                    roleLevel: true,
                    roleTitle: true,
                    wakatimeApiKey: true,
                    githubApiKey: true,
                    linkedinApiKey: true,
                    twitterApiKey: true,
                    progressTrees: { orderBy: { createdAt: 'desc' }, take: 1 }
                }
            })
        ]);

        const habits = habitsFromDb;
        const user = userData as any;

        // 1.5 Lazy Sync: Create missing todos for today
        const today = startOfDay(new Date());
        const existingSyncTodos = await prisma.todo.findMany({
            where: {
                userId,
                createdAt: { gte: today },
                OR: [
                    { habitId: { not: null } },
                    { challengeId: { not: null } }
                ]
            }
        });

        const syncTasks = [];

        const scheduledStart = new Date();
        const calculatedReminderTime = new Date(scheduledStart.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
        const deadlineTime = new Date(getTodayEndIST());

        // Check Challenge
        if (activeChallenge?.autoCreateTodos) {
            const hasTodo = existingSyncTodos.some(t => t.challengeId === activeChallenge.id);
            if (!hasTodo) {
                syncTasks.push(prisma.todo.create({
                    data: {
                        userId,
                        task: `Daily Challenge: ${activeChallenge.title}`,
                        category: activeChallenge.focus,
                        challengeId: activeChallenge.id,
                        startTime: scheduledStart,
                        reminderTime: calculatedReminderTime,
                        deadline: deadlineTime,
                        completed: false,
                        isAIGenerated: false,
                        createdAt: new Date()
                    }
                }));
            }
        }

        // Check Habits (using autoHabits from Promise.all)
        for (const habit of autoHabits) {
            const hasTodo = (existingSyncTodos as any[]).some(t => t.habitId === habit.id);
            if (!hasTodo) {
                syncTasks.push(prisma.todo.create({
                    data: {
                        userId,
                        task: `Habit: ${habit.name}`,
                        category: habit.category || "Ritual",
                        habitId: habit.id,
                        startTime: scheduledStart,
                        reminderTime: calculatedReminderTime,
                        deadline: deadlineTime,
                        completed: false,
                        isAIGenerated: false,
                        createdAt: new Date()
                    }
                }));
            }
        }

        if (syncTasks.length > 0) {
            await Promise.all(syncTasks);
        }

        // 2. Calculate Top Stats
        let totalPossibleLogs = habits.length * 7;
        let actualLogs = habits.reduce((acc: any, h: { logs: string | any[]; }) => acc + h.logs.length, 0);
        const habitScore = totalPossibleLogs > 0 ? Math.round((actualLogs / totalPossibleLogs) * 100) : 0;

        const streak = user.totalStreakDays || calculateStreak(habits);

        // 3. Prepare Chart Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
            const date = startOfDay(subDays(new Date(), i));
            const dayName = days[date.getDay()];

            const waka = wakatime.find((w: any) => startOfDay(new Date(w.date)).getTime() === date.getTime());
            const codingHours = waka ? parseFloat(waka.totalTime.split('h')[0]) || 0 : 0;

            const workoutDay = workouts.filter((w: any) => w.completedAt && startOfDay(new Date(w.completedAt)).getTime() === date.getTime());
            const intensity = workoutDay.length > 0 ? 80 : 0;

            chartData.push({
                day: dayName,
                commits: Math.round(codingHours * 2), 
                freelance: Math.round(codingHours * 1.5),
                energy: 70 + (codingHours * 2) + (intensity / 10), 
                workoutIntensity: intensity
            });
        }

        return NextResponse.json({
            stats: {
                habitScore: { value: `${habitScore}%`, change: "+4% from last week" },
                streak: { value: streak, label: "days" },
                energy: { value: Math.min(100, habitScore + (workouts.length * 5)), label: "/ 100" },
                commits: { value: wakatime.length > 0 ? wakatime.reduce((acc, w) => acc + 5, 0) : 39, label: "This week" }
            },
            lifeArchitect: {
                roleTitle: user.roleTitle,
                roleLevel: user.roleLevel,
                streakShields: user.streakShields,
                streakShieldContinuity: user.streakShieldContinuity,
                totalStreakDays: user.totalStreakDays,
                forestGrowth: (user.progressTrees as any[])[0]?.growthLevel || 0,
                forestStatus: (user.progressTrees as any[])[0]?.status || "healthy"
            },
            githubActivityData: chartData.map(d => ({ day: d.day, commits: d.commits, freelance: d.freelance })),
            energyGymData: chartData.map(d => ({ day: d.day, energy: d.energy, workoutIntensity: d.workoutIntensity })),
            networkingData: [
                { week: 'Week 1', connections: 5, posts: 2 },
                { week: 'Week 2', connections: 12, posts: 4 },
                { week: 'Week 3', connections: 8, posts: 3 },
                { week: 'Week 4', connections: 20, posts: 7 },
            ], 
            activeChallenge: activeChallenge ? {
                title: activeChallenge.title,
                focus: activeChallenge.focus,
                durationDays: activeChallenge.durationDays,
                startDate: activeChallenge.startDate,
                currentDay: Math.max(1, Math.ceil((new Date().getTime() - new Date(activeChallenge.startDate).getTime()) / (1000 * 60 * 60 * 24)))
            } : null,
            keys: {
                social: !!(user.linkedinApiKey || user.twitterApiKey),
                coding: !!(user.wakatimeApiKey || user.githubApiKey)
            }
        });

    } catch (error: any) {
        console.error("Dashboard Summary Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function calculateStreak(habits: any[]) {
    // Current day streak calculation
    let streak = 0;
    const dates = new Set();
    habits.forEach(h => h.logs.forEach((l: any) => dates.add(startOfDay(new Date(l.date)).getTime())));

    let current = startOfDay(new Date());
    while (dates.has(current.getTime())) {
        streak++;
        current = subDays(current, 1);
    }
    return streak;
}
