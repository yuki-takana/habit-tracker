import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint should be triggered by a cron job service (e.g. Vercel Cron, GitHub Actions, cron-job.org)
// at 11:59 PM every day.
export async function POST(req: Request) {
    try {
        // Optional: Secure the cron job with a secret key
        const authHeader = req.headers.get("authorization");
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();

        // Find all incomplete todos whose deadline has passed OR are just generally not completed by the end of the day
        // Assuming daily goals have a deadline set, we'll mark any incomplete todo with a deadline <= now as failed.
        // We can also mark todos created before today as failed if they don't have a deadline.
        
        const updatedTodos = await prisma.todo.updateMany({
            where: {
                completed: false,
                status: { not: "failed" },
                OR: [
                    { deadline: { lte: now } },
                    { 
                        // If no deadline, but it was created before today, it's overdue
                        deadline: null, 
                        createdAt: { lt: new Date(now.setHours(0, 0, 0, 0)) } 
                    }
                ]
            },
            data: {
                status: "failed",
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully marked ${updatedTodos.count} overdue todos as failed.`,
            count: updatedTodos.count,
        });
    } catch (error: any) {
        console.error("Cron Job Error (Fail Overdue Todos):", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    // Some cron services prefer GET
    return POST(req);
}
