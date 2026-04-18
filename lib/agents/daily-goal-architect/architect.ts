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
    };
}

/**
 * Helper function to calculate time slots with breaks
 */
function calculateTimeSlots(
    wakeUpTime: string, 
    tasks: Array<{ plannedTime: number; priority: number; task: string }>
): Array<{ startTime: string; endTime: string; breakAfter: number }> {
    const [wakeHour, wakeMinute] = wakeUpTime.split(':').map(Number);
    
    // Start 30 minutes after wake-up time for morning routine
    let currentTime = new Date();
    currentTime.setHours(wakeHour, wakeMinute + 30, 0, 0);
    
    const slots = [];
    
    for (const task of tasks) {
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime);
        endTime.setMinutes(endTime.getMinutes() + task.plannedTime);
        
        // Calculate break based on task duration
        let breakDuration = 0;
        if (task.plannedTime >= 90) breakDuration = 15; // 15 min break after 90+ min
        else if (task.plannedTime >= 60) breakDuration = 10; // 10 min break after 60+ min
        else if (task.plannedTime >= 45) breakDuration = 5;  // 5 min break after 45+ min
        else breakDuration = 3; // 3 min transition
        
        slots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            breakAfter: breakDuration
        });
        
        // Move to next slot (task duration + break)
        currentTime.setMinutes(currentTime.getMinutes() + task.plannedTime + breakDuration);
    }
    
    return slots;
}

