import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id, status: "active" },
        });
        const isPro = !!subscription;
        const todos = await prisma.todo.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        const grouped = {
            today: [] as any[],
            timeUp: [] as any[],
            completed: [] as any[],
        };

        for (const todo of todos) {
            if (todo.completed) {
                grouped.completed.push(todo);
                continue;
            }

            const timeToCheck = todo.deadline || todo.reminderTime;

            if (!timeToCheck) {
                grouped.today.push(todo);
            } else if (new Date(timeToCheck) <= now) {
                grouped.timeUp.push(todo);
            } else {
                grouped.today.push(todo);
            }
        }

        if (!isPro && grouped.today.length > 10) {
            grouped.today = grouped.today.slice(0, 10);
        }

        return NextResponse.json({
            grouped,
            stats: {
                total: todos.length,
                completed: grouped.completed.length,
                today: grouped.today.length,
                timeUps: grouped.timeUp.length,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}