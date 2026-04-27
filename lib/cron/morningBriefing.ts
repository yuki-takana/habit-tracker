import { sendMorningBriefing } from "../briefing";
import { prisma } from "@/lib/prisma";

export async function runMorningBriefing() {

    const users = await prisma.user.findMany({
        where: {
            id: "699dcea62f527ae04ef24336",
            whatsappEnabled: true,
            phone: { not: null },
        },
        select: {
            id: true,
            name: true,
            phone: true,
            wakeUpTime: true,
        },
    });
    await Promise.all(
        users.map((user) =>
            sendMorningBriefing({
                userId: user.id,
                phone: user.phone!,
                name: user.name || "Champion",
                wakeupTime: user.wakeUpTime,
            })
        )
    );
}