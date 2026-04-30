"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Info } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface WorkoutExerciseItemProps {
    exercise: any
}

export function WorkoutExerciseItem({ exercise, workoutId }: { exercise: any, workoutId: string }) {
    const [isCompleted, setIsCompleted] = useState(exercise.workout?.isCompleted || false)
    const [isLoading, setIsLoading] = useState(false)

    const toggleComplete = async () => {
        setIsLoading(true)
        try {
            await fetch(`/api/exercises/${workoutId}/toggle-complete`, {
                method: "POST",
                body: JSON.stringify({ completed: !isCompleted })
            })
            setIsCompleted(!isCompleted)
        } catch (error) {
            console.error("Failed to toggle workout status:", error)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-between p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleComplete}
                    disabled={isLoading}
                    className="text-primary hover:scale-110 transition-transform"
                >
                    {isLoading ? (
                        <UflLoaderInline style="pulse-dots" className="py-0 h-6 w-6" />
                    ) : isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 fill-primary text-primary-foreground" />
                    ) : (
                        <Circle className="w-6 h-6" />
                    )}
                </button>
                <div>
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps {exercise.weight ? `@ ${exercise.weight}kg` : ""}
                    </p>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Info className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{exercise.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {exercise.gifUrl && (
                            <div className="aspect-video relative rounded-lg overflow-hidden border">
                                <img
                                    src={exercise.gifUrl}
                                    alt={exercise.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                        {exercise.notes && (
                            <div className="space-y-2">
                                <h5 className="font-bold text-sm">Coach's Tips:</h5>
                                <p className="text-sm text-muted-foreground italic">
                                    "{exercise.notes}"
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <span className="text-xs uppercase text-muted-foreground font-bold">Target Sets</span>
                                <p className="text-lg font-semibold">{exercise.sets}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-muted-foreground font-bold">Target Reps</span>
                                <p className="text-lg font-semibold">{exercise.reps}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

