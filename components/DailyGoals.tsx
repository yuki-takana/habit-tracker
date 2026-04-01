"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Target, 
    Clock, 
    CheckCircle2, 
    Circle, 
    TrendingUp, 
    Zap, 
    Brain,
    Sunrise,
    Sun,
    Moon,
    Sparkles,
    Layout
} from "lucide-react";
import { toast } from "sonner";

interface DailyGoalsProps {
    onGenerate?: () => void;
}

export default function DailyGoalsArchitect({ onGenerate }: DailyGoalsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wakeUpTime, setWakeUpTime] = useState("06:30");
    const [todayGoals, setTodayGoals] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchTodayGoals();
    }, []);

    const fetchTodayGoals = async () => {
        try {
            const response = await fetch("/api/daily-goals");
            const data = await response.json();
            
            if (data.success) {
                setTodayGoals(data.data);
                setStats(data.data.stats);
                if (data.data.wakeUpTime) {
                    setWakeUpTime(data.data.wakeUpTime);
                }
            } else if (data.wakeUpTime) {
                // If no goals generated yet, but we got the saved wake-up time
                setWakeUpTime(data.wakeUpTime);
            }
        } catch (err) {
            console.error("Error fetching today's goals:", err);
        }
    };

    const generateDailyGoals = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/daily-goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wakeUpTime })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Daily goals architected successfully!");
                await fetchTodayGoals();
                onGenerate?.();
            } else {
                setError(data.message || "Failed to generate daily goals");
                toast.error(data.message || "Failed to generate daily goals");
            }
        } catch (err) {
            setError("An error occurred while generating goals");
            toast.error("An error occurred while generating goals");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 0: return "destructive";
            case 1: return "default";
            case 2: return "secondary";
            case 3: return "outline";
            default: return "outline";
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Header Card */}
            <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm dark:bg-indigo-500/10">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        Goal Architect
                                    </CardTitle>
                                    <CardDescription>
                                        AI-powered high-performance scheduling
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border backdrop-blur-sm">
                                <div className="flex flex-col px-2">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                                        Wake Time
                                    </label>
                                    <input
                                        type="time"
                                        value={wakeUpTime}
                                        onChange={(e) => setWakeUpTime(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 w-20"
                                    />
                                </div>
                                </div>
                                <div className="flex flex-col gap-1 items-stretch">
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                const res = await fetch("/api/daily-goals/preference", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ wakeUpTime })
                                                });
                                                if (res.ok) toast.success("Schedule preference saved!");
                                                else toast.error("Failed to save preference");
                                            } catch (err) {
                                                toast.error("Error saving preference");
                                            }
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] uppercase font-bold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
                                    >
                                        Save Plan
                                    </Button>
                                    <Button 
                                        onClick={generateDailyGoals} 
                                        disabled={loading}
                                        className="rounded-xl shadow-md hover:shadow-lg transition-all h-9"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Architecting...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs">
                                                <Zap className="h-3 w-3 fill-white" />
                                                Generate
                                            </div>
                                        )}
                                    </Button>
                                </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {error && (
                <motion.div variants={itemVariants}>
                    <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {todayGoals ? (
                    <motion.div 
                        key="goals-present"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-8"
                    >
                        {/* Daily Summary */}
                        <motion.div variants={itemVariants}>
                            <Card className="border-none bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-purple-500/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <Brain className="h-5 w-5" />
                                        Today's Strategy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-medium leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                                        "{todayGoals.dailySummary}"
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Stats Overview */}
                        {stats && (
                            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Tasks", value: stats.totalScheduled, icon: Layout, color: "text-blue-500" },
                                    { label: "Done", value: stats.completed, icon: CheckCircle2, color: "text-green-500" },
                                    { label: "Pending", value: stats.pending, icon: Clock, color: "text-orange-500" },
                                    { label: "Velocity", value: stats.completionRate, icon: TrendingUp, color: "text-purple-500" }
                                ].map((stat, i) => (
                                    <Card key={i} className="border-none bg-muted/40 hover:bg-muted/60 transition-colors">
                                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                            <stat.icon className={`h-4 w-4 mb-2 ${stat.color}`} />
                                            <div className="text-2xl font-black">{stat.value}</div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Schedule Timeline */}
                            <div className="lg:col-span-2 space-y-8">
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                        <Clock className="h-5 w-5 text-indigo-500" />
                                        Optimal Schedule
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {[
                                            { title: "Morning", icon: Sunrise, data: todayGoals.schedule.morning, color: "from-orange-500/20 to-yellow-500/20" },
                                            { title: "Afternoon", icon: Sun, data: todayGoals.schedule.afternoon, color: "from-blue-500/20 to-indigo-500/20" },
                                            { title: "Evening", icon: Moon, data: todayGoals.schedule.evening, color: "from-purple-500/20 to-slate-500/20" }
                                        ].map((block, i) => (
                                            <Card key={i} className="border-none bg-muted/30 p-1">
                                                <CardHeader className={`rounded-xl bg-linear-to-r ${block.color} py-3 px-4 mb-2`}>
                                                    <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                                        <block.icon className="h-4 w-4" />
                                                        {block.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4 pt-2">
                                                    {block.data.map((item: any, idx: number) => (
                                                        <div key={idx} className="relative pl-6 border-l-2 border-muted-foreground/10 group">
                                                            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-muted-foreground/30 group-hover:bg-indigo-500 transition-colors" />
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{item.task}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.duration} minutes</p>
                                                                </div>
                                                                <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                                    {item.time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Scheduled Tasks Section */}
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                        Today's Battle Plan
                                    </h3>
                                    <div className="space-y-3">
                                        {todayGoals.todos.map((todo: any) => (
                                            <Card key={todo.id} className="border-none bg-muted/20 hover:bg-muted/40 transition-all border-l-4 border-l-indigo-500">
                                                <CardContent className=" flex items-center gap-4">
                                                    <div className="shrink-0">
                                                        {todo.completed ? (
                                                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                                                <CheckCircle2 className="h-4 w-4 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full border-2 border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                                                                <div className="h-2 w-2 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/50 transition-all" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className={`font-bold ${todo.completed ? 'line-through text-muted-foreground opacity-50' : 'text-zinc-800 dark:text-zinc-100'}`}>
                                                                {todo.task}
                                                            </h4>
                                                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter">
                                                                {todo.category}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {todo.plannedTime}m
                                                            </span>
                                                            {todo.reminderTime && (
                                                                <span>
                                                                    {new Date(todo.reminderTime).toLocaleTimeString('en-US', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column: Insights & Metrics */}
                            <div className="space-y-8">
                                <motion.div variants={itemVariants}>
                                    <Card className="border-none bg-indigo-500/5 dark:bg-indigo-500/10">
                                        <CardHeader>
                                            <CardTitle className="text-base">Intelligence Insights</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mb-2">Streak Status</h4>
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {todayGoals.insights.streakStatus}
                                                </p>
                                            </div>
                                            
                                            <Separator className="bg-indigo-500/10" />
                                            
                                            <div>
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mb-3">Core Priorities</h4>
                                                <div className="space-y-3">
                                                    {todayGoals.insights.topPriorities.map((priority: string, idx: number) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="h-5 w-5 rounded bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                                                <TrendingUp className="h-3 w-3 text-indigo-500" />
                                                            </div>
                                                            <p className="text-xs font-semibold">{priority}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {todayGoals.insights.gapsIdentified.length > 0 && (
                                                <>
                                                    <Separator className="bg-indigo-500/10" />
                                                    <div>
                                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-orange-500 mb-3">Critical Gaps</h4>
                                                        <div className="space-y-2">
                                                            {todayGoals.insights.gapsIdentified.map((gap: string, idx: number) => (
                                                                <p key={idx} className="text-xs font-medium text-muted-foreground pl-3 border-l-2 border-orange-500/30 italic">
                                                                    "{gap}"
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Card className="border-none bg-green-500/5 dark:bg-green-500/10">
                                        <CardHeader>
                                            <CardTitle className="text-base text-green-600 dark:text-green-400">Success Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-green-500 mb-2">Today's Target</h4>
                                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-xs font-bold text-green-600 dark:text-green-400">
                                                    {todayGoals.successMetrics.targetTodoCompletion}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-green-500 mb-3">Mission Checklist</h4>
                                                <div className="space-y-2">
                                                    {todayGoals.successMetrics.keyWins.map((win: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                            <p className="text-xs font-semibold">{win}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {todayGoals.successMetrics.stretchGoals.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-3">Stretch Missions</h4>
                                                    <div className="space-y-2">
                                                        {todayGoals.successMetrics.stretchGoals.map((goal: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-2">
                                                                <Sparkles className="h-3 w-3 text-amber-500" />
                                                                <p className="text-xs font-semibold">{goal}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ) : !loading && (
                    <motion.div 
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12"
                    >
                        <Card className="border-dashed border-2 bg-muted/30">
                            <CardContent className="pt-12 pb-12 text-center max-w-md mx-auto">
                                <div className="p-4 bg-indigo-500/10 rounded-3xl w-fit mx-auto mb-6 text-indigo-500">
                                    <Target className="h-12 w-12" />
                                </div>
                                <h3 className="text-2xl font-black mb-3">Ready for Architecting?</h3>
                                <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                                    I'll analyze your streaks, habits, and active challenges to design 
                                    an optimal high-performance schedule for you today.
                                </p>
                                <Button 
                                    onClick={generateDailyGoals} 
                                    className="px-8 py-6 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-transform active:scale-95"
                                >
                                    <Zap className="h-5 w-5 mr-3 fill-white" />
                                    Launch Goal Architect
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}