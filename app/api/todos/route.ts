import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { REMINDER_LEAD_TIME_MINS } from "@/lib/constants";
import { getTodayEndIST } from "@/lib/utils/getTodayEndIST";


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { task, category, startTime, deadline, reminderTime, plannedTime, sessionDuration, breakTime } = await req.json();


        if (!task || !startTime) {
            console.warn("Missing required fields:", { task, startTime });
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const scheduledStart = new Date(startTime);
        const calculatedReminderTime = new Date(scheduledStart.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
        const deadlineTime = new Date(getTodayEndIST());

        const todo = await prisma.todo.create({
            data: {
                task,
                category,
                plannedTime: plannedTime ? parseInt(plannedTime) : null,
                startTime: scheduledStart,
                reminderTime: calculatedReminderTime,
                deadline: deadlineTime,
                userId: user.id,
            },
        });

        // Create initial sessions if planned
        if (plannedTime && sessionDuration) {
            const totalPlanned = parseInt(plannedTime);
            const duration = parseInt(sessionDuration);
            const breakDur = breakTime ? parseInt(breakTime) : 0;

            const sessionCount = Math.ceil(totalPlanned / duration);

            const sessionData = Array.from({ length: sessionCount }).map((_, i) => ({
                todoId: todo.id,
                userId: user.id,
                targetDuration: i === sessionCount - 1 && totalPlanned % duration !== 0
                    ? totalPlanned % duration
                    : duration,
                breakDuration: i === sessionCount - 1 ? 0 : breakDur,
                order: i,
                status: "PENDING" as const,
            }));

            await prisma.todoSession.createMany({
                data: sessionData,
            });
        } else if (plannedTime) {
            // Create a single session for the entire planned time if not divided
            await prisma.todoSession.create({
                data: {
                    todoId: todo.id,
                    userId: user.id,
                    targetDuration: parseInt(plannedTime),
                    order: 0,
                    status: "PENDING",
                }
            });
        }

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error creating todo:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const todos = await prisma.todo.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
