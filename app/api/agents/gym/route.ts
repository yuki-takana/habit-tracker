import { recordAgentUsage } from '@/lib/agent-limits';
import { runGymArchitect } from "@/lib/agents/gym/architect";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasReachedBlueprintLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Unauthorized: Please log in." }, { status: 401 });
    }

    try {
        await recordAgentUsage(session.user.id, "gym");
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message, error: err.message }, { status: 403 });
    }

    try {
        const payload = await req.json();
        const { userGoal, context } = payload;

        if (!context || !userGoal) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const result = await runGymArchitect(session.user.id, userGoal, context);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Gym API Error:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
