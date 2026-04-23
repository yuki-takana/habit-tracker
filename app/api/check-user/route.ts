import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth";

// ── GET /api/check-user ─────────────────────────────────────────
// Returns the current user's phone & whatsappEnabled status for
// the MicroInteractionProvider to decide which dialog to show.
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { phone: true, whatsappEnabled: true },
        });

        return Response.json({
            phone:           user?.phone          ?? null,
            whatsappEnabled: user?.whatsappEnabled ?? false,
        });
    } catch (error) {
        console.error("GET /api/check-user error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

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

        return Response.json({
            registered: !!user,
            userId:     user?.id || null
        });
    } catch (error) {
        console.error("POST /api/check-user error:", error);
        return Response.json(
            { error: "Internal server error", registered: false },
            { status: 500 }
        );
    }
}