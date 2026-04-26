import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";

// ── GET /api/check-user ─────────────────────────────────────────
// Returns the current user's phone & whatsappEnabled status for
// the MicroInteractionProvider to decide which dialog to show.
export const GET = withAuth(async (req, context, user) => {
    return NextResponse.json({
        phone: user.phone ?? null,
        whatsappEnabled: user.whatsappEnabled ?? false,
    });
});

// ── POST /api/check-user ────────────────────────────────────────
// Legacy: checks if a given phone number is registered.
export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return Response.json({ error: "Phone number required" }, { status: 400 });
        }

        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

        const user = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        });

        return NextResponse.json({
            registered: !!user,
            userId:     user?.id || null
        });
    } catch (error) {
        console.error("POST /api/check-user error:", error);
        return NextResponse.json(
            { error: "Internal server error", registered: false },
            { status: 500 }
        );
    }
}