import { prisma } from "@/lib/prisma";
import { computeTodayStats } from "./computeTodayStats";

/**
 * Assembles a full context string for any LLM call.
 * Pulls UserContext, domain memories, last 4 weekly snapshots, and recent agent decisions.
 * Optionally includes today's live stats for WhatsApp and real-time agents.
 */
export async function buildAgentContext(
  userId: string,
  domain: string,
  options?: { includeToday?: boolean }
): Promise<string> {
  const [userCtx, memories, snapshots, recentDecisions] = await Promise.all([
    prisma.userContext.findUnique({ where: { userId } }),
    prisma.userMemory.findMany({
      where: { userId, domain: { in: [domain, "global"] } },
      orderBy: { lastReinforced: "desc" },
      take: 20,
    }),
    prisma.progressSnapshot.findMany({
      where: { userId, domain },
      orderBy: { weekStart: "desc" },
      take: 4,
    }),
    prisma.agentDecisionLog.findMany({
      where: { userId, domain },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const todayStats = options?.includeToday ? await computeTodayStats(userId) : null;

  const memoryLines = memories
    .map((m) => `- [${m.domain}/${m.key}]: ${JSON.stringify(m.value)}`)
    .join("\n");

  const snapshotLines = snapshots
    .map(
      (s) =>
        `Week of ${s.weekStart.toDateString()}: ${s.summary} | Completion: ${s.completionRate}% | XP: ${s.xpEarned}\n  Wins: ${s.wins.join(", ") || "none"}\n  Blockers: ${s.blockers.join(", ") || "none"}`
    )
    .join("\n\n");

  const decisionLines = recentDecisions
    .map(
      (d) =>
        `- ${d.actionType} (${d.agentId}): ${JSON.stringify(d.decision).slice(0, 120)}...`
    )
    .join("\n");

  const todaySection = todayStats
    ? `
TODAY'S STATS:
- Todos: ${todayStats.todosCompleted}/${todayStats.todosTotal} completed (${todayStats.completionPct}%)
- XP earned today: ${todayStats.xpToday}
- Habits logged: ${todayStats.habitsLogged} (${todayStats.habitNames.join(", ") || "none"})
- Current streak: ${todayStats.streak} days | Shields: ${todayStats.shields}
- Active session: ${todayStats.activeSession ? todayStats.activeSession.task : "none"}
- Pending todos: ${todayStats.pendingTodos.join(", ") || "none"}
`
    : "";

  return `
=== USER CONTEXT FOR ${domain.toUpperCase()} ===

PROFILE SUMMARY:
${userCtx?.promptContext ?? "No profile yet — treat user as new."}

KNOWN FACTS & PATTERNS (${domain} + global):
${memoryLines || "No memories stored yet."}

LAST 4 WEEKS — ${domain.toUpperCase()}:
${snapshotLines || "No weekly snapshots yet."}

RECENT AGENT DECISIONS:
${decisionLines || "No recent decisions."}
${todaySection}
=== END CONTEXT ===
`.trim();
}
