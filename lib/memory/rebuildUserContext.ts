import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { HumanMessage } from "@langchain/core/messages";

/**
 * Regenerates the UserContext.promptContext (and persona fields) from recent
 * snapshots and memories. Called after weekly snapshots are generated or
 * on significant events.
 */
export async function rebuildUserContext(userId: string) {
  const [user, snapshots, memories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        xp: true,
        level: true,
        totalStreakDays: true,
        streakShields: true,
        roleTitle: true,
        habits: {
          select: { name: true, streakCount: true, healthStatus: true },
          take: 5,
        },
      },
    }),
    prisma.progressSnapshot.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 8, // last 2 weeks across all domains
    }),
    prisma.userMemory.findMany({
      where: { userId },
      orderBy: { lastReinforced: "desc" },
      take: 30,
    }),
  ]);

  if (!user) return;

  const snapshotText = snapshots
    .map((s) => `[${s.domain}] ${s.weekStart.toDateString()}: ${s.summary}`)
    .join("\n");

  const memoryText = memories
    .map((m) => `[${m.domain}/${m.key}]: ${JSON.stringify(m.value)}`)
    .join("\n");

  const prompt = `You are analyzing a life-OS user's data to build their AI context profile.

USER STATS:
- Name: ${user.name}
- Level: ${user.level} | XP: ${user.xp}
- Streak: ${user.totalStreakDays} days | Shields: ${user.streakShields}
- Role: ${user.roleTitle}
- Top habits: ${user.habits.map((h) => `${h.name} (streak: ${h.streakCount}, health: ${h.healthStatus})`).join(", ")}

RECENT WEEKLY SNAPSHOTS:
${snapshotText || "No snapshots yet."}

KNOWN FACTS & PATTERNS:
${memoryText || "No memories yet."}

Build a context profile. Respond ONLY in JSON (no markdown fences):
{
  "archetype": "one of: Ambitious Builder | Steady Grinder | Recovering Procrastinator | Momentum Builder | Overcommitter",
  "coreStrengths": ["strength1", "strength2"],
  "coreWeakness": ["weakness1", "weakness2"],
  "currentFocus": "the domain they should prioritize this week",
  "lastWeekSummary": "2-3 sentence digest of last week across all domains",
  "momentumScore": 0,
  "promptContext": "3-4 sentence narrative about this user that an AI agent should know before responding to them"
}`;

  let parsed: any = {};
  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    const raw = response.content.toString();
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("[rebuildUserContext] LLM/parse error:", err);
    parsed = {
      promptContext: `${user.name} is a Level ${user.level} user with a ${user.totalStreakDays}-day streak.`,
    };
  }

  await prisma.userContext.upsert({
    where: { userId },
    update: {
      archetype: parsed.archetype,
      coreStrengths: parsed.coreStrengths ?? [],
      coreWeakness: parsed.coreWeakness ?? [],
      currentFocus: parsed.currentFocus,
      lastWeekSummary: parsed.lastWeekSummary,
      momentumScore: parsed.momentumScore ?? 0,
      promptContext: parsed.promptContext,
      lastUpdated: new Date(),
    },
    create: {
      userId,
      archetype: parsed.archetype,
      coreStrengths: parsed.coreStrengths ?? [],
      coreWeakness: parsed.coreWeakness ?? [],
      activeGoals: {},
      currentFocus: parsed.currentFocus,
      lastWeekSummary: parsed.lastWeekSummary,
      momentumScore: parsed.momentumScore ?? 0,
      promptContext: parsed.promptContext,
    },
  });
}
