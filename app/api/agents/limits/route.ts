import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isProUser } from "@/lib/subscription";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const isPro = await isProUser(userId);

        const records = await prisma.agentRecord.findMany({
            where: { userId }
        });

        // Convert array to a record/map for easier client-side lookup
        const limitsMap = records.reduce((acc, record) => {
            acc[record.agentId] = {
                isPurchased: record.isPurchased,
                promptsUsed: record.promptsUsed,
                promptLimit: record.promptLimit
            };
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ isPro, records: limitsMap });
    } catch (error) {
        console.error("Failed to fetch agent limits:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
