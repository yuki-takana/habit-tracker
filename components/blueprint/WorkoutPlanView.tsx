"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { WorkoutExerciseItem } from "./WorkoutExerciseItem"


interface WorkoutPlanViewProps {
    planId: string
}

export function WorkoutPlanView({ planId }: WorkoutPlanViewProps) {
    const [plan, setPlan] = useState<any>(null)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch(`/api/workout-plans/${planId}`)
                const data = await response.json()
                setPlan(data.plan)
                if (data.plan?.workouts?.length > 0) {
                    setSelectedDay(data.plan.workouts[0].dayOfWeek)
                }
            } catch (error) {
                console.error("Failed to fetch plan:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlan()
    }, [planId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <UflLoaderInline style="pulse-dots" />
            </div>
        )
    }

    if (!plan) return null

    const currentWorkout = plan.workouts.find((w: any) => w.dayOfWeek === selectedDay)

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {plan.workouts.map((workout: any) => (
                    <Button
                        key={workout.id}
                        variant={selectedDay === workout.dayOfWeek ? "default" : "outline"}
                        onClick={() => setSelectedDay(workout.dayOfWeek)}
                        className="flex-shrink-0"
                    >
                        {workout.dayOfWeek}
                        {workout.isCompleted && <CheckCircle2 className="ml-2 w-4 h-4" />}
                    </Button>
                ))}
            </div>

            {currentWorkout && (
                <Card className="border-2">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="flex justify-between items-center">
                            <span>{currentWorkout.focus}</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {currentWorkout.exercises.length} Exercises
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {currentWorkout.exercises.map((exercise: any) => (
                            <WorkoutExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                workoutId={currentWorkout.id}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

