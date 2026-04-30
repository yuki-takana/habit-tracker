"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Calendar, CheckCircle2, Clock, CheckSquare, Square } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { cn } from "@/lib/utils"

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts"


export function IncomePlanView({ planId }: { planId: string }) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const fetchPlan = useCallback(async () => {
        try {
            const res = await fetch(`/api/income-plans/${planId}`)
            const data = await res.json()
            if (data.success) {
                setPlan(data.plan)
            }
        } catch (err) {
            console.error("Failed to fetch plan:", err)
        } finally {
            setIsLoading(false)
        }
    }, [planId])

    useEffect(() => {
        fetchPlan()
    }, [fetchPlan])

    const toggleTask = async (weekId: string, taskId: string, currentState: boolean) => {
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
            await fetch(`/api/income-plans/${planId}/tasks/${taskId}`, { method: "PATCH" })
        } catch (err) {
            console.error("Failed to toggle task:", err)
            // Revert on error
            fetchPlan()
        } finally {
            setTogglingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground animate-in fade-in duration-500">
                <UflLoaderInline style="pulse-dots" text="Retrieving your classified financial blueprint..." />
            </div>
        )
    }

    if (!plan) return <div className="text-center py-10 text-red-500">Failed to load plan.</div>

    // Calculate overall completion
    const allTasks = plan.weeks.flatMap((w: any) => w.tasks)
    const completedCount = allTasks.filter((t: any) => t.isCompleted).length
    const totalTasks = allTasks.length
    const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    const chartData = [
        { name: "Target Amount", value: plan.targetAmount, color: "#10b981" },
        { name: "Remaining", value: plan.targetAmount * 0.05, color: "#10b98122" },
    ]

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 mt-8">

            {/* Progress Overview */}
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Overall Completion
                    </span>
                    <span className="text-foreground">{completedCount} / {totalTasks} tasks</span>
                </div>
                <Progress value={completionPct} className="h-2.5 bg-emerald-500/10 [&>div]:bg-emerald-500" />
                <p className="text-xs text-muted-foreground">{completionPct}% of your 30-day plan completed</p>
            </div>

            {/* Strategy Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                            Strategic Overview
                        </CardTitle>
                        <CardDescription>Goal: {plan.goal}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/80 leading-relaxed font-medium">
                            "{plan.strategy}"
                        </p>
                    </CardContent>
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-inner pt-10">
                    <div className="h-32 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 left-0 right-0 text-center">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                ₹{plan.targetAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Target</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Weekly Sprints */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 px-1">
                    <Calendar className="w-6 h-6 text-emerald-500" />
                    30-Day Execution Sprints
                </h3>

                <div className="space-y-6">
                    {plan.weeks.map((week: any) => {
                        const weekCompleted = week.tasks.filter((t: any) => t.isCompleted).length
                        const weekTotal = week.tasks.length
                        return (
                            <div key={week.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-emerald-500/5 border-b p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold px-3 py-1">
                                            W{week.weekNumber}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{week.focus}</h4>
                                            <p className="text-sm text-muted-foreground font-medium dark:text-emerald-400/70">
                                                Target: ₹{week.targetEarnings.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={weekCompleted === weekTotal && weekTotal > 0 ? "default" : "secondary"} className="self-start sm:self-auto">
                                        {weekCompleted}/{weekTotal} done
                                    </Badge>
                                </div>

                                <div className="p-4 sm:p-6 space-y-3">
                                    {week.tasks.map((task: any) => (
                                        <div
                                            key={task.id}
                                            onClick={() => !togglingId && toggleTask(week.id, task.id, task.isCompleted)}
                                            className={cn(
                                                "flex gap-4 p-4 rounded-xl border border-border/50 transition-all cursor-pointer group select-none",
                                                task.isCompleted
                                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                                    : "bg-muted/30 hover:bg-muted"
                                            )}
                                        >
                                            <div className="pt-0.5 shrink-0">
                                                {task.isCompleted ? (
                                                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                                    <p className={cn(
                                                        "font-medium leading-snug transition-all",
                                                        task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                                    )}>
                                                        {task.action}
                                                    </p>
                                                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                                        {task.priority >= 4 ? (
                                                            <Badge variant="destructive" className="h-5 text-[10px] shadow-sm">High Priority</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="h-5 text-[10px] shadow-sm">P{task.priority}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {!task.isCompleted && (
                                                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-background shadow-sm border border-border/50 font-medium">
                                                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> {task.timeRequired} hr
                                                        </span>
                                                        {task.platform && (
                                                            <span className="font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{task.platform}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {!task.isCompleted && (
                                                    <div className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg mt-3 border border-emerald-500/20 flex items-start gap-2 shadow-inner">
                                                        <CheckCircle2 className="w-4 h-4 mt-0 shrink-0 opacity-80" />
                                                        <span className="font-medium">Goal: {task.expectedOutcome}</span>
                                                    </div>
                                                )}
                                                {task.isCompleted && task.completedAt && (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                        ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

