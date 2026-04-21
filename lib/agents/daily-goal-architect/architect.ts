import { invokeWithFallback } from "../llm-router";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { saveDailyGoalsTool } from "./tools";

interface DailyGoalContext {
    userId: string;
    wakeUpTime: string; // e.g., "06:30"
    currentDate: Date;
    progressData: {
        habits?: any[];
        challenges?: any[];
        todos?: any[];
        workouts?: any[];
        projects?: any[];
        activePlans?: any[];
        streakData?: any;
        recentCompletions?: any[];
        routine?: {
            id: string;
            name: string;
            wakeUpTime: string;
            energyProfile: string; // "high-focus" | "balanced" | "light"
            activeDays: string[];
            tasks: Array<{
                title: string;
                category: string;
                startTime: string; // "HH:MM"
                duration: number;  // minutes
            }>;
        } | null;
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayShortName(date: Date): string {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
}

function isRoutineActiveToday(
    routine: DailyGoalContext["progressData"]["routine"],
    date: Date
): boolean {
    if (!routine) return false;
    return routine.activeDays.includes(getDayShortName(date));
}

function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
}

function toISOFromHHMM(hhMM: string, baseDate: Date): string {
    const [h, m] = hhMM.split(":").map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return toLocalISOString(d);
}
function addMinutes(iso: string, mins: number): string {
    return new Date(new Date(iso).getTime() + mins * 60000).toISOString();
}

function isoToHHMM(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addMinutesToHHMM(time: string, mins: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + mins;

    const newH = Math.floor((total / 60) % 24);
    const newM = total % 60;

    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function buildRoutineAnchorBlock(
    routine: NonNullable<DailyGoalContext["progressData"]["routine"]>,
    currentDate: Date
): string {
    const sorted = [...routine.tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));

    return sorted.map(t => {
        const iso = toISOFromHHMM(t.startTime, currentDate);
        const endHHMM = addMinutesToHHMM(t.startTime, t.duration);

        return (
            `  • ${t.startTime}–${endHHMM} | ${t.title} (${t.duration} min) [${t.category ?? "General"}]\n` +
            `    → startTime (copy verbatim): "${iso}"`
        );
    }).join("\n");
}

/** 7.5 h (5 × 90-min REM cycles) before wake = optimal sleep start */
function computeSleepTime(wakeUpTime: string): string {
  return addMinutesToHHMM(wakeUpTime, -(7.5 * 60));
}

// ─── Main agent ───────────────────────────────────────────────────────────────

export async function runDailyGoalArchitect(context: DailyGoalContext) {
    const { userId, wakeUpTime, currentDate, progressData } = context;

    const saveTool = saveDailyGoalsTool(userId);
    const tools = [saveTool];

    const routine = progressData.routine ?? null;
    const routineActiveToday = isRoutineActiveToday(routine, currentDate);
    const effectiveWakeUp = routineActiveToday && routine ? routine.wakeUpTime : wakeUpTime;
    console.log("effectiveWakeUp:", effectiveWakeUp);   

    // const firstSlotISO  = addMinutes(toISOFromHHMM(effectiveWakeUp, currentDate), 30);
    const firstSlotHHMM = addMinutesToHHMM(effectiveWakeUp, 30);
    const sleepTime     = computeSleepTime(effectiveWakeUp);
    const sleepISO      = toISOFromHHMM(sleepTime, currentDate);
    const todayISO      = currentDate.toISOString().split("T")[0];

    console.log(`Routine sleep time : ${sleepTime} (${routineActiveToday ? "YES" : "NO"})`);

    const routineAnchorBlock = routineActiveToday && routine
        ? buildRoutineAnchorBlock(routine, currentDate)
        : "NONE — build the full day from scratch using free-form scheduling.";

    // ── Prompt ────────────────────────────────────────────────────────────────

    const missionPrompt = `You are UFL's Elite Daily Goal Architect — the intelligence engine that
transforms a user's wake-up time, active routine, habits, challenges, and plans into a
science-backed, FULL-DAY productivity schedule covering every hour from morning prep to sleep.

This is UFL's flagship feature. The richness, accuracy, and coverage of the todos you create
defines the platform's intelligence. Do not cut corners. Every hour must be scheduled.

══════════════════════════════════════════════════════════
SESSION PARAMETERS
══════════════════════════════════════════════════════════
Date             : ${currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Today ISO date   : ${todayISO}
Wake-up time     : ${effectiveWakeUp}
First work slot  : ${firstSlotHHMM}  (+30 min morning prep after wake)
Target sleep     : ${sleepTime}       (7.5 hours before wake = 5 × 90-min REM cycles)
Routine active   : ${routineActiveToday ? `YES — "${routine?.name}" [${routine?.energyProfile}]` : "NO"}

══════════════════════════════════════════════════════════
ROUTINE ANCHORS  ← copy startTime values VERBATIM, do NOT recalculate
══════════════════════════════════════════════════════════
${routineAnchorBlock}

══════════════════════════════════════════════════════════
USER PROGRESS DATA
══════════════════════════════════════════════════════════
${JSON.stringify(progressData, null, 2)}

══════════════════════════════════════════════════════════
THE PRODUCTIVITY SCIENCE YOU MUST APPLY
══════════════════════════════════════════════════════════

These are not suggestions — they are the rules of the human brain. Build every todo around them.

━━━ 1. ULTRADIAN RHYTHM (Nathaniel Kleitman / Andrew Huberman) ━━━

The brain cycles between ~90-min PEAK focus windows and ~20-min RECOVERY troughs.
Ignoring this causes Ultradian Stress Syndrome — compounding cognitive fatigue.

Implementation:
  • Max focus block = 90 minutes. After every 90-min block: mandatory 20-min recovery todo.
  • Inside each 90-min block use Pomodoro micro-structure: 25 min focus, 5 min rest × 3.
  • Recovery = real downtime: walk, hydrate, eyes-closed. NOT email. NOT more screens.
  • A 2024 DeskTime study found top performers average 75 min focused work + 33 min recovery.
  • Productivity crashes AFTER the 90-min window without recovery. The next peak is also lower.

━━━ 2. CIRCADIAN ENERGY CURVE (Daniel Pink — "When") ━━━

~80% of people follow this daily arc:

  PEAK     (wake → +3 h)      Analytical, strategic, deep cognitive work.
                               Best time: coding, writing, hard decisions, learning.
  TROUGH   (~13:00–15:00)     Lowest alertness. Slowest reaction time.
                               Only use for: email, admin, routine tasks, REST / nap.
  REBOUND  (~15:00–18:00)     Creative energy returns. Insight & brainstorming.
                               Use for: side projects, planning, social, creative work,
                               physical training (body temp peaks, lowest injury risk).

  Today's estimated zones (based on wake ${effectiveWakeUp}):
    PEAK    : ${firstSlotHHMM} – ${addMinutesToHHMM(firstSlotHHMM, 180)}
    TROUGH  : ${isoToHHMM(toISOFromHHMM("13:00", currentDate))} – 15:00
    REBOUND : 15:00 – 18:00
    WIND-DOWN: 18:00 – ${sleepTime}

━━━ 3. DEEP WORK (Cal Newport) ━━━

  • The highest-value work (coding, strategy, writing) needs distraction-free 60–90 min blocks.
  • Schedule 2–3 deep work blocks per day, ONLY in PEAK time.
  • Never put email, messages, or admin during PEAK — it wastes the brain's best hours.
  • Shallow work (email, admin, review) belongs in the TROUGH block exclusively.

━━━ 4. SLEEP SCIENCE (Matthew Walker — "Why We Sleep") ━━━

  • 7–9 hours required. Optimal = 7.5 h = 5 × 90-min REM cycles.
  • Target sleep tonight: ${sleepTime} (7.5 h before ${effectiveWakeUp} tomorrow).
  • Wind-down starts 60 min before sleep. No screens 30 min before.
  • The LAST todo in the schedule MUST be the sleep todo at ${sleepTime}.

━━━ 5. HABIT STACKING (James Clear — "Atomic Habits") ━━━

  • Chain habits to existing anchors: wake→hydrate, coffee→review goals, lunch→walk.
  • Habits need a trigger (cue), a behavior, and a reward. Make each todo feel complete.
  • Never leave a habit task floating — always attach it to a nearby anchor.

━━━ 6. ENERGY MANAGEMENT (Loehr & Schwartz — "Power of Full Engagement") ━━━

  • Physical energy (exercise, nutrition, hydration) enables mental energy.
  • Include: morning movement, proper meals (no skipping), afternoon walk, evening stretch.
  • 10-min post-lunch walk prevents the afternoon crash by regulating blood sugar.

━━━ 7. TASK BATCHING (Cal Newport / David Allen — "GTD") ━━━

  • Group ALL communication (email, messages, social) into ONE batch block in the TROUGH.
  • Do not allow communication to bleed into PEAK — context-switching costs 23 min to recover.
  • Admin tasks batched together take 40% less time than if scattered.

══════════════════════════════════════════════════════════
FULL-DAY SCHEDULE — MANDATORY ZONES
══════════════════════════════════════════════════════════

You MUST create todos for EVERY zone. No zone can be empty. No hour unaccounted for.

┌─────────────────────────────────────────────────────────┐
│ ZONE 1 — MORNING PREP  (${effectiveWakeUp} → ${firstSlotHHMM}, 30 min)              │
└─────────────────────────────────────────────────────────┘
Required todos in order:
  1. Wake up + drink 500ml water  (5 min)  — rehydrates after 7.5 h without water
  2. Make bed  (3 min)  — triggers "completion mode" mindset for the day
  3. Morning movement: stretch / yoga / walk  (15 min)  — OR skip if workout is Zone 2
  4. Breakfast + coffee/tea  (15 min)  — eat within 2 h of waking, stabilises cortisol

┌─────────────────────────────────────────────────────────┐
│ ZONE 2 — DEEP WORK BLOCK 1 / PEAK  (${firstSlotHHMM}, 90 min)    │
└─────────────────────────────────────────────────────────┘
  → User's single HIGHEST-PRIORITY task. Hard cognitive work only.
  → Pull from: overdue P0 items, active challenge tasks, most critical project phase,
    most streak-at-risk habit requiring focused output.
  → No email. No social. No admin. Pure deep work.
After this block: RECOVERY todo (20 min) — walk, stretch, hydrate. Mandatory.

┌─────────────────────────────────────────────────────────┐
│ ZONE 3 — DEEP WORK BLOCK 2 / PEAK  (+20 min recovery, 90 min)   │
└─────────────────────────────────────────────────────────┘
  → Second priority task: learning, secondary project, skill development, habits.
  → Still in cognitive peak window — use it for growth.
After this block: 10–15 min break.

┌─────────────────────────────────────────────────────────┐
│ ZONE 4 — LUNCH + MIDDAY RESET  (~12:00–13:30)           │
└─────────────────────────────────────────────────────────┘
Required todos:
  1. Cook / prepare lunch  (10–15 min if needed)
  2. Eat lunch — protein + carbs + healthy fat  (30–40 min)
  3. Post-lunch walk  (10–15 min)  — MANDATORY. Prevents trough crash. Aids digestion.
  4. Eyes-closed rest / "nappuccino"  (20–25 min)  — optional but powerful
     (Drink coffee, close eyes 20 min — caffeine peaks as you wake)

┌─────────────────────────────────────────────────────────┐
│ ZONE 5 — TROUGH: SHALLOW WORK BATCH  (~13:30–15:00)     │
└─────────────────────────────────────────────────────────┘
  LOW cognitive demand ONLY. Do NOT schedule deep work here.
Required todos:
  1. Email + messages + notifications  (batch ALL in one block, 30–45 min)
  2. Review / file notes from morning work  (15 min)
  3. Admin tasks: invoices, bookkeeping, scheduling  (if applicable)
  4. Light organizational tasks / backlog grooming

┌─────────────────────────────────────────────────────────┐
│ ZONE 6 — REBOUND: CREATIVE + PHYSICAL  (~15:00–18:00)   │
└─────────────────────────────────────────────────────────┘
  → Creative problem-solving, brainstorming, planning, social tasks.
  → Side project work, content creation, LinkedIn/Twitter posts.
  → Physical workout if not done in morning — body temp peaks here,
    reaction time fastest, injury risk lowest (~15:00–17:00 optimal).
  → Mentorship, networking, collaborative calls.
After block: 10 min break.

┌─────────────────────────────────────────────────────────┐
│ ZONE 7 — SHUTDOWN RITUAL  (~17:30–18:30)                │
└─────────────────────────────────────────────────────────┘
Required todos:
  1. Review completed todos — count wins  (10 min)
  2. Write tomorrow's top 3 MITs (Most Important Tasks)  (10 min)
  3. Clear inbox to zero / final messages  (10 min)
  4. Shutdown ritual — close all work apps, declare work day DONE  (5 min)
     "Schedule shutdown complete" — the phrase Cal Newport uses to end work mode.

┌─────────────────────────────────────────────────────────┐
│ ZONE 8 — EVENING RECOVERY  (~18:30–21:00)               │
└─────────────────────────────────────────────────────────┘
Required todos:
  1. Prepare + eat dinner  (45–60 min)  — at least 2–3 h before sleep
  2. Personal time: hobby / family / entertainment / social  (60–90 min)
  3. Evening walk or light movement if no afternoon workout  (15–20 min)

┌─────────────────────────────────────────────────────────┐
│ ZONE 9 — WIND-DOWN  (60 min before ${sleepTime})                 │
└─────────────────────────────────────────────────────────┘
Required todos:
  1. Digital sunset — stop all screens / blue light  (5 min)
  2. Journaling: 3 wins today + 1 lesson learned  (10–15 min)
  3. Reading — physical book or Kindle nightmode  (20–30 min)
  4. Light stretching + breathing exercise  (10 min)
  5. Tomorrow prep: check calendar, lay out workout clothes  (5–10 min)

┌─────────────────────────────────────────────────────────┐
│ ZONE 10 — SLEEP  (${sleepTime} — THE LAST TODO)                  │
└─────────────────────────────────────────────────────────┘
  • Sleep — 7.5 hours (5 × 90-min REM cycles)  (450 min)
  • startTime: "${sleepISO}"
  • This MUST be the final todo in scheduledTodos.

══════════════════════════════════════════════════════════
ROUTINE INTEGRATION
══════════════════════════════════════════════════════════

${routineActiveToday ? `
ROUTINE IS ACTIVE — MANDATORY:

1. Create one scheduledTodo per routine task. Copy startTime ISO VERBATIM from anchors above.
   plannedTime = exact duration from routine. Do not round or shift.

2. Identify FREE windows between anchors (before first, between each pair, after last).
   Fill every free window with AI-generated todos from the zones above.

3. Chain gap-fill todos:
   nextTodo.startTime = prevTodo.startTime + prevTodo.plannedTime (min) + break (min)
   Breaks: ≥90 min → 20 min | ≥60 min → 15 min | ≥45 min → 10 min | ≥30 min → 5 min | <30 → 3 min

4. Energy profile overrides:
   "high-focus" → pack deep work early, minimal padding, skip creative rebound if needed
   "balanced"   → standard zone layout (default)
   "light"      → max 3 h focused work, emphasise health, rest, social todos

5. Set linkedTo: "routine:${routine?.id ?? "ROUTINE_ID"}" for all routine anchor todos.
` : `
NO ROUTINE ACTIVE — build entire day from scratch.
First todo: ${firstSlotHHMM} (Zone 1 morning prep).
Chain all todos sequentially with correct breaks.
Cover all 10 zones. Last todo: sleep at ${sleepTime}.
`}

══════════════════════════════════════════════════════════
PROGRESS-AWARE INTELLIGENCE
══════════════════════════════════════════════════════════

Apply these rules against the progress data above:

STREAK MAINTENANCE — P0 Critical
  Any habit with streakCount > 0 that has not been logged today MUST have a todo.
  Place it in the correct energy zone (fitness → Zone 2/6, mindset → Zone 1/9).

ACTIVE CHALLENGES — P1 High
  Each active challenge needs at least 1 specific daily action todo.

OVERDUE TODOS — P0 if >2 days overdue, P1 otherwise
  Surface up to 3. Schedule them in Peak or Rebound zones.

ACTIVE PLANS — P1-P2
  Pull the most relevant incomplete task from each active plan.
  Workout plan → Zone 2 or 6. Learning → Zone 3 or 6. Career/Income → Zone 2 or 6.

DOMAIN COVERAGE — ensure at least 1 todo per domain the user has habits in:
  Fitness/Health → Zone 2 or 6
  Learning/Career → Zone 2 or 3
  Mindset/Mental → Zone 1 or 9
  Business/Code → Zone 2 or 6
  Relationships → Zone 8

STREAK SHIELD
  If streakShieldContinuity > 0: user needs 50–60%+ completion.
  Adjust total todo count so hitting the shield target is achievable.

══════════════════════════════════════════════════════════
TIMESTAMP RULES
══════════════════════════════════════════════════════════

Routine anchors → copy ISO from anchor block VERBATIM.

Gap-fill / free-form todos → chain strictly:
  todo[N].startTime = todo[N-1].startTime + todo[N-1].plannedTime + breakDuration

Break table:
  plannedTime ≥ 90 min → 20 min break
  plannedTime ≥ 60 min → 15 min break
  plannedTime ≥ 45 min → 10 min break
  plannedTime ≥ 30 min →  5 min break
  plannedTime < 30 min →  3 min transition

Lunch: always leave a natural gap ~12:00–13:30.
Last scheduled todo: sleep at ${sleepTime} → startTime: "${sleepISO}"
All timestamps: ISO 8601 using today ${todayISO}. No todo after ${sleepTime}.

══════════════════════════════════════════════════════════
QUALITY CHECKLIST — verify before calling save_daily_goals
══════════════════════════════════════════════════════════

✅ All routine anchors present with verbatim ISO timestamps
✅ MINIMUM 14 scheduledTodos (ideally 18–24 for a full day)
✅ All 10 zones covered — no hour unaccounted for
✅ Zone 1 morning prep todos: hydration, movement, breakfast
✅ Zone 2+3 deep work todos in PEAK window only
✅ Zone 4 lunch + post-lunch walk todos present
✅ Zone 5 trough block has ONLY admin/low-cognitive tasks
✅ Zone 6 rebound / physical block present
✅ Zone 7 shutdown ritual present
✅ Zone 9 wind-down todos: journaling, reading, stretching
✅ Zone 10 sleep todo is the ABSOLUTE LAST todo
✅ Streak-at-risk habits have a maintenance todo
✅ No two todos overlap (startTime + plannedTime must not cross next todo's startTime)
✅ Total focused work ≤ 8 hours
✅ All timestamps use date ${todayISO}
✅ scheduledTodos array sorted by startTime ascending

══════════════════════════════════════════════════════════
CALL save_daily_goals WITH:
══════════════════════════════════════════════════════════

{
  dailySummary: "2–3 inspiring sentences: mention wake time, top 1-2 focus areas, sleep target",
  
  analysisInsights: {
    streakStatus: "Which habits have active streaks, which are at risk, what is needed",
    topPriorities: ["Top 3–5 most critical tasks for today"],
    gapsIdentified: ["Neglected life domains, overdue items, or weak areas"],
    energyAllocation: "How PEAK/TROUGH/REBOUND/WIND-DOWN time is allocated across all todos"
  },
  
  scheduledTodos: [
    // MINIMUM 14. Ideally 18–24. Sorted by startTime ascending.
    // Last todo MUST be sleep.
    {
      task: "Specific, actionable title — not vague. Include what, how much, context.",
      category: "Code|Fitness|Learning|Mindset|Business|Health|Relationships|Finance|Career|General",
      plannedTime: 90,
      startTime: "06:30",
      priority: 0,  // 0=Critical 1=High 2=Medium 3=Low
      linkedTo: "routine:<id> | habit:<id> | challenge:<id> | null",
      reasoning: "Zone [N] [PEAK/TROUGH/REBOUND/WIND-DOWN] — science rationale for this placement"
    }
    // ... all todos through sleep
  ],
  
  morningRoutine: [
    { time: "${effectiveWakeUp}", task: "Wake up + drink 500ml water", duration: 5 },
    // ... complete morning prep through ${firstSlotHHMM}
  ],
  
  afternoonBlock: [
    { time: "12:00", task: "Eat lunch — protein + carbs + healthy fat", duration: 40 },
    { time: "12:40", task: "Post-lunch walk — prevents afternoon energy crash", duration: 15 },
    // ... trough + rebound blocks
  ],
  
  eveningWrapup: [
    { time: "HH:MM", task: "Shutdown ritual — close work, declare day complete", duration: 15 },
    { time: "HH:MM", task: "Journaling: 3 wins + 1 lesson learned", duration: 15 },
    { time: "${sleepTime}", task: "Sleep — 7.5 h, 5 REM cycles", duration: 450 }
  ],
  
  successMetrics: {
    targetTodoCompletion: "X out of Y todos (Z% — meets streak shield threshold)",
    keyWins: ["The 3 specific outcomes that make today a success"],
    stretchGoals: ["2–3 bonus achievements if energy is higher than expected"]
  }
}

NOW: Place routine anchors → fill every gap → cover all 10 zones → verify checklist →
call save_daily_goals with a complete, science-backed schedule from ${effectiveWakeUp} to ${sleepTime}.`;

    // ── Messages ───────────────────────────────────────────────────────────────

    const humanMessage = routineActiveToday
        ? `I woke up at ${effectiveWakeUp} today. Active routine: "${routine?.name}" has ` +
          `${routine?.tasks.length} fixed tasks. Place ALL routine anchors, fill every gap, ` +
          `cover ALL 10 zones through sleep at ${sleepTime}. Call save_daily_goals now.`
        : `I woke up at ${effectiveWakeUp} today. No routine active. Build me a complete, ` +
          `science-backed full-day schedule from ${firstSlotHHMM} through sleep at ${sleepTime} — ` +
          `all 10 zones, all my habits and challenges, every hour covered. Call save_daily_goals now.`;

    let messages: any[] = [
        new SystemMessage(missionPrompt),
        new HumanMessage(humanMessage)
    ];

    let totalTokensUsed = 0;
    let totalRequests = 0;
    const MAX_ITERATIONS = 5;
    let iterations = 0;

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            totalRequests++;

            const reqStart = Date.now();
            const response = await invokeWithFallback(tools, messages);
            const elapsed = Date.now() - reqStart;

            const usageMetadata = response?.response_metadata?.usage_metadata;
            const tokensThisRequest = (usageMetadata as any)?.total_tokens || 0;
            totalTokensUsed += tokensThisRequest;

            console.log(
                `[Daily Goal Architect] Request ${totalRequests}: ${elapsed}ms | ` +
                `Tokens: ${tokensThisRequest} | Total: ${totalTokensUsed}`
            );

            messages.push(response);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                const content = typeof response.content === "string" ? response.content : "";
                return {
                    success: false,
                    message: content || "Agent did not call the save tool.",
                    stats: { totalRequests, totalTokensUsed }
                };
            }

            for (const toolCall of response.tool_calls) {
                if (toolCall.name === "save_daily_goals") {
                    try {
                        const output = await saveTool.invoke(toolCall.args);
                        const outputStr = typeof output === "string" ? output : JSON.stringify(output);
                        const parsed = JSON.parse(outputStr);

                        if (parsed.success) {
                            return {
                                ...parsed,
                                stats: { totalRequests, totalTokensUsed },
                                timestamp: currentDate.toISOString()
                            };
                        }

                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: outputStr,
                        }));
                    } catch (err) {
                        console.error("[Daily Goal Architect] Tool execution error:", err);
                        return {
                            success: false,
                            message: "Failed to save daily goals.",
                            error: String(err),
                            stats: { totalRequests, totalTokensUsed }
                        };
                    }
                } else {
                    const tool = tools.find(t => t.name === toolCall.name);
                    if (tool) {
                        const output = await tool.invoke(toolCall.args);
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: typeof output === "string" ? output : JSON.stringify(output),
                        }));
                    }
                }
            }
        }
    } catch (error) {
        console.error("[Daily Goal Architect] Critical error:", error);
        return {
            success: false,
            message: "Daily Goal Architect encountered an error.",
            error: String(error),
            stats: { totalRequests, totalTokensUsed }
        };
    }

    return {
        success: false,
        message: "Maximum iterations reached without finalizing daily goals.",
        stats: { totalRequests, totalTokensUsed }
    };
}

