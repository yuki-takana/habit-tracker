import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-auth";

export const DELETE = withAuth(async (req, context, user) => {
    try {
        const { id: habitId } = await context.params;
        const userId = user.id;

        // Verify ownership
        const habit = await prisma.habit.findUnique({
            where: { id: habitId, userId }
        });

        if (!habit) {
            return NextResponse.json({ error: "Habit not found" }, { status: 404 });
        }

        await prisma.habit.delete({
            where: { id: habitId }
        });

        return NextResponse.json({ message: "Habit deleted successfully" });
    } catch (error) {
        console.error("Error deleting habit:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
});
