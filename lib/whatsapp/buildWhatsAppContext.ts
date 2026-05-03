import { prisma } from "@/lib/prisma";
import { computeTodayStats, type TodayStats } from "@/lib/memory/computeTodayStats";
import { buildAgentContext } from "@/lib/memory/buildAgentContext";
import type { UserContext } from "@prisma/client";

export interface WhatsAppContext {
  todayStats: TodayStats;
  userCtx: UserContext | null;
  agentContext: string;
  domain: string;
}

/**
 * Pulls everything needed for a contextual WhatsApp reply:
 * - Today's live stats
 * - UserContext brain doc
 * - Full agent context string (memories + snapshots + decisions) for the user's focus domain
 */
export async function buildWhatsAppContext(userId: string): Promise<WhatsAppContext> {
  const [todayStats, userCtx] = await Promise.all([
    computeTodayStats(userId),
    prisma.userContext.findUnique({ where: { userId } }),
  ]);

  const domain = userCtx?.currentFocus ?? "overall";
  const agentContext = await buildAgentContext(userId, domain, { includeToday: true });

  return { todayStats, userCtx, agentContext, domain };
}