// ─── Progress data fetcher ────────────────────────────────────────────────────

export async function fetchProgressData(userId: string, prisma: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const [
            habits,
            challenges,
            pendingTodos,
            recentTodos,
            activePlans,
            userProfile,
            todaySessions,
            recentWorkouts,
            activeRoutine
        ] = await Promise.all([
            prisma.habit.findMany({
                where: { userId },
                include: {
                    logs: {
                        where: { date: { gte: sevenDaysAgo } },
                        orderBy: { date: "desc" },
                        take: 7
                    }
                },
                orderBy: { streakCount: "desc" }
            }),

            prisma.challenge.findMany({
                where: { userId, status: "active" },
                orderBy: { startDate: "desc" }
            }),

            prisma.todo.findMany({
                where: { userId, completed: false },
                orderBy: { createdAt: "asc" },
                take: 50
            }),

            prisma.todo.findMany({
                where: {
                    userId,
                    completed: true,
                    completedAt: { gte: sevenDaysAgo }
                },
                orderBy: { completedAt: "desc" }
            }),

            Promise.all([
                prisma.workoutPlan.findMany({ where: { userId, isActive: true } }),
                prisma.projectPlan.findMany({ where: { userId, isActive: true } }),
                prisma.incomePlan.findMany({ where: { userId, isActive: true } }),
                prisma.careerPlan.findMany({ where: { userId, isActive: true } }),
                prisma.lifePlan.findMany({ where: { userId, isActive: true } }),
                prisma.learningPlan.findMany({ where: { userId, isActive: true } }),
                prisma.healthPlan.findMany({ where: { userId, isActive: true } }),
            ]).then(([workout, project, income, career, life, learning, health]) => ({
                workout, project, income, career, life, learning, health
            })),

            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    totalStreakDays: true,
                    streakShields: true,
                    streakShieldContinuity: true,
                    roleLevel: true,
                    roleTitle: true,
                    fitnessGoal: true,
                    experience: true
                }
            }),

            prisma.todoSession.findMany({
                where: { userId, createdAt: { gte: today } },
                include: { todo: true }
            }),

            prisma.workout.findMany({
                where: { workoutPlan: { userId, isActive: true } },
                include: { exercises: true },
                orderBy: { completedAt: "desc" },
                take: 7
            }),

            prisma.routine.findFirst({
                where: { userId, isActive: true },
                include: { tasks: { orderBy: { startTime: "asc" } } }
            })
        ]);

        const totalTodosLast7Days = pendingTodos.length + recentTodos.length;
        const completionRate = totalTodosLast7Days > 0
            ? (recentTodos.length / totalTodosLast7Days * 100).toFixed(1)
            : "0";

        return {
            habits: habits.map((h: any) => ({
                id: h.id,
                name: h.name,
                category: h.category,
                frequency: h.frequency,
                targetType: h.targetType,
                targetValue: h.targetValue,
                targetUnit: h.targetUnit,
                healthScore: h.healthScore,
                streakCount: h.streakCount,
                longestStreak: h.longestStreak,
                lastCompleted: h.lastCompletedDate,
                recentLogs: h.logs.length,
                autoCreateTodos: h.autoCreateTodos
            })),
            challenges: challenges.map((c: any) => ({
                id: c.id,
                title: c.title,
                focus: c.focus,
                durationDays: c.durationDays,
                startDate: c.startDate,
                endDate: c.endDate,
                streakCount: c.streakCount,
                completionRate: c.completionRate,
                autoCreateTodos: c.autoCreateTodos
            })),
            todos: {
                pending: pendingTodos.length,
                recentlyCompleted: recentTodos.length,
                completionRateLast7Days: `${completionRate}%`,
                overdueCount: pendingTodos.filter((t: any) =>
                    t.reminderTime && new Date(t.reminderTime) < today
                ).length,
                overdueItems: pendingTodos
                    .filter((t: any) => t.reminderTime && new Date(t.reminderTime) < today)
                    .slice(0, 5)
                    .map((t: any) => ({ id: t.id, task: t.task, category: t.category }))
            },
            activePlans,
            streakData: {
                totalStreakDays: userProfile?.totalStreakDays || 0,
                streakShields: userProfile?.streakShields || 0,
                streakShieldContinuity: userProfile?.streakShieldContinuity || 0,
                needsStreakMaintenance: (userProfile?.streakShieldContinuity || 0) > 0
            },
            todaySessions: todaySessions.map((s: any) => ({
                task: s.todo.task,
                status: s.status,
                duration: s.duration,
                targetDuration: s.targetDuration
            })),
            recentWorkouts: recentWorkouts.map((w: any) => ({
                dayOfWeek: w.dayOfWeek,
                focus: w.focus,
                isCompleted: w.isCompleted,
                completedAt: w.completedAt
            })),
            userContext: {
                roleLevel: userProfile?.roleLevel || 0,
                roleTitle: userProfile?.roleTitle || "Beginner",
                fitnessGoal: userProfile?.fitnessGoal,
                experience: userProfile?.experience
            },
            routine: activeRoutine
                ? {
                    id: activeRoutine.id,
                    name: activeRoutine.name,
                    wakeUpTime: activeRoutine.wakeUpTime,
                    energyProfile: activeRoutine.energyProfile,
                    activeDays: activeRoutine.activeDays,
                    tasks: activeRoutine.tasks.map((t: any) => ({
                        title: t.title,
                        category: t.category ?? "General",
                        startTime: t.startTime,
                        duration: t.duration
                    }))
                }
                : null
        };
    } catch (error) {
        console.error("[Daily Goal Architect] Error fetching progress data:", error);
        throw error;
    }
}