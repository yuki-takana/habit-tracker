'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, subDays, endOfDay } from 'date-fns';

export async function getInsightsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            habits: {
                include: {
                    logs: {
                        where: {
                            date: {
                                gte: startOfDay(subDays(new Date(), 30)),
                            },
                        },
                    },
                },
            },
            todos: {
                where: {
                    createdAt: {
                        gte: startOfDay(subDays(new Date(), 30)),
                    },
                },
            },
            workoutPlans: {
                where: { isActive: true },
                include: {
                    workouts: {
                        where: { isCompleted: true },
                    },
                },
            },
            wakaTimeStats: {
                where: {
                    date: {
                        gte: startOfDay(subDays(new Date(), 30)),
                    },
                },
            },
        },
    });

    if (!user) throw new Error("User not found");

    const sub = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "active" }
    });
    const isPro = !!sub;

    // Calculate Focus Distribution
    const categories: Record<string, number> = {};

    // From Todos
    user.todos.forEach(todo => {
        const cat = todo.category || 'General';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    // From Habits
    user.habits.forEach(habit => {
        const cat = habit.category || 'Health';
        const completions = habit.logs.length;
        categories[cat] = (categories[cat] || 0) + completions;
    });

    // From Workouts (Intensity/Focus)
    user.workoutPlans.forEach(plan => {
        plan.workouts.forEach(workout => {
            const cat = 'Fitness';
            categories[cat] = (categories[cat] || 0) + 2; // Arbitrary weight for workout
        });
    });

    const focusData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // Calculate Efficiency Tracker (Score over 7 days)
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const todosCompleted = user.todos.filter(t =>
            t.completed && t.completedAt && startOfDay(t.completedAt).getTime() === date.getTime()
        ).length;

        const habitsCompleted = user.habits.reduce((acc, habit) => {
            return acc + habit.logs.filter(log =>
                startOfDay(log.date).getTime() === date.getTime()
            ).length;
        }, 0);

        const score = (todosCompleted * 10) + (habitsCompleted * 5);
        timelineData.push({ day: dayName, score });
    }

    // Identify Booming Area
    const sortedCategories = [...focusData].sort((a, b) => b.value - a.value);
    const boomingArea = sortedCategories[0]?.name || 'Growth';

    return {
        focusData: focusData.length > 0 ? focusData : [
            { name: 'Code', value: 1 },
            { name: 'Fitness', value: 1 },
            { name: 'Growth', value: 1 }
        ],
        timelineData,
        boomingArea,
        isPro,
    };
}
