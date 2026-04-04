import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

        const url = new URL(req.url);
        const duration = url.searchParams.get("duration") || "1w"; // 1d, 1w, 1m, 1y

        let startDate = new Date();
        if (duration === "1d") startDate.setDate(startDate.getDate() - 1);
        else if (duration === "1w") startDate.setDate(startDate.getDate() - 7);
        else if (duration === "1m") startDate.setMonth(startDate.getMonth() - 1);
        else if (duration === "1y") startDate.setFullYear(startDate.getFullYear() - 1);
        else startDate.setDate(startDate.getDate() - 7); // fallback

        const todos = await prisma.todo.findMany({
            where: {
                userId: session.user.id,
                completed: true,
                completedAt: { gte: startDate }
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { xp: true, level: true, name: true, image: true, createdAt: true, totalStreakDays: true }
        });
        
        const sub = await prisma.subscription.findFirst({
            where: { userId: session.user.id, status: "active" }
        });
        const isPro = !!sub;

        let totalXp = 0;
        let categories: Record<string, number> = {};
        
        // Setup spark data for last 7 days
        const sparkDataMap: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            sparkDataMap[d.toISOString().split('T')[0]] = 0;
        }

        todos.forEach((t: any) => {
            totalXp += t.earnedXp || 0;
            const cat = (t.category || "General").toLowerCase();
            categories[cat] = (categories[cat] || 0) + 1;
            
            if (t.completedAt) {
                 const dateStr = new Date(t.completedAt).toISOString().split('T')[0];
                 if (dateStr in sparkDataMap) {
                     sparkDataMap[dateStr] += (t.earnedXp || 20); // fallback 20 xp logic
                 }
            }
        });

        let mostUsedCategory = "Unstoppable";
        let maxTasks = 0;
        Object.entries(categories).forEach(([c, count]) => {
            if (count > maxTasks) { maxTasks = count; mostUsedCategory = c; }
        });

        // Capitalize category
        mostUsedCategory = mostUsedCategory.charAt(0).toUpperCase() + mostUsedCategory.slice(1);

        const stats = {
            duration,
            tasksCompleted: todos.length,
            xpEarned: totalXp,
            mostWorkedCategory: mostUsedCategory,
            treesGrown: Math.floor(todos.length / 5), 
            userLevel: user?.level || 1,
            userTotalXp: user?.xp || 0,
            userName: user?.name || "Architect",
            userImage: user?.image || "",
            isPro: isPro,
            memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear(),
            streak: user?.totalStreakDays || 0,
            xpPct: ((user?.xp || 0) % 1000) / 1000,
            sparkData: Object.values(sparkDataMap)
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Error in analytics card GET:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
