import { recordAgentUsage } from '@/lib/agent-limits';
import { runIncomeArchitect } from "@/lib/agents/income/architect";
import { NextRequest, NextResponse } from "next/server";
import { hasReachedBlueprintLimit } from '@/lib/subscription';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      await recordAgentUsage(session.user.id, "income");
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message, error: err.message }, { status: 403 });
    }


    const limitReached = await hasReachedBlueprintLimit(session.user.id);
    if (limitReached) {
      return NextResponse.json({ error: "Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints." }, { status: 403 });
    }

    const { userGoal, context } = await req.json();
    const result = await runIncomeArchitect(session.user.id, userGoal, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Income AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
