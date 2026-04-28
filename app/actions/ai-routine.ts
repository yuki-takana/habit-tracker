"use server";

import { model } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateAiRoutine(focus: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { userProfile: true, userGoals: true }
    });
    if (!user) throw new Error("User not found");

    const prompt = `
    You are an AI life coach. The user wants a daily routine generated.
    User's chosen focus: "${focus}"
    User's goals: ${JSON.stringify(user.userGoals.map(g => g.goal))}
    
    Please create a daily routine consisting of tasks from morning to evening.
    The routine should cover their goals and normal life rules like eating, resting, and other things.
    Format your response as a valid JSON object. It MUST have these properties:
    - "name": (string) A catchy name for this routine
    - "description": (string) A short note on how the user should live this routine
    - "wakeUpTime": (string) in "HH:MM" format (e.g., "06:00")
    - "energyProfile": (string) one of "high-focus", "balanced", or "light"
    - "tasks": an array of objects, each with:
        - "title": (string) task title
        - "category": (string) one of "fitness", "work", "health", "coding", "learning", "personal", "break"
        - "startTime": (string) "HH:MM" format
        - "duration": (number) in minutes

    Respond ONLY with the JSON object.
    `;

    try {
        const response = await model.invoke(prompt);
        let content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse AI response. No JSON found.");
        }
        
        const routineData = JSON.parse(jsonMatch[0]);

        // Save the routine to DB
        const newRoutine = await prisma.routine.create({
            data: {
                userId: user.id,
                name: routineData.name,
                description: routineData.description,
                wakeUpTime: routineData.wakeUpTime,
                energyProfile: routineData.energyProfile || "balanced",
                isActive: true, // Make it active by default
                tasks: {
                    create: routineData.tasks.map((t: any, index: number) => ({
                        title: t.title,
                        category: t.category,
                        startTime: t.startTime,
                        duration: t.duration,
                        order: index
                    }))
                }
            }
        });

        // Deactivate other routines
        await prisma.routine.updateMany({
            where: {
                userId: user.id,
                id: { not: newRoutine.id }
            },
            data: { isActive: false }
        });

        return newRoutine;
    } catch (error) {
        console.error("AI Routine Generation Error:", error);
        throw new Error("Failed to generate routine. Please try again later.");
    }
}
