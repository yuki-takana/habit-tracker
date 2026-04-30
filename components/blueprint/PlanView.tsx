"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    CheckCircle2, Circle, ChevronRight, Sparkles,
    Clock, Target, LucideIcon
} from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { cn } from "@/lib/utils"

interface PlanViewProps {
    planId: string
    domain: string
    accentColor: string       // e.g. "rose", "orange", "violet"
    icon: LucideIcon
    title: string             // e.g. "Health Coach", "Business Architect"
}

export function PlanView({ planId, domain, accentColor, icon: Icon, title }: PlanViewProps) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeWeek, setActiveWeek] = useState(1)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const accent = accentColor

    const fetchPlan = useCallback(async () => {
        try {
            const res = await fetch(`/api/plans/${domain}/${planId}`)
            const data = await res.json()
            if (data.success) {
                setPlan(data.plan)
                // Set active week to first incomplete week
                if (data.plan.weeks?.length) {
                    const firstIncomplete = data.plan.weeks.find((w: any) =>
                        w.tasks?.some((t: any) => !t.isCompleted)
                    )
                    if (firstIncomplete) setActiveWeek(firstIncomplete.weekNumber)
                }
            }
        } catch (err) {
            console.error("Failed to fetch plan:", err)
        } finally {
            setIsLoading(false)
        }
    }, [planId, domain])

    useEffect(() => {
        fetchPlan()
    }, [fetchPlan])

    const toggleTask = async (weekId: string, taskId: string, currentState: boolean) => {
        if (togglingId) return
        setTogglingId(taskId)

        // Optimistic update
        setPlan((prev: any) => ({
            ...prev,
            weeks: prev.weeks.map((w: any) =>
                w.id === weekId
                    ? {
                        ...w,
                        tasks: w.tasks.map((t: any) =>
                            t.id === taskId
                                ? { ...t, isCompleted: !currentState, completedAt: !currentState ? new Date().toISOString() : null }
                                : t
                        ),
                    }
                    : w
            ),
        }))

        try {
            await fetch(`/api/plans/${domain}/${planId}/tasks/${taskId}`, { method: "PATCH" })
        } catch (err) {
            console.error("Failed to toggle task:", err)
            fetchPlan()
        } finally {
            setTogglingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <UflLoaderInline style="pulse-dots" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading your blueprint...</p>
            </div>
        )
    }

    if (!plan) {
        return <div className="text-center py-10 text-red-500 font-mono text-sm">Plan not found</div>
    }

    // Calculate overall progress
    const allTasks = plan.weeks?.flatMap((w: any) => w.tasks) || []
    const completedCount = allTasks.filter((t: any) => t.isCompleted).length
    const totalTasks = allTasks.length
    const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">

            {/* Plan Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className={cn(
                    "overflow-hidden relative border",
                    `bg-gradient-to-br from-${accent}-500/10 to-transparent border-${accent}-500/20`
                )}
                    style={{
                        background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 100%)`,
                        borderColor: `hsl(var(--border))`
                    }}
                >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                        <Icon className="w-40 h-40" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                `bg-${accent}-500/10`
                            )}
                                style={{ background: `var(--accent-bg, rgba(139, 92, 246, 0.1))` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: `var(--accent-fg, #8b5cf6)` }} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">{plan.goal}</CardTitle>
                                {plan.strategy && (
                                    <p className="text-sm text-muted-foreground mt-1">{plan.strategy}</p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Progress Bar */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span className="text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Overall Progress
                                </span>
                                <span className="text-foreground">{completedCount} / {totalTasks} tasks</span>
                            </div>
                            <Progress value={completionPct} className="h-3" />
                            <p className="text-xs text-muted-foreground font-medium">
                                {completionPct}% complete · {plan.weeks?.length || 0} weeks planned
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Week Selector */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap gap-3"
            >
                {plan.weeks?.map((week: any) => {
                    const weekCompleted = week.tasks?.every((t: any) => t.isCompleted) && week.tasks?.length > 0
                    const weekTasksDone = week.tasks?.filter((t: any) => t.isCompleted).length || 0
                    const weekTasksTotal = week.tasks?.length || 0
                    const isActive = week.weekNumber === activeWeek

                    return (
                        <button
                            key={week.id}
                            onClick={() => setActiveWeek(week.weekNumber)}
                            className={cn(
                                "px-5 py-3 rounded-2xl font-bold transition-all flex flex-col items-center gap-1 border shadow-sm min-w-[100px]",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                    : "bg-card hover:bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-1.5 text-sm">
                                Week {week.weekNumber}
                                {weekCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </span>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                                {weekTasksDone}/{weekTasksTotal} done
                            </span>
                        </button>
                    )
                })}
            </motion.div>

            {/* Week Focus Banner */}
            {plan.weeks?.map((week: any) => {
                if (week.weekNumber !== activeWeek) return null
                return (
                    <motion.div
                        key={week.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 px-5 py-3 bg-muted/50 rounded-xl border border-border/50"
                    >
                        <Target className="w-4 h-4 text-primary shrink-0" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Week {week.weekNumber} Focus</p>
                            <p className="text-sm font-semibold text-foreground">{week.focus}</p>
                        </div>
                    </motion.div>
                )
            })}

            {/* Tasks List */}
            <AnimatePresence mode="wait">
                {plan.weeks?.map((week: any) => {
                    if (week.weekNumber !== activeWeek) return null
                    return (
                        <motion.div
                            key={week.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {week.tasks?.map((task: any, idx: number) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => toggleTask(week.id, task.id, task.isCompleted)}
                                    className={cn(
                                        "group relative p-5 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-md",
                                        task.isCompleted
                                            ? "bg-muted/30 border-muted opacity-80"
                                            : "bg-card border-border/60 hover:border-primary/40 shadow-sm"
                                    )}
                                >
                                    <div className="flex gap-4 items-start">
                                        {/* Checkbox */}
                                        <div className={cn(
                                            "mt-0.5 flex-shrink-0 transition-transform active:scale-90",
                                            task.isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                        )}>
                                            {task.isCompleted
                                                ? <CheckCircle2 className="w-7 h-7" />
                                                : <Circle className="w-7 h-7" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <h3 className={cn(
                                                    "text-base font-bold tracking-tight",
                                                    task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                                )}>
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {task.dayNumber && (
                                                        <Badge variant="outline" className="text-[10px] font-bold bg-background/50">
                                                            Day {task.dayNumber}
                                                        </Badge>
                                                    )}
                                                    {(task.type || task.category || task.platform || task.domain) && (
                                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                                                            {task.type || task.category || task.platform || task.domain}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {!task.isCompleted && task.description && (
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {task.description}
                                                </p>
                                            )}

                                            {task.resource && !task.isCompleted && (
                                                <div className="flex items-start gap-2 pt-1 text-xs font-semibold text-primary/80">
                                                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span>{task.resource}</span>
                                                </div>
                                            )}

                                            {task.isCompleted && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Completed
                                                    {task.completedAt && (
                                                        <span className="text-muted-foreground font-normal normal-case">
                                                            · {new Date(task.completedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary/40 transition-colors shrink-0 mt-1" />
                                    </div>
                                </motion.div>
                            ))}

                            {(!week.tasks || week.tasks.length === 0) && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-sm">No tasks for this week yet.</p>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

