"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitPlatformFeedback(message: string, rating: number, category: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    const feedback = await prisma.platformFeedback.create({
        data: {
            userId: user.id,
            message,
            rating,
            category,
        },
    });

    return feedback;
}
