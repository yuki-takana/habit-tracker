'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { differenceInCalendarDays, differenceInCalendarMonths } from 'date-fns';

export type EventType = 'Habit' | 'Todo' | 'Task' | 'Challenge' | 'Blueprint';
export type FilterType = 'Today' | '7D' | 'Month' | 'Year' | 'All Time';

export interface TimelineEvent {
    id: string;
    date: Date;
    type: EventType;
    title: string;
    icon: 'Flame' | 'CheckCircle' | 'Target' | 'Trophy' | 'Zap';
    xp?: number;
}

export interface HabitStats {
    id: string;
    name: string;
    streakCount: number;
    longestStreak: number;
    healthScore: number;
    healthStatus: string;
    category: string | null;
    last7Days: boolean[];
}

export interface ChallengeStats {
    id: string;
    title: string;
    focus: string;
    status: string;
    progressPct: number;
    streakCount: number;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    category: string | null;
}

export interface ActivePlan {
    type: string;
    userGoals: string;
    endDate: Date;
}

export interface JourneyStats {
    // user meta
    xp: number;
    level: number;
    totalStreakDays: number;
    streakShields: number;

    // todo counts (period-scoped)
    totalTodos: number;
    completedTodos: number;
    failedTodos: number;
    pendingTodos: number;
    completionRate: number;
    overallPerformance: 'Excellent' | 'Good' | 'Needs Work';
    chartXp: number[];
    chartCompleted: number[];
    chartFailed: number[];
    chartRate: number[];

    // 30-day / weekly static grids (always full, used in their own cards)
    weeklyXp: number[];          // 7 days, for WeeklyXpBars card
    consistencyData: number[];   // 30 days, for ConsistencyGrid card

    // sub-sections
    habits: HabitStats[];
    totalHabits: number;
    avgHabitStreak: number;

    challenges: ChallengeStats[];
    activeChallenges: number;

    totalTasks: number;
    completedTasks: number;

    activePlans: ActivePlan[];

    aliveTrees: number;
    ghostTrees: number;
    retiredTrees: number;
}

// ─── Auth helper ─────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error('Unauthorized');
    return session.user.id;
}

// ─── Date helpers ─────────────────────────────────────────────

function daysBefore(date: Date, now: Date): number {
    return Math.max(0, differenceInCalendarDays(now, date));
}

function monthsBefore(date: Date, now: Date): number {
    return Math.max(0, differenceInCalendarMonths(now, date));
}

/** Returns the [startDate, endDate) window for a filter */
function getDateRange(filter: FilterType): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // tomorrow midnight

    switch (filter) {
        case 'Today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case '7D': {
            // Monday of current week
            const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            break;
        }
        case 'Month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'Year':
        case 'All Time':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
    }

    return { startDate, endDate };
}

// ─── Timeline ─────────────────────────────────────────────────

