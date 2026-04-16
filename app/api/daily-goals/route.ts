import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchProgressData, runDailyGoalArchitect } from "@/lib/agents/daily-goal-architect/architect";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await req.json();
        const { wakeUpTime } = body;

        // Validate wake-up time format
        if (!wakeUpTime || !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(wakeUpTime)) {
            return NextResponse.json(
                { error: "Invalid wake-up time. Use HH:MM format (e.g., '06:30')" },
                { status: 400 }
            );
        }

        console.log(`[Daily Goals API] Generating goals for user ${userId} | Wake-up: ${wakeUpTime}`);

        // Save wake-up time preference
        await prisma.userProfile.upsert({
            where: { userId },
            update: { wakeUpTime },
            create: { userId, wakeUpTime }
        });

        // Fetch comprehensive progress data
        const progressData = await fetchProgressData(userId, prisma);

        // Run the Daily Goal Architect agent
        const result = await runDailyGoalArchitect({
            userId,
            wakeUpTime,
            currentDate: new Date(),
            progressData: progressData as any
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Daily goals generated successfully!",
                data: {
                    summary: result.summary,
                    todosCreated: result.todosCreated,
                    todoIds: result.todoIds,
                    priorityBreakdown: result.priorityBreakdown,
                    schedule: result.schedule,
                    successMetrics: result.successMetrics
                },
                stats: result.stats,
                timestamp: result.timestamp
            });
        } else {
            return NextResponse.json({
                success: false,
                message: result.message,
                error: result.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error("[Daily Goals API] Error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const localDate = today.toLocaleDateString('en-CA');

        // Get today's analysis from agent memory
        const analysisMemoryKey = `daily_analysis_${localDate}`;
        const analysisMemory = await prisma.agentMemory.findFirst({
            where: {
                userId,
                key: analysisMemoryKey,
                domain: "daily_goals"
            }
        });

        // Get today's todos
        const todayTodos = await prisma.todo.findMany({
            where: {
                userId,
                createdAt: { gte: today }
            },
            orderBy: { reminderTime: 'asc' },
            include: {
                sessions: true
            }
        });

        // Get user preference if no goals yet
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId },
            select: { wakeUpTime: true }
        });

        if (!analysisMemory) {
            return NextResponse.json({
                success: false,
                message: "No goals generated for today yet. Please generate your daily goals first.",
                todayTodos: todayTodos.length,
                name: session?.user.name,
                wakeUpTime: userProfile?.wakeUpTime || "06:30"
            });
        }

        const analysis = JSON.parse(analysisMemory.value);

        return NextResponse.json({
            success: true,
            data: {
                dailySummary: analysis.dailySummary,
                insights: analysis.analysisInsights,
                schedule: {
                    morning: analysis.morningRoutine,
                    afternoon: analysis.afternoonBlock,
                    evening: analysis.eveningWrapup
                },
                todos: todayTodos.map(todo => ({
                    id: todo.id,
                    task: todo.task,
                    category: todo.category,
                    plannedTime: todo.plannedTime,
                    reminderTime: todo.reminderTime,
                    completed: todo.completed,
                    completedAt: todo.completedAt,
                    sessionsCount: todo.sessions.length
                })),
                successMetrics: analysis.successMetrics,
                stats: {
                    totalScheduled: analysis.totalTodosScheduled,
                    completed: todayTodos.filter(t => t.completed).length,
                    pending: todayTodos.filter(t => !t.completed).length,
                    completionRate: todayTodos.length > 0
                        ? ((todayTodos.filter(t => t.completed).length / todayTodos.length) * 100).toFixed(1) + '%'
                        : '0%',
                    priorityBreakdown: analysis.priorityBreakdown
                }
            }
        });

    } catch (error) {
        console.error("[Daily Goals API] Error retrieving today's goals:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}