import { recordAgentUsage } from '@/lib/agent-limits';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasReachedBlueprintLimit } from '@/lib/subscription';
import { runLearningArchitect } from "@/lib/agents/learning/architect";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        try {
            await recordAgentUsage(session.user.id, "learning");
        } catch (err: any) {
            return NextResponse.json(
                {
                    success: false,
                    message: err.message,
                    error: err.message,
                },
                { status: 403 }
            );
        }

        const limitReached = await hasReachedBlueprintLimit(session.user.id);
        if (limitReached) {
            return NextResponse.json({ error: "Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints." }, { status: 403 });
        }

        const { userGoal, context } = await req.json();
        const result = await runLearningArchitect(session.user.id, userGoal, context);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.message || "Failed to generate plan" }, { status: 500 });
        }
    } catch (error) {
        console.error("[Learning API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

