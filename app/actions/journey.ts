'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfDay, format } from 'date-fns';

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

    // Add Habit completions
    user.habits.forEach(habit => {
        habit.logs.forEach(log => {
            events.push({
                id: log.id,
                date: log.date,
                type: 'Habit',
                title: habit.name,
                description: 'Completed habit',
                icon: 'Flame'
            });
        });
    });

    // Add Todo completions
    user.todos.forEach(todo => {
        if (todo.completedAt) {
            events.push({
                id: todo.id,
                date: todo.completedAt,
                type: 'Todo',
                title: todo.task,
                description: `Completed todo in category: ${todo.category || 'General'}`,
                icon: 'CheckCircle'
            });
        }
    });

    // Add Task completions
    user.tasks.forEach(task => {
        events.push({
            id: task.id,
            date: task.updatedAt,
            type: 'Task',
            title: task.title,
            description: `Finished task: ${task.description || ''}`,
            icon: 'Target'
        });
    });

    const allEvents = events.sort((a, b) => b.date.getTime() - a.date.getTime());
    console.log(`[Journey] Fetched ${allEvents.length} events for user ${session.user.email}`);
    return allEvents;
}

export async function getJourneyBentoData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Fetch user with todos and habits
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            todos: true,
        }
    });

    if (!user) throw new Error("User not found");

    const now = new Date();
    
    // 7 days XP array
    const xpByDay = Array(7).fill(0);
    const completedByDay = Array(7).fill(0);
    const failedByDay = Array(7).fill(0);
    const consistencyData = Array(30).fill(0);

    let totalTodos = user.todos.length;
    let completedTodos = 0;
    let failedTodos = 0;

    user.todos.forEach(todo => {
        // Evaluate completion rate overall
        if (todo.completed) {
            completedTodos++;
        } else if (todo.deadline && new Date(todo.deadline) < now) {
            failedTodos++;
        }

        // Area chart consistency (last 30 days)
        if (todo.completedAt) {
            const diffDays = Math.floor((now.getTime() - new Date(todo.completedAt).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 30) {
                consistencyData[29 - diffDays]++; // 0 index is oldest, 29 is today
            }

            // 7 days XP
            if (diffDays >= 0 && diffDays < 7) {
                xpByDay[6 - diffDays] += todo.earnedXp || 20; 
                completedByDay[6 - diffDays]++;
            }
        }

        // 7 days failed
        if (!todo.completed && todo.deadline) {
            const diffDays = Math.floor((now.getTime() - new Date(todo.deadline).getTime()) / (1000 * 60 * 60 * 24));
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
        consistencyData, // 30 days completed counts
        weeklyXp: xpByDay, // last 7 days XP
        weeklyCompleted: completedByDay,
        weeklyFailed: failedByDay,
    };
}
