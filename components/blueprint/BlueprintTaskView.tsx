"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Calendar, ChevronRight, Sparkles, Clock, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { format } from "date-fns"

interface Task {
    id: string;
    title: string;
    description: string | null;
    weekNumber: number;
    dayNumber: number | null;
    isCompleted: boolean;
    deadline: string | null;
    expectedOutcome: string | null;
}

export function BlueprintTaskView({ planId }: { planId: string }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeWeek, setActiveWeek] = useState(1)

    useEffect(() => {
        fetchTasks()
    }, [planId])

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/blueprint/tasks/${planId}`)
            const data = await res.json()
            if (data.success) {
                setTasks(data.tasks)
                const currentWeek = data.tasks.find((t: Task) => !t.isCompleted)?.weekNumber || 1
                setActiveWeek(currentWeek)
            }
        } catch (err) {
            console.error("Failed to fetch tasks:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleTask = async (taskId: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !currentStatus } : t))

        try {
            await fetch(`/api/blueprint/tasks/${planId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, isCompleted: !currentStatus })
            })
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: currentStatus } : t))
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <UflLoaderInline style="pulse-dots" />
            <p className="text-muted-foreground animate-pulse font-medium">Assembling your daily roadmap...</p>
        </div>
    )

    const weeks = Array.from(new Set(tasks.map(t => t.weekNumber))).sort((a, b) => a - b)
    const filteredTasks = tasks.filter(t => t.weekNumber === activeWeek)
    const totalCompleted = tasks.filter(t => t.isCompleted).length
    const progress = tasks.length > 0 ? (totalCompleted / tasks.length) * 100 : 0

    return (
        <div className="space-y-10 max-w-4xl mx-auto pb-20">
            {/* Header Dashboard */}
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 scale-110">Live Blueprint</Badge>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">Progress Tracker</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">Your Roadmap Journey</h1>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                        <div className="flex justify-between w-full text-sm font-bold">
                            <span className="text-muted-foreground uppercase tracking-wider">Overall Completion</span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-4 w-full bg-primary/5 border border-primary/10 shadow-inner" />
                        <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                            {totalCompleted} OF {tasks.length} OBJECTIVES SECURED
                        </p>
                    </div>
                </div>
            </div>

            {/* Week Selector */}
            <div className="flex flex-wrap gap-3">
                {weeks.map(w => {
                    const weekTasks = tasks.filter(t => t.weekNumber === w)
                    const weekCompleted = weekTasks.every(t => t.isCompleted)
                    const isToday = w === activeWeek

                    return (
                        <button
                            key={w}
                            onClick={() => setActiveWeek(w)}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border shadow-sm
                                ${isToday
                                    ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105"
                                    : "bg-card hover:bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Week {w}
                            {weekCompleted && <CheckCircle2 className="w-4 h-4 ml-1" />}
                        </button>
                    )
                })}
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeWeek}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {filteredTasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative p-6 rounded-2xl border transition-all hover:shadow-lg
                                    ${task.isCompleted
                                        ? "bg-muted/30 border-muted grayscale-[0.5] opacity-80"
                                        : "bg-card border-border/60 hover:border-primary/40 shadow-sm"}`}
                            >
                                <div className="flex gap-6 items-start">
                                    <button
                                        onClick={() => toggleTask(task.id, task.isCompleted)}
                                        className={`mt-1 flex-shrink-0 transition-transform active:scale-90
                                            ${task.isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                                    >
                                        {task.isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                                    </button>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <h3 className={`text-xl font-bold tracking-tight ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                {task.title}
                                            </h3>
                                            {task.deadline && (
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-background/50 border-border/50">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {format(new Date(task.deadline), "MMM d, yyyy")}
                                                </Badge>
                                            )}
                                        </div>

                                        {task.description && (
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {task.description}
                                            </p>
                                        )}

                                        {task.expectedOutcome && (
                                            <div className="flex items-start gap-2 pt-2 text-xs font-semibold text-primary/80">
                                                <Target className="w-3.5 h-3.5 mt-0.5" />
                                                <span>Outcome: {task.expectedOutcome}</span>
                                            </div>
                                        )}
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