export async function getJourneyTimeline(): Promise<TimelineEvent[]> {
    const userId = await getAuthenticatedUserId();

    const [user, challengeMilestones, blueprintTasks] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            include: {
                habits: {
                    where: { isArchived: false },
                    include: {
                        logs: { orderBy: { date: 'desc' }, take: 50 },
                    },
                },
                todos: {
                    where: { completed: true },
                    orderBy: { completedAt: 'desc' },
                    take: 5,
                },
                tasks: {
                    where: { status: 'completed' },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                },
            },
        }),
        prisma.challengeMilestone.findMany({
            where: { challenge: { userId }, isCompleted: true },
            orderBy: { completedAt: 'desc' },
            take: 30,
            include: { challenge: { select: { title: true } } },
        }),
        prisma.blueprintTask.findMany({
            where: { userId, isCompleted: true },
            orderBy: { completedAt: 'desc' },
            take: 30,
        }),
    ]);

    if (!user) throw new Error('User not found');

    const events: TimelineEvent[] = [];

    user.habits.forEach(habit =>
        habit.logs.forEach(log =>
            events.push({ id: log.id, date: log.date, type: 'Habit', title: habit.name, icon: 'Flame' })
        )
    );

    user.todos.forEach(todo => {
        if (todo.completedAt)
            events.push({ id: todo.id, date: todo.completedAt, type: 'Todo', title: todo.task, icon: 'CheckCircle', xp: todo.earnedXp ?? 0 });
    });

    user.tasks.forEach(task =>
        events.push({ id: task.id, date: task.updatedAt, type: 'Task', title: task.title, icon: 'Target' })
    );

    challengeMilestones.forEach(m => {
        if (m.completedAt)
            events.push({ id: m.id, date: m.completedAt, type: 'Challenge', title: `${m.challenge.title} · ${m.title}`, icon: 'Trophy' });
    });

    blueprintTasks.forEach(bt => {
        if (bt.completedAt)
            events.push({ id: bt.id, date: bt.completedAt, type: 'Blueprint', title: bt.title, icon: 'Zap' });
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ─── Main stats ───────────────────────────────────────────────

export async function getJourneyStats(filter: FilterType): Promise<JourneyStats> {
    const userId = await getAuthenticatedUserId();
    const now = new Date();
    const { startDate, endDate } = getDateRange(filter);

    // ── DB queries ──────────────────────────────────────────────
    const [
        user,
        periodTodos,          // only todos relevant to this period
        challenges,
        progressTrees,
        allPlans,
    ] = await Promise.all([

        // user + tasks + habits (no todos — we fetch separately)
        prisma.user.findUnique({
            where: { id: userId },
            include: {
                tasks: true,
                habits: {
                    where: { isArchived: false },
                    include: {
                        logs: {
                            where: { date: { gte: new Date(Date.now() - 7 * 86_400_000) } },
                            orderBy: { date: 'desc' },
                        },
                    },
                },
            },
        }),

        // Only todos that either completed OR failed within the period window
        prisma.todo.findMany({
            where: {
                userId,
                OR: [
                    { completedAt: { gte: startDate, lt: endDate } },
                    {
                        completed: false,
                        deadline: { gte: startDate, lt: endDate },
                    },
                ],
            },
            select: {
                completed: true,
                deadline: true,
                completedAt: true,
                earnedXp: true,
            },
        }),

        prisma.challenge.findMany({ where: { userId } }),
        prisma.progressTree.findMany({ where: { userId } }),

        Promise.all([
            prisma.projectPlan.findMany({ where: { userId, isActive: true }, select: { endDate: true } })
                .then(r => r.map(p => ({ type: 'Project', userGoals: 'Project plan', endDate: p.endDate } as ActivePlan))),
            prisma.careerPlan.findMany({ where: { userId, isActive: true }, select: { targetRole: true, endDate: true } })
                .then(r => r.map(p => ({ type: 'Career', userGoals: p.targetRole, endDate: p.endDate } as ActivePlan))),
            prisma.businessPlan.findMany({ where: { userId, isActive: true }, select: { updatedAt: true } })
                .then(r => r.map(p => ({ type: 'Business', userGoals: 'Business plan', endDate: p.updatedAt } as ActivePlan))),
            prisma.learningPlan.findMany({ where: { userId, isActive: true }, select: { updatedAt: true } })
                .then(r => r.map(p => ({ type: 'Learning', userGoals: 'Learning plan', endDate: p.updatedAt } as ActivePlan))),
            prisma.healthPlan.findMany({ where: { userId, isActive: true }, select: { updatedAt: true } })
                .then(r => r.map(p => ({ type: 'Health', userGoals: 'Health plan', endDate: p.updatedAt } as ActivePlan))),
            prisma.incomePlan.findMany({ where: { userId, isActive: true }, select: { endDate: true } })
                .then(r => r.map(p => ({ type: 'Income', userGoals: 'Income plan', endDate: p.endDate } as ActivePlan))),
            prisma.mindsetPlan.findMany({ where: { userId, isActive: true }, select: { updatedAt: true } })
                .then(r => r.map(p => ({ type: 'Mindset', userGoals: 'Mindset plan', endDate: p.updatedAt } as ActivePlan))),
            prisma.productivityPlan.findMany({ where: { userId, isActive: true }, select: { updatedAt: true } })
                .then(r => r.map(p => ({ type: 'Productivity', userGoals: 'Productivity plan', endDate: p.updatedAt } as ActivePlan))),
        ]),
    ]);

    if (!user) throw new Error('User not found');

    // ── Build chart buckets based on filter ────────────────────

    let chartXp: number[];
    let chartCompleted: number[];
    let chartFailed: number[];
    let chartRate: number[];

    // Also build the two "static" cards that are always 7-day / 30-day
    const weeklyXp = Array(7).fill(0);
    const consistencyData = Array(30).fill(0);

    let completedTodos = 0;
    let failedTodos = 0;

    switch (filter) {

        case 'Today': {
            chartXp = Array(5).fill(0);
            chartCompleted = Array(5).fill(0);
            chartFailed = Array(5).fill(0);

            const dayStart = startDate.getTime();
            const dayLen = endDate.getTime() - dayStart;

            periodTodos.forEach(todo => {
                const isCompleted = todo.completed && !!todo.completedAt;
                const isFailed = !todo.completed && !!todo.deadline && new Date(todo.deadline) < now;

                if (isCompleted) { completedTodos++; }
                if (isFailed) { failedTodos++; }

                if (isCompleted && todo.completedAt) {
                    const bucket = Math.min(4, Math.floor(((new Date(todo.completedAt).getTime() - dayStart) / dayLen) * 5));
                    chartXp[bucket] += todo.earnedXp || 20;
                    chartCompleted[bucket]++;

                    weeklyXp[6] += todo.earnedXp
                    consistencyData[29]++;
                }
                if (isFailed && todo.deadline) {
                    const bucket = Math.min(4, Math.floor(((new Date(todo.deadline).getTime() - dayStart) / dayLen) * 5));
                    chartFailed[bucket]++;
                }
            });

            const total5 = completedTodos + failedTodos || 1;
            chartRate = chartCompleted.map(v => Math.round((v / total5) * 100));
            break;
        }

        // ── 7D: one bucket per day of week (Mon–today) ────────────
        case '7D': {
            chartXp = Array(7).fill(0);
            chartCompleted = Array(7).fill(0);
            chartFailed = Array(7).fill(0);

            periodTodos.forEach(todo => {
                const isCompleted = todo.completed && !!todo.completedAt;
                const isFailed = !todo.completed && !!todo.deadline && new Date(todo.deadline) < now;

                if (isCompleted) completedTodos++;
                if (isFailed) failedTodos++;

                if (isCompleted && todo.completedAt) {
                    const d = daysBefore(new Date(todo.completedAt), now);
                    if (d >= 0 && d < 7) {
                        chartXp[6 - d] += todo.earnedXp || 20;
                        chartCompleted[6 - d]++;
                        weeklyXp[6 - d] += todo.earnedXp || 20;
                        consistencyData[29 - d]++;
                    }
                }
                if (isFailed && todo.deadline) {
                    const d = daysBefore(new Date(todo.deadline), now);
                    if (d >= 0 && d < 7) chartFailed[6 - d]++;
                }
            });

            const total = completedTodos + failedTodos || 1;
            chartRate = chartCompleted.map(v => Math.round((v / total) * 100));
            break;
        }

        // ── Month: one bucket per calendar day (1..today) ─────────
        case 'Month': {
            const daysInPeriod = now.getDate(); // 1-based
            chartXp = Array(daysInPeriod).fill(0);
            chartCompleted = Array(daysInPeriod).fill(0);
            chartFailed = Array(daysInPeriod).fill(0);

            periodTodos.forEach(todo => {
                const isCompleted = todo.completed && !!todo.completedAt;
                const isFailed = !todo.completed && !!todo.deadline && new Date(todo.deadline) < now;

                if (isCompleted) completedTodos++;
                if (isFailed) failedTodos++;

                if (isCompleted && todo.completedAt) {
                    const d = daysBefore(new Date(todo.completedAt), now);
                    if (d >= 0 && d < daysInPeriod) {
                        chartXp[daysInPeriod - 1 - d] += todo.earnedXp || 20;
                        chartCompleted[daysInPeriod - 1 - d]++;
                        if (d < 7) weeklyXp[6 - d] += todo.earnedXp || 20;
                        if (d < 30) consistencyData[29 - d]++;
                    }
                }
                if (isFailed && todo.deadline) {
                    const d = daysBefore(new Date(todo.deadline), now);
                    if (d >= 0 && d < daysInPeriod) chartFailed[daysInPeriod - 1 - d]++;
                }
            });

            const total = completedTodos + failedTodos || 1;
            chartRate = chartCompleted.map(v => Math.round((v / total) * 100));
            break;
        }

        // ── Year / All Time: one bucket per month ─────────────────
        case 'Year':
        case 'All Time': {
            chartXp = Array(12).fill(0);
            chartCompleted = Array(12).fill(0);
            chartFailed = Array(12).fill(0);

            periodTodos.forEach(todo => {
                const isCompleted = todo.completed && !!todo.completedAt;
                const isFailed = !todo.completed && !!todo.deadline && new Date(todo.deadline) < now;

                if (isCompleted) completedTodos++;
                if (isFailed) failedTodos++;

                if (isCompleted && todo.completedAt) {
                    const m = monthsBefore(new Date(todo.completedAt), now);
                    if (m >= 0 && m < 12) {
                        chartXp[11 - m] += todo.earnedXp || 20;
                        chartCompleted[11 - m]++;
                    }
                    const d = daysBefore(new Date(todo.completedAt), now);
                    if (d < 7) weeklyXp[6 - d] += todo.earnedXp || 20;
                    if (d < 30) consistencyData[29 - d]++;
                }
                if (isFailed && todo.deadline) {
                    const m = monthsBefore(new Date(todo.deadline), now);
                    if (m >= 0 && m < 12) chartFailed[11 - m]++;
                }
            });

            const total = completedTodos + failedTodos || 1;
            chartRate = chartCompleted.map(v => Math.round((v / total) * 100));
            break;
        }
    }

    // ── Aggregate totals ───────────────────────────────────────
    const totalTodos = completedTodos + failedTodos;
    const pendingTodos = Math.max(0, totalTodos - completedTodos - failedTodos); // 0 since we only fetched resolved
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    const overallPerformance: 'Excellent' | 'Good' | 'Needs Work' =
        completionRate >= 80 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Work';

    // ── Habits ─────────────────────────────────────────────────
    const habits: HabitStats[] = user.habits.map(habit => {
        const last7Days: boolean[] = Array(7).fill(false);
        habit.logs.forEach(log => {
            const d = daysBefore(new Date(log.date), now);
            if (d >= 0 && d < 7) last7Days[6 - d] = true;
        });
        return {
            id: habit.id,
            name: habit.name,
            streakCount: habit.streakCount,
            longestStreak: habit.longestStreak,
            healthScore: habit.healthScore,
            healthStatus: habit.healthStatus,
            category: habit.category ?? null,
            last7Days,
        };
    });

    const avgHabitStreak =
        habits.length > 0
            ? Math.round(habits.reduce((s, h) => s + h.streakCount, 0) / habits.length)
            : 0;

    // ── Challenges ─────────────────────────────────────────────
    const challengeStats: ChallengeStats[] = challenges.map(c => ({
        id: c.id,
        title: c.title,
        focus: c.focus,
        status: c.status,
        progressPct: c.progressPct,
        streakCount: c.streakCount,
        durationDays: c.durationDays,
        startDate: c.startDate,
        endDate: c.endDate,
        category: c.category ?? null,
    }));

    const activeChallenges = challenges.filter(c => c.status === 'active').length;

    // ── Tasks ──────────────────────────────────────────────────
    const totalTasks = user.tasks.length;
    const completedTasks = user.tasks.filter(t => t.status === 'completed').length;

    // ── Trees ──────────────────────────────────────────────────
    const aliveTrees = progressTrees.filter(t => t.state === 'alive').length;
    const ghostTrees = progressTrees.filter(t => t.state === 'ghost').length;
    const retiredTrees = progressTrees.filter(t => t.state === 'retired').length;

    // ── Plans ──────────────────────────────────────────────────
    const activePlans: ActivePlan[] = (allPlans as ActivePlan[][]).flat();

    return {
        xp: user.xp,
        level: user.level,
        totalStreakDays: user.totalStreakDays,
        streakShields: user.streakShields,

        totalTodos,
        completedTodos,
        failedTodos,
        pendingTodos,
        completionRate,
        overallPerformance,

        chartXp,
        chartCompleted,
        chartFailed,
        chartRate,

        weeklyXp,
        consistencyData,

        habits,
        totalHabits: habits.length,
        avgHabitStreak,

        challenges: challengeStats,
        activeChallenges,

        totalTasks,
        completedTasks,

        activePlans,
        aliveTrees,
        ghostTrees,
        retiredTrees,
    };
}

export async function getJourneyData(filter: string) {
    return getJourneyStats(filter as FilterType);
}
