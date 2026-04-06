import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch latest plan for each category (could be optimized or paginated, but fine for MVP)
        const [gym, income, project, career, life, relationship, network, business, health, learning, mindset, productivity] = await Promise.all([
            prisma.workoutPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.incomePlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.projectPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.careerPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.lifePlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.relationshipPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.networkingPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.businessPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.healthPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.learningPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.mindsetPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            prisma.productivityPlan.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        ]);

        const activeBlueprints = [];

        if (gym) activeBlueprints.push({ type: 'Gym', title: gym.goal, id: gym.id, link: '/workouts', icon: 'Dumbbell', color: 'text-cyan-500' });
        if (income) activeBlueprints.push({ type: 'Income', title: income.goal.substring(0, 50) + "...", id: income.id, link: `/blueprint/income/${income.id}`, icon: 'Wallet', color: 'text-emerald-500' });
        if (project) activeBlueprints.push({ type: 'Project', title: project.projectName, id: project.id, link: `/blueprint/project/${project.id}`, icon: 'Code', color: 'text-violet-500' });
        if (career) activeBlueprints.push({ type: 'Career', title: `${career.currentRole} -> ${career.targetRole}`, id: career.id, link: `/blueprint/career/${career.id}`, icon: 'BriefcaseBusiness', color: 'text-amber-500' });
        if (life) activeBlueprints.push({ type: 'Life', title: life.goal, id: life.id, link: `/blueprint/life/${life.id}`, icon: 'LifeBuoy', color: 'text-indigo-500' });
        if (relationship) activeBlueprints.push({ type: 'Relationship', title: relationship.goal, id: relationship.id, link: `/blueprint/relationship/${relationship.id}`, icon: 'Heart', color: 'text-pink-500' });
        if (network) activeBlueprints.push({ type: 'Network', title: network.goal, id: network.id, link: `/blueprint/networking/${network.id}`, icon: 'Users', color: 'text-purple-500' });
        if (business) activeBlueprints.push({ type: 'Business', title: business.goal, id: business.id, link: `/blueprint/business/${business.id}`, icon: 'BuildingStorefront', color: 'text-gray-500' });
        if (health) activeBlueprints.push({ type: 'Health', title: health.goal, id: health.id, link: `/blueprint/health/${health.id}`, icon: 'HeartPulse', color: 'text-red-500' });
        if (learning) activeBlueprints.push({ type: 'Learning', title: learning.goal, id: learning.id, link: `/blueprint/learning/${learning.id}`, icon: 'BookOpen', color: 'text-green-500' });
        if (mindset) activeBlueprints.push({ type: 'Mindset', title: mindset.goal, id: mindset.id, link: `/blueprint/mindset/${mindset.id}`, icon: 'Sparkles', color: 'text-yellow-500' });
        if (productivity) activeBlueprints.push({ type: 'Productivity', title: productivity.goal, id: productivity.id, link: `/blueprint/productivity/${productivity.id}`, icon: 'ChartBar', color: 'text-blue-500' });

        return NextResponse.json({ success: true, blueprints: activeBlueprints });
    } catch (error: any) {
        console.error("Dashboard Active Blueprints Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
