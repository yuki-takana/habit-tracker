"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BriefcaseBusiness, Route, CheckCircle2, Link as LinkIcon, Target, CheckSquare, Square } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { cn } from "@/lib/utils"

export function CareerPlanView({ planId }: { planId: string }) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const fetchPlan = useCallback(async () => {
        try {
            const res = await fetch(`/api/career-plans/${planId}`)
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

    const toggleMilestone = async (milestoneId: string, currentState: boolean) => {
        setTogglingId(milestoneId)
        // Optimistic update
        setPlan((prev: any) => ({
            ...prev,
            milestones: prev.milestones.map((m: any) =>
                m.id === milestoneId
                    ? { ...m, isCompleted: !currentState, completedAt: !currentState ? new Date().toISOString() : null }
                    : m
            ),
        }))

        try {
            await fetch(`/api/career-plans/${planId}/milestones/${milestoneId}`, { method: "PATCH" })
        } catch (err) {
            console.error("Failed to toggle milestone:", err)
            fetchPlan()
        } finally {
            setTogglingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground animate-in fade-in duration-500">
                <UflLoaderInline style="pulse-dots" text="Generating your career transition roadmap..." />
            </div>
        )
    }

    if (!plan) return <div className="text-center py-10 text-destructive">Failed to load career plan.</div>

    const completedCount = plan.milestones.filter((m: any) => m.isCompleted).length
    const totalMilestones = plan.milestones.length
    const completionPct = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 mt-8">

            {/* Progress Overview */}
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Career Journey Progress
                    </span>
                    <span className="text-foreground">{completedCount} / {totalMilestones} milestones</span>
                </div>
                <Progress value={completionPct} className="h-2.5 bg-amber-500/10 [&>div]:bg-amber-500" />
                <p className="text-xs text-muted-foreground">{completionPct}% of your roadmap completed</p>
            </div>

            {/* The Journey Map */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative shadow-lg">
                    <div className="absolute opacity-10 -right-10 -bottom-10 pointer-events-none">
                        <Route className="w-64 h-64" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-100 mb-1">
                            <BriefcaseBusiness className="w-5 h-5" />
                            Career Transition Plan
                        </CardTitle>
                        <CardDescription className="text-blue-100/80 font-medium text-base leading-relaxed max-w-2xl">
                            {plan.strategy}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10 pt-4">
                        {/* A-to-B Visualizer */}
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                            <div className="flex-1 text-center md:text-right space-y-1">
                                <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Current State</p>
                                <p className="text-xl font-bold">{plan.currentRole}</p>
                            </div>

                            <div className="flex items-center justify-center shrink-0 w-full md:w-32 px-4 py-2">
                                <div className="h-0.5 w-full bg-blue-300 relative flex items-center justify-center">
                                    <div className="absolute bg-indigo-500/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400">
                                        {plan.timelineWeeks} Weeks
                                    </div>
                                    <div className="absolute right-0 w-3 h-3 rotate-45 border-t-2 border-r-2 border-blue-300 translate-x-[4px]" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-1 mt-6 md:mt-0">
                                <p className="text-yellow-300 text-sm font-bold uppercase tracking-wider">Target State</p>
                                <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    {plan.targetRole}
                                    {plan.targetCompany && (
                                        <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 border-none hover:bg-yellow-400 ml-2">
                                            @ {plan.targetCompany}
                                        </Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Milestones Timeline */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 px-1 text-foreground">
                    <Target className="w-6 h-6 text-indigo-500" />
                    Weekly Milestones
                </h3>

                <div className="grid gap-6">
                    {plan.milestones.map((milestone: any) => {
                        const rawTasks = milestone.tasks || []
                        const actionTasks = rawTasks.filter((t: string) => !t.startsWith("RESOURCE:") && !t.startsWith("SUCCESS_METRIC:"))
                        const resources = rawTasks.filter((t: string) => t.startsWith("RESOURCE:")).map((r: string) => r.replace("RESOURCE:", "").trim())
                        const metrics = rawTasks.filter((t: string) => t.startsWith("SUCCESS_METRIC:")).map((m: string) => m.replace("SUCCESS_METRIC:", "").trim())

                        return (
                            <div
                                key={milestone.id}
                                className={cn(
                                    "bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group transition-all",
                                    milestone.isCompleted
                                        ? "border-amber-500/30 bg-amber-500/5"
                                        : "hover:border-indigo-500/40 hover:shadow-md"
                                )}
                            >
                                {/* Week Number Side Panel – clickable to toggle */}
                                <div
                                    onClick={() => !togglingId && toggleMilestone(milestone.id, milestone.isCompleted)}
                                    className={cn(
                                        "p-6 md:w-32 flex flex-row md:flex-col items-center md:items-start md:justify-start gap-4 border-b md:border-b-0 md:border-r border-border/50 shrink-0 cursor-pointer select-none transition-colors",
                                        milestone.isCompleted
                                            ? "bg-amber-50 dark:bg-amber-950/30"
                                            : "bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-lg transition-all",
                                        milestone.isCompleted
                                            ? "bg-amber-500 shadow-amber-500/30"
                                            : "bg-indigo-500 shadow-indigo-500/30"
                                    )}>
                                        {milestone.isCompleted ? (
                                            <CheckSquare className="w-6 h-6" />
                                        ) : (
                                            <span>W{milestone.weekNumber}</span>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "md:hidden font-bold text-lg",
                                        milestone.isCompleted ? "text-amber-700 dark:text-amber-300 line-through" : "text-indigo-900 dark:text-indigo-300"
                                    )}>
                                        Week {milestone.weekNumber}
                                    </div>
                                    <div className="hidden md:block mt-2">
                                        {milestone.isCompleted ? (
                                            <CheckSquare className="w-4 h-4 text-amber-500" />
                                        ) : (
                                            <Square className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                                        )}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5 md:p-6 sm:p-8 flex-1 space-y-5">
                                    <div>
                                        <h4 className={cn(
                                            "font-bold text-xl text-foreground mb-1 transition-colors",
                                            milestone.isCompleted
                                                ? "line-through text-muted-foreground"
                                                : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                        )}>
                                            {milestone.title}
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                                        {milestone.isCompleted && milestone.completedAt && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                                                ✓ Completed {new Date(milestone.completedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    {!milestone.isCompleted && (
                                        <>
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Action Items</p>
                                                <div className="grid gap-2">
                                                    {actionTasks.map((task: string, i: number) => (
                                                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 text-sm hover:bg-muted transition-colors">
                                                            <div className="mt-0.5 shrink-0">
                                                                <div className="w-4 h-4 rounded-full border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            </div>
                                                            <span className="text-foreground/90 font-medium">{task}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {(metrics.length > 0 || resources.length > 0) && (
                                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50 mt-6">
                                                    {metrics.length > 0 && (
                                                        <div className="flex-1 bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs font-bold uppercase text-green-700 dark:text-green-400 mb-1">Success Metric</p>
                                                                <p className="text-sm font-medium text-green-800 dark:text-green-300">{metrics[0]}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {resources.length > 0 && (
                                                        <div className="flex-1 bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl flex items-start gap-2">
                                                            <LinkIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                            <div className="w-full">
                                                                <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-1">Resources</p>
                                                                <div className="flex flex-wrap gap-1.5 mt-1.5 w-full">
                                                                    {resources.map((res: string, i: number) => (
                                                                        <Badge key={i} variant="outline" className="bg-background text-[10px] text-blue-600 dark:text-blue-400 border-blue-500/30 whitespace-nowrap">{res}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

