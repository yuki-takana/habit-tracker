"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function saveUserGoal(goal: string, domain: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    const newGoal = await prisma.userGoal.create({
        data: {
            userId: user.id,
            goal,
            domain
        }
    });
    return newGoal;
}
