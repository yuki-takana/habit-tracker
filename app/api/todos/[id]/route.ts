import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateTodoXP, addXpToUser } from "@/lib/gamify";
import { LATE_PENALTY_XP, MAX_DAILY_XP, REMINDER_LEAD_TIME_MINS } from "@/lib/constants";
import { processTodoCompletion } from "@/lib/xp-engine";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { completed, reminderTime, startTime, extraTime } = await req.json();
        const updateData: any = {};

        const currentTodo = await prisma.todo.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!currentTodo) {
            return NextResponse.json({ error: "Todo not found" }, { status: 404 });
        }

        // If todo is already completed, don't allow updates unless we are untoggling completion
        if (currentTodo.completed && completed !== false && completed === undefined && reminderTime === undefined && extraTime === undefined) {
            // This logic needs to be careful. 
            // If user sends nothing or just unrelated fields, we block.
            // But if they are marking it as NOT completed (completed: false), we allow.
        }

        // Refined logic: If it's completed, it can't be updated EXCEPT to set completed: false
        if (currentTodo.completed && completed !== false) {
            // Check if any other field is being updated
            if (reminderTime !== undefined || extraTime !== undefined || (completed === undefined)) {
                return NextResponse.json({ error: "Cannot update a completed todo" }, { status: 400 });
            }
        }

        if (completed !== undefined) {
            updateData.completed = completed;

            if (completed === true && !currentTodo.completed) {
                console.log("todo is about to complete ")
                const result = await processTodoCompletion({
                    prisma,
                    todoId: id,
                });
                updateData.earnedXp = result.earnedXp;

            } else if (completed === false) {
                updateData.completedAt = null;

                const penaltyXp = currentTodo.earnedXp || 10;
                await addXpToUser(prisma, currentTodo.userId, -penaltyXp);
                updateData.earnedXp = 0;
            }
        } else {
            console.log("hello its time to add extra time ")
            if (startTime !== undefined) updateData.startTime = currentTodo.startTime;
            const scheduledStart = currentTodo.startTime ? new Date(currentTodo.startTime) : new Date();
            const calculatedReminderTime = new Date(scheduledStart.getTime() - REMINDER_LEAD_TIME_MINS * 60000);
            updateData.reminderTime = calculatedReminderTime;
            if (extraTime !== undefined) {
                const currentExtra = currentTodo.extraTime || 0;
                updateData.extraTime = currentExtra + extraTime;
            }
        }

        const todo = await prisma.todo.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(todo);
    } catch (error) {
        console.error("Error updating todo:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
