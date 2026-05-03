import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { HumanMessage } from "@langchain/core/messages";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { rebuildUserContext } from "./rebuildUserContext";

const DOMAINS = [
  "career",
  "fitness",
  "income",
  "project",
  "habits",
  "business",
  "learning",
  "mindset",
];

/**
 * Generates LLM-summarised weekly snapshots for all domains for a user.
 * Called by the Sunday-night cron job.
 */
export async function generateWeeklySnapshot(userId: string) {
  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // last Monday
  const weekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // last Sunday

  for (const domain of DOMAINS) {
    try {
      await generateDomainSnapshot(userId, domain, weekStart, weekEnd);
    } catch (err) {
      console.error(`[generateWeeklySnapshot] domain=${domain} userId=${userId}:`, err);
    }
  }

  // After all domains, regenerate the overall UserContext
  await rebuildUserContext(userId);
}

async function generateDomainSnapshot(
  userId: string,
  domain: string,
  weekStart: Date,
  weekEnd: Date
) {
  // Get todos for this domain in this week
  const todos = await prisma.todo.findMany({
    where: {
      userId,
      category: domain,
      createdAt: { gte: weekStart, lte: weekEnd },
    },
  });

  if (todos.length === 0) return; // no activity in this domain this week

  const tasksCompleted = todos.filter((t) => t.completed).length;
  const completionRate = Math.round((tasksCompleted / todos.length) * 100);
  const xpEarned = todos.reduce((sum, t) => sum + (t.earnedXp ?? 0), 0);

  const todoList = todos
    .map((t) => `- [${t.completed ? "✓" : "✗"}] ${t.task}`)
    .join("\n");

  const prompt = `You are a life coach AI. Summarize this user's ${domain} week.

TODOS THIS WEEK:
${todoList}

COMPLETION RATE: ${completionRate}%
XP EARNED: ${xpEarned}

Respond in JSON only (no markdown fences):
{
  "summary": "2 sentence summary of what happened",
  "wins": ["specific win 1", "specific win 2"],
  "blockers": ["specific blocker 1"],
  "agentAdvice": "one actionable recommendation for next week"
}`;

  let parsed: any = {};
  try {
    const response = await model.invoke([new HumanMessage(prompt)]);
    const raw = response.content.toString();
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    parsed = {
      summary: `${tasksCompleted}/${todos.length} tasks completed this week in ${domain}.`,
      wins: [],
      blockers: [],
      agentAdvice: null,
    };
  }

  // Upsert the snapshot
  await prisma.progressSnapshot.upsert({
    where: { userId_domain_weekStart: { userId, domain, weekStart } },
    update: {
      tasksTotal: todos.length,
      tasksCompleted,
      completionRate,
      xpEarned,
      summary: parsed.summary ?? "",
      wins: parsed.wins ?? [],
      blockers: parsed.blockers ?? [],
      agentAdvice: parsed.agentAdvice ?? null,
    },
    create: {
      userId,
      domain,
      weekStart,
      weekEnd,
      tasksTotal: todos.length,
      tasksCompleted,
      completionRate,
      xpEarned,
      summary: parsed.summary ?? "",
      wins: parsed.wins ?? [],
      blockers: parsed.blockers ?? [],
      agentAdvice: parsed.agentAdvice ?? null,
    },
  });
}
