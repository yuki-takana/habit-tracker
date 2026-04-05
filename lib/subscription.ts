import { prisma } from '@/lib/prisma';
import { getSubscriptionConfig } from '@/app/action';

export async function getUserSubscription(userId: string) {
    return await prisma.subscription.findUnique({
        where: { userId },
    });
}

export async function isProUser(userId: string) {
    const sub = await getUserSubscription(userId);
    if (!sub) return false;

    const isValidStatus = ['active', 'trialing'].includes(sub.status);
    const isNotExpired = sub.currentPeriodEnd ? sub.currentPeriodEnd > new Date() : false;

    return isValidStatus && isNotExpired;
}

export async function getSubscriptionLimits(userId: string) {
    const sub = await getUserSubscription(userId);
    const isPro = await isProUser(userId);
    const config = await getSubscriptionConfig();

    return {
        isPro,
        periodEnd: sub?.currentPeriodEnd || null,
        maxHabits: isPro ? Infinity : parseInt(config.free_habit_limit) || 3,
        maxChallenges: isPro ? Infinity : 1,
        maxBlueprintsPerWeek: isPro ? Infinity : parseInt(config.free_blueprint_limit) || 1,
        hasForestView: isPro,
        bossChallengeEnabled: isPro,
        xpMultiplierEnabled: isPro,
    };
}

export async function getActiveHabitCount(userId: string) {
    return await prisma.habit.count({
        where: { userId }
    });
}

export async function hasReachedHabitLimit(userId: string) {
    const limits = await getSubscriptionLimits(userId);
    if (limits.isPro) return false;

    const currentCount = await getActiveHabitCount(userId);
    return currentCount >= limits.maxHabits;
}

export async function getActiveChallengeCount(userId: string) {
    return await prisma.challenge.count({
        where: { userId, status: "active" }
    });
}

export async function hasReachedChallengeLimit(userId: string) {
    const limits = await getSubscriptionLimits(userId);
    if (limits.isPro) return false;

    const currentCount = await getActiveChallengeCount(userId);
    return currentCount >= limits.maxChallenges;
}

// For blueprints, checking count of plans created in the last 7 days
export async function getWeeklyBlueprintCount(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Quick sum of all major plan types created in the last 7 days
    const [income, project, career, life, business, health, learning, mindset, productivity, relationship, networking] = await Promise.all([
        prisma.incomePlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.projectPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.careerPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.lifePlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.businessPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.healthPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.learningPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.mindsetPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.productivityPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.relationshipPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
        prisma.networkingPlan.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return income + project + career + life + business + health + learning + mindset + productivity + relationship + networking;
}

export async function hasReachedBlueprintLimit(userId: string) {
    const limits = await getSubscriptionLimits(userId);
    if (limits.isPro) return false;

    const currentCount = await getWeeklyBlueprintCount(userId);
    return currentCount >= limits.maxBlueprintsPerWeek;
}
