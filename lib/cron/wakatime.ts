
import { prisma } from "@/lib/prisma";
import { fetchTodayStats } from "@/lib/vscodeStats";

export async function runWakatimeSync() {
    const users = await prisma.user.findMany();

    const results = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
        if (!user.wakatimeApiKey) continue;

        const stats = await fetchTodayStats(user.wakatimeApiKey);

        if (stats && typeof stats !== "string") {
            console.log(`Successfully fetched stats for ${user.email}. Total time: ${stats.totalTime}`);
            await prisma.wakaTime.upsert({
                where: {
                    userId_date: {
                        userId: user.id,
                        date: today,
                    },
                },
                update: {
                    totalTime: stats.totalTime,
                    projects: stats.projects,
                    languages: stats.languages,
                    categories: stats.categories,
                },
                create: {
                    userId: user.id,
                    date: today,
                    totalTime: stats.totalTime,
                    projects: stats.projects,
                    languages: stats.languages,
                    categories: stats.categories,
                },
            });
            results.push({ email: user.email, userId: user.id, success: true, totalTime: stats.totalTime });
        } else {
            console.warn(`Failed to fetch stats for ${user.email}: ${stats || "No stats found"}`);
            results.push({ email: user.email, userId: user.id, success: false, error: stats || "No stats found" });
        }
    }

    console.log("✅ WakaTime synced");
}