import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Secure the cron job with a secret key
        // const authHeader = req.headers.get("authorization");
        // if (
        //     process.env.CRON_SECRET &&
        //     authHeader !== `Bearer ${process.env.CRON_SECRET}`
        // ) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const now = new Date();
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

// export async function GET(req: Request) {
//     // Some cron services prefer GET
//     return POST(req);
// }