export async function runDailyGoalArchitect(context: DailyGoalContext) {
    const { userId, wakeUpTime, currentDate, progressData } = context;
    
    const saveTool = saveDailyGoalsTool(userId);
    const tools = [saveTool];

    // Calculate start time (30 min after wake-up)
    const [wakeHour, wakeMinute] = wakeUpTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(wakeHour, wakeMinute + 30, 0, 0);
    const startTimeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const missionPrompt = `You are an Elite Daily Goal Architect and Productivity Strategist.

CURRENT CONTEXT:
- Date: ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Wake Up Time: ${wakeUpTime}
- Schedule Start Time: ${startTimeStr} (30 minutes after wake-up for morning preparation)
- User ID: ${userId}

PROGRESS ANALYSIS DATA:
${JSON.stringify(progressData, null, 2)}

YOUR MISSION:
Analyze the user's comprehensive progress data and architect a high-performance daily schedule that:
1. Builds on existing momentum (streaks, active challenges, ongoing habits)
2. Addresses gaps in progress (neglected areas, pending tasks)
3. Balances multiple life domains (fitness, career, learning, mindset, relationships)
4. Optimizes energy and focus based on time of day
5. Sets realistic yet challenging goals

ANALYSIS FRAMEWORK:

1. MOMENTUM ASSESSMENT:
   - Which habits have active streaks? (Priority: maintain these)
   - Which challenges are in progress? (Daily tasks required?)
   - What's the current streak shield status? (50-60%+ completion needed?)
   
2. GAP IDENTIFICATION:
   - Which todos are overdue or pending?
   - Which active plans have incomplete tasks?
   - Which life domains are being neglected?
   - Are there any scheduled workouts or project deadlines today?

3. ENERGY OPTIMIZATION:
   - Morning (${startTimeStr} - 12:00): High cognitive tasks, deep work, strategic planning
   - Afternoon (12:00 - 17:00): Collaborative work, execution, physical activity
   - Evening (17:00 - 22:00): Learning, reflection, low-intensity tasks, preparation

4. PRIORITY CALCULATION:
   - P0 (Critical): Streak maintenance, deadlines, scheduled workouts
   - P1 (High): Active challenge tasks, project milestones, important habits
   - P2 (Medium): Skill development, networking, system improvement
   - P3 (Low): Optional optimization, exploration, buffer tasks

5. ACTIVE ROUTINE INTEGRATION:
   - If an 'activeRoutine' is present in progress data, YOU MUST align the daily schedule with it.
   - Respect 'energyProfile' (high-focus: hard tasks early; balanced; light: maintenance only).
   - Inject the routine's scheduled tasks if present.
   - Carry over target measurements (targetType, targetValue, targetUnit) if generating tasks for habits.

CRITICAL TIME CALCULATION RULES:

YOU MUST CALCULATE EXACT REMINDER TIMES USING THIS ALGORITHM:

1. START TIME: ${startTimeStr} (30 min after wake-up: ${wakeUpTime})

2. FOR EACH TODO IN ORDER:
   - First todo starts at ${startTimeStr}
   - Each subsequent todo starts AFTER previous todo's (duration + break)
   
3. BREAK CALCULATION AFTER EACH TASK:
   - Task ≥ 90 minutes → 15 minute break
   - Task ≥ 60 minutes → 10 minute break  
   - Task ≥ 45 minutes → 5 minute break
   - Task < 45 minutes → 3 minute transition

4. EXAMPLE CALCULATION:
   Wake-up: 07:00
   Start: 07:30
   
   Todo 1: "Morning workout" (90 min)
   - Starts: 07:30
   - Ends: 09:00
   - Break: 15 min
   - startTime: "2024-03-20T07:30:00.000Z"
   
   Todo 2: "Code review" (60 min)
   - Starts: 09:15 (09:00 + 15 min break)
   - Ends: 10:15
   - Break: 10 min
   - startTime: "2024-03-20T09:15:00.000Z"
   
   Todo 3: "Team standup" (30 min)
   - Starts: 10:25 (10:15 + 10 min break)
   - Ends: 10:55
   - Break: 3 min
   - startTime: "2024-03-20T10:25:00.000Z"

5. YOU MUST PROVIDE ISO TIMESTAMPS:
   - Use today's date: ${currentDate.toISOString().split('T')[0]}
   - Format: "2024-03-20T09:15:00.000Z" (ISO 8601)
   - Calculate exact minutes, don't use round numbers like "09:00" for everything

OUTPUT STRUCTURE:
You MUST call 'save_daily_goals' with this exact structure:

{
  dailySummary: "A 2-3 sentence inspiring summary of today's focus",
  analysisInsights: {
    streakStatus: "Current streak analysis and maintenance requirements",
    topPriorities: ["List of 3-5 critical priorities identified"],
    gapsIdentified: ["Areas needing attention"],
    energyAllocation: "How energy should be distributed today"
  },
  scheduledTodos: [
    {
      task: "Specific, actionable task title",
      category: "Code|Fitness|Learning|Mindset|Business|Health|Relationships|Finance|Career|General",
      plannedTime: 45, // minutes - realistic estimate
      startTime: "2024-03-20T07:30:00.000Z", // EXACT calculated ISO timestamp
      priority: 0-3, // P0=Critical, P1=High, P2=Medium, P3=Low
      linkedTo: "habitId|challengeId|projectId", // Reference to existing entities or null
      reasoning: "Why this task, at this time, for this duration"
    }
    // IMPORTANT: Each startTime must be calculated based on:
    // previousTodo.startTime + previousTodo.plannedTime + break duration
  ],
  morningRoutine: [
    { time: "07:00", task: "Wake up + hydration", duration: 10 },
    { time: "07:10", task: "Quick stretch", duration: 10 },
    { time: "07:20", task: "Breakfast", duration: 20 },
    // Total should lead to ${startTimeStr} start time
  ],
  afternoonBlock: [
    { time: "13:00", task: "Post-lunch walk", duration: 15 },
    { time: "14:00", task: "Focus block start", duration: 90 }
  ],
  eveningWrapup: [
    { time: "21:00", task: "Review day + journal", duration: 15 },
    { time: "21:30", task: "Prepare tomorrow", duration: 15 }
  ],
  successMetrics: {
    targetTodoCompletion: "X out of Y todos (Z% for streak shield)",
    keyWins: ["What constitutes a successful day"],
    stretchGoals: ["Bonus achievements if energy permits"]
  }
}

SCHEDULING PRINCIPLES:

1. TIME BLOCKING WITH BREAKS:
   - Never schedule back-to-back without transitions
   - Respect break durations based on task length
   - Account for lunch break (12:00-13:00 typically)

2. ENERGY MATCHING:
   - Hardest cognitive tasks: First 2-3 hours after start
   - Physical tasks: Late morning or late afternoon
   - Creative work: Morning or early evening
   - Admin/Email: After lunch (lower energy okay)

3. REALISTIC CAPACITY:
   - Maximum 6-8 hours of focused work
   - Include breaks, meals, transitions
   - Don't over-schedule beyond 22:00

4. HABIT STACKING:
   - Chain related tasks (workout → protein → shower)
   - Use meal times as natural breaks
   - Group similar task types together

CRITICAL CALCULATION CHECKLIST:
✅ First todo starts at ${startTimeStr}
✅ Each subsequent todo's reminderTime = previous todo's (reminderTime + plannedTime + break)
✅ Break duration varies by task length (15/10/5/3 minutes)
✅ All times are ISO 8601 format with today's date
✅ No overlapping times
✅ Include proper timezone offset or use UTC

NOW: Calculate exact times for each todo and call 'save_daily_goals'.`;

    let messages: any[] = [
        new SystemMessage(missionPrompt),
        new HumanMessage(`I woke up at ${wakeUpTime}. Analyze my progress and create my optimized daily schedule with EXACT calculated reminder times.`)
    ];

    let totalTokensUsed = 0;
    let totalRequests = 0;
    const MAX_ITERATIONS = 5;
    let iterations = 0;

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            totalRequests++;

            const startTime = Date.now();
            const response = await invokeWithFallback(tools, messages);
            const endTime = Date.now();

            const usageMetadata = response?.response_metadata?.usage_metadata;
            const tokensThisRequest = (usageMetadata as any)?.total_tokens || 0;
            totalTokensUsed += tokensThisRequest;

            console.log(`[Daily Goal Architect] Request ${totalRequests}: ${endTime - startTime}ms | Tokens: ${tokensThisRequest} | Total: ${totalTokensUsed}`);

            messages.push(response);

            // Check if AI completed without tool calls
            if (!response.tool_calls || response.tool_calls.length === 0) {
                const content = typeof response.content === "string" ? response.content : "";
                return {
                    success: false,
                    message: content || "Failed to generate daily goals. Agent did not call the save tool.",
                    stats: { totalRequests, totalTokensUsed }
                };
            }

            // Process tool calls
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
                        } else {
                            // Tool returned error, let AI try again
                            messages.push(new ToolMessage({
                                tool_call_id: toolCall.id!,
                                content: outputStr,
                            }));
                        }
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
                    // Handle other tools if added in future
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
            message: "Daily Goal Architect encountered an error. Please try again.",
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

