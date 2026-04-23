import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Convert a Date to a local YYYY-MM-DD string in a given UTC-offset (minutes). */
function toLocalDateStr(date: Date, offsetMinutes: number): string {
    const local = new Date(date.getTime() + offsetMinutes * 60 * 1000);
    return local.toISOString().split("T")[0];
}

/** Build an ordered map of YYYY-MM-DD → 0 for the last N days (local time). */
function buildDayMap(days: number, offsetMinutes: number): Record<string, number> {
    const map: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        // shift to local midnight
        const local = new Date(d.getTime() + offsetMinutes * 60 * 1000 - i * 86400000);
        const key = local.toISOString().split("T")[0];
        map[key] = 0;
    }
    return map;
}

// ─── route ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

        const url = new URL(req.url);
        const duration = url.searchParams.get("duration") || "1w"; // 1d | 1w | 1m | 1y

        // Client passes its UTC offset in minutes (e.g. IST = 330).
        // Falls back to 0 (UTC) if not provided — still correct, just slightly off at midnight.
        const tzOffset = parseInt(url.searchParams.get("tz") || "0", 10);

        // ── Date range for fetching todos ────────────────────────────────────
        const now = new Date();
        let startDate = new Date(now);

        if      (duration === "1d") startDate.setDate(startDate.getDate() - 1);
        else if (duration === "1w") startDate.setDate(startDate.getDate() - 7);
        else if (duration === "1m") startDate.setMonth(startDate.getMonth() - 1);
        else if (duration === "1y") startDate.setFullYear(startDate.getFullYear() - 1);
        else startDate.setDate(startDate.getDate() - 7);

        // ── Always build a 7-slot spark map for the chart ────────────────────
        // For 1d  → last 7 days (shows context)
        // For 1w  → last 7 days
        // For 1m  → last 7 days of the month window (most useful)
        // For 1y  → last 7 days (recent momentum)
        // The bar chart is always "last 7 days" regardless of the period selector.
        const sparkMap = buildDayMap(7, tzOffset);

        const todos = await prisma.todo.findMany({
            where: {
                userId: session.user.id,
                completed: true,
                completedAt: { gte: startDate },
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                xp: true, level: true, name: true,
                image: true, createdAt: true, totalStreakDays: true,
            },
        });

        const sub = await prisma.subscription.findFirst({
            where: { userId: session.user.id, status: "active" },
        });
        const isPro = !!sub;

        let totalXp = 0;
        const categories: Record<string, number> = {};

        // ── Also fetch last-7-days todos separately to populate sparkMap ─────
        // (in case duration is 1m or 1y and the todos array doesn't cover last 7 days)
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const lastWeekTodos = await prisma.todo.findMany({
            where: {
                userId: session.user.id,
                completed: true,
                completedAt: { gte: sevenDaysAgo },
            },
            select: { completedAt: true, earnedXp: true },
        });

        // Fill sparkMap with real earnedXp using local date
        lastWeekTodos.forEach((t) => {
            if (!t.completedAt) return;
            const dateStr = toLocalDateStr(t.completedAt, tzOffset);
            if (dateStr in sparkMap) {
                // earnedXp can be 0 for some todos — use 0, not a fake fallback
                sparkMap[dateStr] += t.earnedXp ?? 0;
            }
        });

        // ── Aggregate period totals ──────────────────────────────────────────
        todos.forEach((t: any) => {
            totalXp += t.earnedXp || 0;
            const cat = (t.category || "General").toLowerCase();
            categories[cat] = (categories[cat] || 0) + 1;
        });

        let mostUsedCategory = "Unstoppable";
        let maxTasks = 0;
        Object.entries(categories).forEach(([c, count]) => {
            if (count > maxTasks) { maxTasks = count; mostUsedCategory = c; }
        });
        mostUsedCategory =
            mostUsedCategory.charAt(0).toUpperCase() + mostUsedCategory.slice(1);

        const stats = {
            duration,
            tasksCompleted: todos.length,
            xpEarned:       totalXp,
            mostWorkedCategory: mostUsedCategory,
            treesGrown:     Math.floor(todos.length / 5),
            userLevel:      user?.level || 1,
            userTotalXp:    user?.xp    || 0,
            userName:       user?.name  || "Architect",
            userImage:      user?.image || "",
            avatarUrl:      user?.image || "",
            isPro,
            memberSince:    user?.createdAt
                ? new Date(user.createdAt).getFullYear()
                : new Date().getFullYear(),
            streak:         user?.totalStreakDays || 0,
            longestStreak:  user?.totalStreakDays || 0,
            shields:        0,
            xpPct:          ((user?.xp || 0) % 1000) / 1000,
            // Ordered array: index 0 = 6 days ago, index 6 = today (local time)
            sparkData:      Object.values(sparkMap),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error in /api/analytics/card:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
