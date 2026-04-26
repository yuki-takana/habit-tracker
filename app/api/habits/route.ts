import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api-auth";
import { hasReachedHabitLimit } from "@/lib/subscription";

export const POST = withAuth(async (req, context, user) => {
    try {

        const limitReached = await hasReachedHabitLimit(user.id);
        if (limitReached) {
            return NextResponse.json(
                { error: "Free plan limit reached. Upgrade to Pro for unlimited habits." },
                { status: 403 }
            );
        }

        const { name, description, category, frequency, autoCreateTodos, force, targetType, targetValue, targetUnit } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Conflict check: check for existing habit with same name
        if (!force) {
            const existingHabit = await prisma.habit.findFirst({
                where: { userId: user.id, name: { equals: name, mode: 'insensitive' } }
            });

            if (existingHabit) {
                return NextResponse.json(
                    { error: "Conflict", message: `You already have a ritual named "${name}". Create duplicate?` },
                    { status: 409 }
                );
            }
        }

        const habit = await prisma.habit.create({
            data: {
                name,
                description,
                category,
                frequency,
                autoCreateTodos: !!autoCreateTodos,
                targetType,
                targetValue,
                targetUnit,
                userId: user.id,
            },
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error("Error creating habit:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
});

export const GET = withAuth(async (req, context, user) => {
    try {

        const habits = await prisma.habit.findMany({
            where: { userId: user.id },
            include: {
                logs: {
                    where: {
                        date: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                },
                _count: {
                    select: { logs: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(habits);
    } catch (error) {
        console.error("Error fetching habits:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
});