/**
 * Helper function to fetch comprehensive progress data for the agent
 */
export async function fetchProgressData(userId: string, prisma: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const [
            habits,
            activeHabitsWithLogs,
            challenges,
            pendingTodos,
            recentTodos,
            activePlans,
            userProfile,
            todaySessions,
            recentWorkouts,
            activeRoutine
        ] = await Promise.all([
            // Active habits
            prisma.habit.findMany({
                where: { userId },
                include: {
                    logs: {
                        where: { date: { gte: sevenDaysAgo } },
                        orderBy: { date: 'desc' },
                        take: 7
                    }
                },
                orderBy: { streakCount: 'desc' }
            }),
            
            // Habits with recent logs for streak analysis
            prisma.habit.findMany({
                where: { 
                    userId,
                    logs: {
                        some: { date: { gte: sevenDaysAgo } }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    streakCount: true,
                    longestStreak: true,
                    lastCompletedDate: true
                }
            }),
            
            // Active challenges
            prisma.challenge.findMany({
                where: { 
                    userId,
                    status: 'active'
                },
                orderBy: { startDate: 'desc' }
            }),
            
            // Pending todos (incomplete)
            prisma.todo.findMany({
                where: { 
                    userId,
                    completed: false
                },
                orderBy: { createdAt: 'asc' },
                take: 50
            }),
            
            // Recently completed todos
            prisma.todo.findMany({
                where: { 
                    userId,
                    completed: true,
                    completedAt: { gte: sevenDaysAgo }
                },
                orderBy: { completedAt: 'desc' }
            }),
            
            // All active plans
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
            
            // User profile and goals
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
            
            // Today's sessions
            prisma.todoSession.findMany({
                where: {
                    userId,
                    createdAt: { gte: today }
                },
                include: {
                    todo: true
                }
            }),
            
            // Recent workouts
            prisma.workout.findMany({
                where: {
                    workoutPlan: {
                        userId,
                        isActive: true
                    }
                },
                include: {
                    exercises: true
                },
                orderBy: { completedAt: 'desc' },
                take: 7
            }),
            
            // Active routine
            prisma.routine.findFirst({
                where: { userId, isActive: true },
                include: { tasks: true }
            })
        ]);

        // Calculate completion rates
        const totalTodosLast7Days = pendingTodos.length + recentTodos.length;
        const completionRate = totalTodosLast7Days > 0 
            ? (recentTodos.length / totalTodosLast7Days * 100).toFixed(1)
            : '0';

        return {
            habits: habits.map((h:any) => ({
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
            challenges: challenges.map((c:any) => ({
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
                overdueCount: pendingTodos.filter((t:any) => 
                    t.reminderTime && new Date(t.reminderTime) < today
                ).length
            },
            activePlans,
            streakData: {
                totalStreakDays: userProfile?.totalStreakDays || 0,
                streakShields: userProfile?.streakShields || 0,
                streakShieldContinuity: userProfile?.streakShieldContinuity || 0,
                needsStreakMaintenance: (userProfile?.streakShieldContinuity || 0) > 0
            },
            todaySessions: todaySessions.map((s:any) => ({
                task: s.todo.task,
                status: s.status,
                duration: s.duration,
                targetDuration: s.targetDuration
            })),
            recentWorkouts: recentWorkouts.map((w:any) => ({
                dayOfWeek: w.dayOfWeek,
                focus: w.focus,
                isCompleted: w.isCompleted,
                completedAt: w.completedAt
            })),
            userContext: {
                roleLevel: userProfile?.roleLevel || 0,
                roleTitle: userProfile?.roleTitle || 'Beginner',
                fitnessGoal: userProfile?.fitnessGoal,
                experience: userProfile?.experience
            },
            routine: activeRoutine ? {
                id: activeRoutine.id,
                name: activeRoutine.name,
                wakeUpTime: activeRoutine.wakeUpTime,
                energyProfile: activeRoutine.energyProfile,
                activeDays: activeRoutine.activeDays,
                tasks: activeRoutine.tasks.map((t:any) => ({
                    title: t.title,
                    category: t.category,
                    startTime: t.startTime,
                    duration: t.duration
                }))
            } : null
        };
    } catch (error) {
        console.error("[Daily Goal Architect] Error fetching progress data:", error);
        throw error;
    }
}