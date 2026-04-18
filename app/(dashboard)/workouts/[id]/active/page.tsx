"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Timer,
    AlertCircle,
    RotateCcw,
    X,
    Dumbbell,
    Info,
    Check,
    ChevronLeft,
    ChevronRight,
    Trophy
} from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { toast } from "sonner"
import Image from "next/image"

export default function ActiveWorkout() {
    const { id: planId } = useParams()
    const searchParams = useSearchParams()
    const workoutId = searchParams.get("workoutId")
    const router = useRouter()

    const [workout, setWorkout] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFinishing, setIsFinishing] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    // Fetch workout data
    useEffect(() => {
        const fetchWorkout = async () => {
            if (!workoutId) return
            try {
                const response = await fetch(`/api/workout-plans/${planId}`)
                const data = await response.json()
                console.log("data is ", data)
                if (data.success) {
                    const foundWorkout = data.workouts.find((w: any) => w.id === workoutId)
                    setWorkout(foundWorkout)
                }
            } catch (error) {
                console.error("Failed to fetch workout:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchWorkout()
    }, [planId, workoutId])

    // Browser exit guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    const handleUpdateSets = async (exerciseId: string, sets: number) => {
        setIsDirty(true)
        // Optimistic update
        setWorkout((prev: any) => ({
            ...prev,
            exercises: prev.exercises.map((e: any) =>
                e.id === exerciseId ? { ...e, completedSets: sets } : e
            )
        }))

        try {
            await fetch(`/api/workout-exercises/${exerciseId}`, {
                method: 'PATCH',
                body: JSON.stringify({ completedSets: sets })
            })
        } catch (error) {
            toast.error("Failed to sync progress")
        }
    }

    const handleFinish = async () => {
        setIsFinishing(true)
        try {
            const response = await fetch(`/api/workouts/${workoutId}/complete`, {
                method: 'POST',
                body: JSON.stringify({ isCompleted: true })
            })
            if (response.ok) {
                setIsDirty(false)
                toast.success("Workout Crushed! Great job.")
                router.push(`/workouts/${planId}`)
            }
        } catch (error) {
            toast.error("Failed to finalize workout")
        } finally {
            setIsFinishing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <UflLoaderInline style="flip" text="Starting your session..." />
                </div>
            </div>
        )
    }

    if (!workout) return null

    const currentExercise = workout.exercises[currentIndex]
    const totalExercises = workout.exercises.length
    const sessionProgress = ((currentIndex + (currentExercise.completedSets / currentExercise.sets)) / totalExercises) * 100

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (isDirty) {
                                toast("Leave Workout?", {
                                    description: "Your progress isn't finished. Are you sure?",
                                    action: { label: "Leave", onClick: () => router.back() },
                                    cancel: { label: "Cancel", onClick: () => {} }
                                })
                            } else {
                                router.back()
                            }
                        }}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="font-bold leading-none">{workout.focus}</h2>
                        <p className="text-xs text-muted-foreground mt-1">Exercise {currentIndex + 1} of {totalExercises}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md mx-8">
                    <Progress value={sessionProgress} className="h-2" />
                </div>
                <Button
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                        toast("Finish workout early?", {
                            action: { label: "Finish", onClick: () => handleFinish() },
                            cancel: { label: "Cancel", onClick: () => {} }
                        })
                    }}
                >
                    Quick End
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col items-center p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentExercise.id}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -20 }}
                        className="w-full max-w-2xl space-y-6"
                    >
                        {/* Exercise Banner */}
                        <div className="aspect-video relative rounded-2xl overflow-hidden bg-muted shadow-2xl border-4 border-card">
                            {(currentExercise.exerciseId || currentExercise.gifUrl) ? (
                                <img
                                    src={currentExercise.exerciseId ? `/api/exercise-gif/${currentExercise.exerciseId}` : currentExercise.gifUrl}
                                    alt={currentExercise.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <Dumbbell className="w-16 h-16 mb-2 opacity-20" />
                                    <p>No visualization available</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                    {currentExercise.name}
                                </h1>
                            </div>
                        </div>

                        {/* Stats & Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase text-primary mb-1">Target Weight</span>
                                    <span className="text-2xl font-black">{currentExercise.weight || "--"} <span className="text-sm font-normal">kg</span></span>
                                </CardContent>
                            </Card>
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase text-primary mb-1">Reps Goal</span>
                                    <span className="text-2xl font-black">{currentExercise.reps}</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coach Notes */}
                        {currentExercise.notes && (
                            <div className="flex gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-600">
                                <Info className="w-5 h-5 shrink-0" />
                                <p className="text-sm leading-relaxed">{currentExercise.notes}</p>
                            </div>
                        )}

                        {/* Sets Tracker */}
                        <div className="space-y-4">
                            <h3 className="text-center font-bold text-muted-foreground uppercase tracking-widest text-xs">Progress Tracker</h3>
                            <div className="flex justify-center gap-3">
                                {[...Array(currentExercise.sets)].map((_, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            const newSets = currentExercise.completedSets === i + 1 ? i : i + 1
                                            handleUpdateSets(currentExercise.id, newSets)
                                        }}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 font-bold text-xl border-4 ${i < currentExercise.completedSets
                                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
                                            : "bg-card border-muted hover:border-primary/50 text-muted-foreground"
                                            }`}
                                    >
                                        {i < currentExercise.completedSets ? <Check className="w-6 h-6 stroke-[4]" /> : i + 1}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="pt-8 flex gap-4">
                            {currentIndex > 0 && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 rounded-xl h-16"
                                    onClick={() => setCurrentIndex(c => c - 1)}
                                >
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                    Prev
                                </Button>
                            )}

                            {currentIndex < totalExercises - 1 ? (
                                <Button
                                    variant="default"
                                    size="lg"
                                    className={`flex-1 rounded-xl h-16 shadow-xl ${currentExercise.completedSets === currentExercise.sets
                                        ? "animate-pulse"
                                        : "opacity-80"
                                        }`}
                                    onClick={() => {
                                        if (currentExercise.completedSets < currentExercise.sets) {
                                            toast("Move to next exercise?", {
                                                description: "You haven't finished all sets.",
                                                action: { label: "Continue", onClick: () => setCurrentIndex(c => c + 1) },
                                                cancel: { label: "Cancel", onClick: () => {} }
                                            })
                                            return;
                                        }
                                        setCurrentIndex(c => c + 1)
                                    }}
                                >
                                    Next Exercise
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="flex-[2] rounded-xl h-16 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20"
                                    disabled={isFinishing}
                                    onClick={handleFinish}
                                >
                                    {isFinishing ? (
                                        <UflLoaderInline style="flip" compact={true} className="mr-2" />
                                    ) : (
                                        <Trophy className="w-6 h-6 mr-2" />
                                    )}
                                    Finish & Save Session
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Success Overlay (Conditional) */}
            <AnimatePresence>
                {workout.isCompleted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[100] bg-primary flex flex-col items-center justify-center text-primary-foreground p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                        >
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8">
                                <Trophy className="w-16 h-16 text-primary" />
                            </div>
                        </motion.div>
                        <h1 className="text-6xl font-black mb-4 uppercase italic">MISSION COMPLETE</h1>
                        <p className="text-xl max-w-md opacity-90 mb-12">
                            You've dominated this session. Consistency is the only path to greatness.
                        </p>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="rounded-full px-12 h-14 font-black"
                            onClick={() => router.push(`/workouts/${planId}`)}
                        >
                            Back to Blueprint
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
