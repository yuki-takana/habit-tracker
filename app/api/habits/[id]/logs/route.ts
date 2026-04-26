import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { withAuth } from "@/lib/api-auth";

export const POST = withAuth(async (req, context, user) => {
    try {
        const { id: habitId } = await context.params;
        const userId = user.id;
        const today = startOfDay(new Date());

        // Check if habit belongs to user
        const habit = await prisma.habit.findUnique({
            where: { id: habitId, userId }
        });

        if (!habit) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        // Check if already logged today
        const existingLog = await prisma.habitLog.findFirst({
            where: {
                habitId,
                date: { gte: today }
            }
        });

        if (existingLog) {
            return NextResponse.json({ message: "Already logged for today" });
        }

        const body = await req.json().catch(() => ({}));
        const { actualValue, completionPct, note } = body;

        const log = await prisma.habitLog.create({
            data: {
                habitId,
                date: new Date(),
                completed: completionPct !== undefined ? completionPct >= 100 : true,
                actualValue: actualValue ?? null,
                completionPct: completionPct ?? 100,
                note: note ?? null
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Error logging habit:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
