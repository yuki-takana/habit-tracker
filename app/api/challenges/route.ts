import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { addDays } from "date-fns";
import { hasReachedChallengeLimit } from "@/lib/subscription";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, focus, description, durationDays, autoCreateTodos, force } = await req.json();

        if (!title || !focus || !durationDays) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const startDate = new Date();
        const endDate = addDays(startDate, parseInt(durationDays));

        const limitReached = await hasReachedChallengeLimit(userId);
        if (limitReached) {
            return NextResponse.json(
                { error: "Free plan limit reached. Upgrade to Pro for unlimited challenges." },
                { status: 403 }
            );
        }

        const challenge = await prisma.challenge.create({
            data: {
                title,
                focus,
                description,
                durationDays: parseInt(durationDays),
                autoCreateTodos: !!autoCreateTodos,
                startDate,
                endDate,
                userId,
                status: "active",
            },
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error("Error creating challenge:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const challenges = await prisma.challenge.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(challenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
