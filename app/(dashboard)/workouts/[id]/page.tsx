"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft,
    Play,
    CheckCircle2,
    Clock,
    Dumbbell,
    ChevronRight,
    Trophy,
    CalendarDays
} from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import Link from "next/link"

export default function WorkoutDetail() {
    const { id } = useParams()
    const router = useRouter()
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [todayName, setTodayName] = useState("")

    useEffect(() => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        setTodayName(days[new Date().getDay()])

        const fetchPlan = async () => {
            try {
                const response = await fetch(`/api/workout-plans/${id}`)
                const data = await response.json()
                if (data.success) {
                    setPlan(data)
                }
            } catch (error) {
                console.error("Failed to fetch plan:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlan()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <UflLoaderInline style="pulse-dots" text="Loading workout..." />
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="container py-20 text-center space-y-4">
                <h2 className="text-2xl font-bold">Blueprint Not Found</h2>
                <p className="text-muted-foreground text-lg">We couldn't find the requested workout plan.</p>
                <Link href="/workouts">
                    <Button>Return to Hub</Button>
                </Link>
            </div>
        )
    }

    const totalWorkouts = plan.workouts.length
    const completedWorkouts = plan.workouts.filter((w: any) => w.isCompleted).length
    const progress = (completedWorkouts / totalWorkouts) * 100

    return (
        <div className="container max-w-5xl py-10 space-y-8 pb-20">
            <Link href="/workouts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blueprints
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1">
                        Active Blueprint Plan
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">{plan.goal}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            <span>Week {plan.weekNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Dumbbell className="w-4 h-4" />
                            <span>{totalWorkouts} Days/Week</span>
                        </div>
                    </div>
                </div>

                <Card className="w-full md:w-72 bg-primary/5 border-primary/20 backdrop-blur-sm">
                    <CardContent className="pt-6 space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Progress</span>
                            <span className="text-2xl font-black">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-primary/20" />
                        <p className="text-xs text-muted-foreground italic">
                            {completedWorkouts} of {totalWorkouts} sessions crushed this week.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {plan.workouts.map((workout: any, index: number) => {
                    const isToday = workout.dayOfWeek === todayName
                    const isCompleted = workout.isCompleted

                    return (
                        <motion.div
                            key={workout.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`relative overflow-hidden transition-all duration-300 ${isToday
                                ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5 bg-primary/2"
                                : "hover:border-primary/30"
                                } ${isCompleted ? "opacity-75" : ""}`}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className={`p-6 md:w-48 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/50 ${isToday ? "bg-primary/10" : "bg-muted/30"
                                            }`}>
                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                                {workout.dayOfWeek}
                                            </span>
                                            <span className="text-2xl font-black">
                                                {isToday ? "TODAY" : workout.dayOfWeek.substring(0, 3)}
                                            </span>
                                        </div>

                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                                        {workout.focus}
                                                        {isCompleted && (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/10" />
                                                        )}
                                                    </h3>
                                                    <p className="text-muted-foreground line-clamp-1">
                                                        {workout.exercises.map((e: any) => e.name).join(", ")}
                                                    </p>
                                                </div>
                                                <Badge variant={isCompleted ? "secondary" : isToday ? "default" : "outline"}>
                                                    {isCompleted ? "Completed" : isToday ? "Up Next" : "Scheduled"}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                                    <Dumbbell className="w-3.5 h-3.5" />
                                                    {workout.exercises.length} Exercises
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    ~45 min
                                                </div>
                                                {isCompleted && workout.completedAt && (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <Trophy className="w-3.5 h-3.5" />
                                                        Done on {new Date(workout.completedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 md:pr-8 flex items-center justify-end">
                                            {isToday && !isCompleted ? (
                                                <Link href={`/workouts/${plan.id}/active?workoutId=${workout.id}`}>
                                                    <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 group">
                                                        Launch Session
                                                        <Play className="w-4 h-4 ml-2 fill-current group-hover:scale-110 transition-transform" />
                                                    </Button>
                                                </Link>
                                            ) : isCompleted ? (
                                                <Button disabled variant="outline" className="rounded-full px-6">
                                                    Session Complete
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" disabled className="text-muted-foreground">
                                                    Locked
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                {isToday && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                )}
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
