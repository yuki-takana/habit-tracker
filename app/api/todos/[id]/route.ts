import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculateTodoXP, addXpToUser } from "@/lib/gamify";

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

        const { completed, reminderTime, extraTime } = await req.json();
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

                updateData.completedAt = new Date();

                // Debug count
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const completedTodayCount = await prisma.todo.count({
                    where: {
                        userId: currentTodo.userId,
                        completed: true,
                        completedAt: { gte: startOfDay }
                    }
                });

                const isFirstOfDay = completedTodayCount === 0;

                let isEarly = false;
                if (currentTodo.deadline) {
                   
                    const diffMs = currentTodo.deadline.getTime() - Date.now();
    
                    if (diffMs >= 2 * 60 * 60 * 1000) {
                        isEarly = true;
                    }
                }

                const earnedXp = calculateTodoXP({
                    isAIGenerated: currentTodo.isAIGenerated,
                    isEarly,
                    isFirstOfDay,
                    userLevel: currentTodo.user.level || 1,
                });

                await addXpToUser(prisma, currentTodo.userId, earnedXp);

       
            } else if (completed === false) {
                console.log("⚠️ UNDO COMPLETION - APPLY PENALTY");

                updateData.completedAt = null;

                const penaltyXp = currentTodo.isAIGenerated ? 12 : 10;

                console.log("Penalty XP:", penaltyXp);

                await addXpToUser(prisma, currentTodo.userId, -penaltyXp);

                console.log("❌ XP REMOVED");
            }
        }

        if (reminderTime !== undefined) updateData.reminderTime = new Date(reminderTime);

        if (extraTime !== undefined) {
            const currentExtra = currentTodo.extraTime || 0;
            updateData.extraTime = currentExtra + extraTime;
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
