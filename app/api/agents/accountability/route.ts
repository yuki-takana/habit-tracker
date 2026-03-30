import { runAccountabilityAgent } from "@/lib/agents/accountability/architect";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized: Please log in." }, { status: 401 });
    }

    const { feedback } = await req.json();
    
    if (!feedback) {
       return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const result = await runAccountabilityAgent(session.user.id, feedback);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Accountability Agent API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
