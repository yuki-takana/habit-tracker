import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProgressCard } from "@/features/analytics/shareable-card";
import { THEMES } from "@/features/analytics/shareable-card-themes";

const PUBLIC_VIS = {
    header: true,
    periodTabs: false,
    graph: true,
    levelBlock: true,
    heroXp: true,
    streakShield: true,
    treesTodo: true,
    categories: true,
    footer: true,
};

type Props = { params: Promise<{ username: string }> };

export default async function UserPublicPage({ params }: Props) {
    const { username } = await params;
    const usernameDecoded = decodeURIComponent(username);

    const user = await prisma.user.findFirst({
        where: { name: { equals: usernameDecoded, mode: "insensitive" } },
        select: {
            id: true,
            xp: true,
            level: true,
            name: true,
            image: true,
            createdAt: true,
            totalStreakDays: true,
        },
    });

    if (!user) notFound();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const todos = await prisma.todo.findMany({
        where: {
            userId: user.id,
            completed: true,
            completedAt: { gte: startDate },
        },
    });

    const sub = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "active" },
    });

    const isPro = !!sub;

    let totalXp = 0;
    let categories: Record<string, number> = {};

    const sparkDataMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        sparkDataMap[d.toISOString().split("T")[0]] = 0;
    }

    todos.forEach((t: any) => {
        totalXp += t.earnedXp || 0;

        const cat = (t.category || "General").toLowerCase();
        categories[cat] = (categories[cat] || 0) + 1;

        if (t.completedAt) {
            const dateStr = new Date(t.completedAt).toISOString().split("T")[0];
            if (dateStr in sparkDataMap) {
                sparkDataMap[dateStr] += t.earnedXp || 20;
            }
        }
    });

    let mostUsedCategory = "Unstoppable";
    let maxTasks = 0;

    Object.entries(categories).forEach(([c, count]) => {
        if (count > maxTasks) {
            maxTasks = count;
            mostUsedCategory = c;
        }
    });

    mostUsedCategory =
        mostUsedCategory.charAt(0).toUpperCase() + mostUsedCategory.slice(1);

    const stats = {
        tasksCompleted: todos.length,
        xpEarned: totalXp,
        mostWorkedCategory: mostUsedCategory,
        treesGrown: Math.floor(todos.length / 5),

        userName: user.name || "Architect",
        avatarUrl: user.image || "",
        userLevel: user.level || 1,
        userTotalXp: user.xp || 0,

        roleLevel: Math.floor((user.level || 1) / 5),
        roleTitle: user.level > 20 ? "Cultivator" : "Seedling",

        streak: user.totalStreakDays || 0,
        longestStreak: user.totalStreakDays || 0,
        shields: 0,

        xpPct: ((user.xp || 0) % 1000) / 1000,
        sparkData: Object.values(sparkDataMap),

        isPro,
        memberSince: user.createdAt
            ? String(new Date(user.createdAt).getFullYear())
            : String(new Date().getFullYear()),
    };

    let themeId = "forest";

    if (isPro) themeId = "aurora";
    else if (user.level >= 20) themeId = "ocean";

    const theme = THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === "forest") || THEMES[0];

    return (
        <div className="h-auto flex items-center justify-center p-4">
            <ProgressCard
                stats={stats}
                durKey="1w"
                vis={PUBLIC_VIS}
                theme={theme}
            />
        </div>
    );
}

export async function generateMetadata({ params }: Props) {
    const { username } = await params;
    console.log("Generating metadata for user:", username);
    const user = await prisma.user.findFirst({
        where: {
            name: { equals: decodeURIComponent(username), mode: "insensitive" },
        },
    });

    return {
        title: `${user?.name || "A Habit Architect"} is building their ultimate system on UFL`,
        description: "Check out my progress!",
    };
}