import { REMINDER_LEAD_TIME_MINS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getTodayEndIST } from "@/lib/utils/getTodayEndIST";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const saveDailyGoalsTool = (userId: string) => new DynamicStructuredTool({
    name: "save_daily_goals",
    description: "Saves the analyzed daily goals, scheduled todos, and time blocks to the database.",
    schema: z.object({
        dailySummary: z.string().describe("2-3 sentence inspiring summary of today's focus"),
        analysisInsights: z.object({
            streakStatus: z.string().describe("Current streak analysis and maintenance requirements"),
            topPriorities: z.array(z.string()).describe("List of 3-5 critical priorities identified"),
            gapsIdentified: z.array(z.string()).describe("Areas needing attention"),
            energyAllocation: z.string().describe("How energy should be distributed today")
        }),
        scheduledTodos: z.array(z.object({
            task: z.string().describe("Specific, actionable task title"),
            category: z.enum([
                "Code", "Fitness", "Learning", "Mindset", "Business",
                "Health", "Relationships", "Finance", "Career", "General"
            ]).describe("Task category"),
            plannedTime: z.number().describe("Estimated duration in minutes"),
            startTime: z.string().describe("ISO timestamp for when to start this task"),
            priority: z.number().min(0).max(3).describe("Priority level (0=Critical, 1=High, 2=Medium, 3=Low)"),
            linkedTo: z.string().nullable().optional().describe("habitId, challengeId, or projectId if applicable"),
            reasoning: z.string().describe("Why this task, at this time, for this duration")
        })).describe("List of scheduled todos for the day"),
        morningRoutine: z.array(z.object({
            time: z.string().describe("Time in HH:MM format"),
            task: z.string().describe("Morning routine task"),
            duration: z.number().describe("Duration in minutes")
        })).describe("5-7 morning routine tasks"),
        afternoonBlock: z.array(z.object({
            time: z.string().describe("Time in HH:MM format"),
            task: z.string().describe("Afternoon task"),
            duration: z.number().describe("Duration in minutes")
        })).describe("3-5 afternoon tasks"),
        eveningWrapup: z.array(z.object({
            time: z.string().describe("Time in HH:MM format"),
            task: z.string().describe("Evening task"),
            duration: z.number().describe("Duration in minutes")
        })).describe("2-3 evening wrap-up tasks"),
        successMetrics: z.object({
            targetTodoCompletion: z.string().describe("Target completion e.g. '8 out of 10 todos (80% for streak shield)'"),
            keyWins: z.array(z.string()).describe("What constitutes a successful day"),
            stretchGoals: z.array(z.string()).describe("Bonus achievements if energy permits")
        })
    }),
    func: async ({
        dailySummary,
        analysisInsights,
        scheduledTodos,
        morningRoutine,
        afternoonBlock,
        eveningWrapup,
        successMetrics
    }) => {
        try {
            // Create todos in database
            const createdTodos = await Promise.all(
                scheduledTodos.map(async (todo) => {
                    // Parse the linkedTo field to determine if it's a habit or challenge
                    let habitId: string | undefined;
                    let challengeId: string | undefined;

                    if (todo.linkedTo) {
                        const [type, id] = todo.linkedTo.includes(':')
                            ? todo.linkedTo.split(':')
                            : [null, todo.linkedTo];

                        if (type === 'habit' || (!type && todo.category === 'Fitness')) {
                            habitId = id;
                        } else if (type === 'challenge') {
                            challengeId = id;
                        }
                    }
                    const scheduledStart = new Date(todo.startTime);
                    const calculatedReminderTime = new Date(scheduledStart.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
                    const deadlineTime = new Date(scheduledStart.getTime() + todo.plannedTime * 60000);
                    return prisma.todo.create({
                        data: {
                            userId,
                            task: todo.task,
                            category: todo.category,
                            plannedTime: todo.plannedTime,
                            startTime: scheduledStart,
                            reminderTime: calculatedReminderTime,
                            deadline: deadlineTime,
                            habitId: habitId || undefined,
                            challengeId: challengeId || undefined,
                            completed: false,
                            isAIGenerated: true,
                        }
                    });
                })
            );

            // Store daily analysis in agent memory for tracking
            const analysisMemoryKey = `daily_analysis_${new Date().toISOString().split('T')[0]}`;
            await prisma.agentMemory.create({
                data: {
                    userId,
                    key: analysisMemoryKey,
                    value: JSON.stringify({
                        dailySummary,
                        analysisInsights,
                        morningRoutine,
                        afternoonBlock,
                        eveningWrapup,
                        successMetrics,
                        totalTodosScheduled: scheduledTodos.length,
                        priorityBreakdown: {
                            critical: scheduledTodos.filter(t => t.priority === 0).length,
                            high: scheduledTodos.filter(t => t.priority === 1).length,
                            medium: scheduledTodos.filter(t => t.priority === 2).length,
                            low: scheduledTodos.filter(t => t.priority === 3).length
                        }
                    }),
                    domain: "daily_goals"
                }
            });

            // Create agent conversation log
            await prisma.agentConversation.create({
                data: {
                    userId,
                    message: `Daily goals architected: ${dailySummary}`,
                    role: "assistant",
                    domain: "productivity"
                }
            });

            console.log(`[Daily Goals Tool] ✅ Created ${createdTodos.length} todos and saved analysis`);

            return JSON.stringify({
                success: true,
                message: "Daily goals successfully architected and scheduled!",
                summary: dailySummary,
                todosCreated: createdTodos.length,
                todoIds: createdTodos.map(t => t.id),
                priorityBreakdown: {
                    critical: scheduledTodos.filter(t => t.priority === 0).length,
                    high: scheduledTodos.filter(t => t.priority === 1).length,
                    medium: scheduledTodos.filter(t => t.priority === 2).length,
                    low: scheduledTodos.filter(t => t.priority === 3).length
                },
                schedule: {
                    morningTasks: morningRoutine.length,
                    afternoonTasks: afternoonBlock.length,
                    eveningTasks: eveningWrapup.length
                },
                successMetrics
            });
        } catch (error) {
            console.error("[Daily Goals Tool] Error saving goals:", error);
            return JSON.stringify({
                success: false,
                error: String(error),
                message: "Failed to save daily goals. Please check the data and try again."
            });
        }
    },
});