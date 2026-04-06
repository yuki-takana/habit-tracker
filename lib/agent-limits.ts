import { prisma } from '@/lib/prisma';
import { isProUser } from '@/lib/subscription';

export async function checkAgentLimit(userId: string, agentId: string) {
    const isPro = await isProUser(userId);
    
    // Pro users automatically get infinite agent limit
    if (isPro) return { allowed: true, reason: 'pro' };

    let record = await prisma.agentRecord.findUnique({
        where: {
            userId_agentId: {
                userId,
                agentId
            }
        }
    });

    const isFreeAgent = ['career', 'project', 'business'].includes(agentId);
    const actualLimit = isFreeAgent ? 1 : 0;

    if (!record) {
        // Create initial record
        record = await prisma.agentRecord.create({
            data: {
                userId,
                agentId,
                promptsUsed: 0,
                promptLimit: actualLimit,
                isPurchased: false
            }
        });
    } else if (record.promptLimit !== actualLimit) {
        // Sync the DB to the new actual limit
        await prisma.agentRecord.update({
            where: { id: record.id },
            data: { promptLimit: actualLimit }
        });
        record.promptLimit = actualLimit;
    }

    if (record.isPurchased) {
        return { allowed: true, reason: 'purchased', promptsUsed: record.promptsUsed, promptLimit: record.promptLimit };
    }

    if (record.promptsUsed >= record.promptLimit) {
        return { allowed: false, reason: 'limit_reached', promptsUsed: record.promptsUsed, promptLimit: record.promptLimit };
    }

    return { allowed: true, reason: 'free_tier', promptsUsed: record.promptsUsed, promptLimit: record.promptLimit };
}

export async function recordAgentUsage(userId: string, agentId: string) {
    const limitStatus = await checkAgentLimit(userId, agentId);
    
    if (!limitStatus.allowed) {
        throw new Error("Agent prompt limit reached. Please upgrade to Pro or purchase this agent to continue.");
    }

    const { isPro } = await isProUser(userId).then(isPro => ({ isPro }));

    // Global tracking on user
    await prisma.user.update({
        where: { id: userId },
        data: { agentUsageCount: { increment: 1 } }
    });

    if (!isPro) {
        await prisma.agentRecord.update({
            where: {
                userId_agentId: {
                    userId,
                    agentId
                }
            },
            data: {
                promptsUsed: { increment: 1 }
            }
        });
    }
}

export async function purchaseAgent(userId: string, agentId: string, amountPaid: number) {
    return await prisma.agentRecord.upsert({
        where: {
            userId_agentId: { userId, agentId }
        },
        update: {
            isPurchased: true,
            purchasedAt: new Date(),
            amountPaid
        },
        create: {
            userId,
            agentId,
            isPurchased: true,
            purchasedAt: new Date(),
            promptsUsed: 0,
            promptLimit: 5,
            amountPaid
        }
    });
}
