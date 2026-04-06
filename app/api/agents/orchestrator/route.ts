import { recordAgentUsage } from '@/lib/agent-limits';
import { runOrchestrator } from "@/lib/agents/orchestrator/orchestrator";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasReachedBlueprintLimit } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    try {
      await recordAgentUsage(session.user.id, "orchestrator");
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message, error: err.message }, { status: 403 });
    }

    const { userGoal } = await req.json();

  const limitReached = await hasReachedBlueprintLimit(session.user.id);
  if (limitReached) {
    return NextResponse.json({ error: "Blueprint generation limit reached. Upgrade to Pro for unlimited AI blueprints." }, { status: 403 });
  }

  const result = await runOrchestrator(session.user.id, userGoal);
  return NextResponse.json(result);
} catch (error) {
  console.error("Orchestrator API Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}