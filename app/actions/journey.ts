'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getJourneyData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            habits: {
                include: {
                    logs: {
                        orderBy: { date: 'desc' },
                        take: 50
                    }
                }
            },
            todos: {
                where: { completed: true },
                orderBy: { updatedAt: 'desc' },
                take: 30
            },
            tasks: {
                where: { status: 'completed' },
                orderBy: { updatedAt: 'desc' },
                take: 20
            }
        }
    });

    if (!user) throw new Error("User not found");

    const events: any[] = [];

    user.habits.forEach(habit => {
        habit.logs.forEach(log => {
            events.push({ id: log.id, date: log.date, type: 'Habit', title: habit.name, icon: 'Flame' });
        });
    });

    user.todos.forEach(todo => {
        if (todo.completedAt) {
            events.push({ id: todo.id, date: todo.completedAt, type: 'Todo', title: todo.task, icon: 'CheckCircle' });
        }
    });

    user.tasks.forEach(task => {
        events.push({ id: task.id, date: task.updatedAt, type: 'Task', title: task.title, icon: 'Target' });
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getJourneyBentoData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { todos: true }
    });

    if (!user) throw new Error("User not found");

    const now = new Date();

    // Arrays for 7/30/365 days
    const xpByDay      = Array(7).fill(0);
    const completedByDay = Array(7).fill(0);
    const failedByDay    = Array(7).fill(0);
    const consistencyData = Array(30).fill(0);
    // 12-month XP for "Year" filter
    const xpByMonth    = Array(12).fill(0);
    const completedByMonth = Array(12).fill(0);

    let totalTodos = user.todos.length;
    let completedTodos = 0;
    let failedTodos = 0;

    // Daily completion rate trend (last 7 days) – what % of all todos were done by that day
    const dailyRateTrend = Array(7).fill(0);

    user.todos.forEach(todo => {
        if (todo.completed) completedTodos++;
        else if (todo.deadline && new Date(todo.deadline) < now) failedTodos++;

        if (todo.completedAt) {
            const ms = now.getTime() - new Date(todo.completedAt).getTime();
            const diffDays = Math.floor(ms / 86400000);

            // 30-day consistency
            if (diffDays >= 0 && diffDays < 30) {
                consistencyData[29 - diffDays]++;
            }
            // 7-day
            if (diffDays >= 0 && diffDays < 7) {
                xpByDay[6 - diffDays] += todo.earnedXp || 20;
                completedByDay[6 - diffDays]++;
                dailyRateTrend[6 - diffDays]++;
            }
            // 12-month
            const diffMonths = Math.floor(ms / (86400000 * 30.44));
            if (diffMonths >= 0 && diffMonths < 12) {
                xpByMonth[11 - diffMonths] += todo.earnedXp || 20;
                completedByMonth[11 - diffMonths]++;
            }
        }

        if (!todo.completed && todo.deadline) {
            const diffDays = Math.floor((now.getTime() - new Date(todo.deadline).getTime()) / 86400000);
            if (diffDays >= 0 && diffDays < 7) {
                failedByDay[6 - diffDays]++;
            }
        }
    });

    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    const overallPerformance = completionRate > 80 ? "Excellent" : completionRate > 50 ? "Good" : "Needs Work";

    return {
        completionRate,
        overallPerformance,
        totalTodos,
        completedTodos,
        failedTodos,
        consistencyData,
        weeklyXp: xpByDay,
        weeklyCompleted: completedByDay,
        weeklyFailed: failedByDay,
        monthlyXp: xpByMonth,
        monthlyCompleted: completedByMonth,
        dailyRateTrend, // 7 data points for completion rate sparkline
    };
}
