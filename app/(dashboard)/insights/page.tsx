"use client";

import { useEffect, useState } from "react";
import { Brain, TrendingUp, Target, AlertCircle, Sparkles } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getInsightsData } from "@/app/actions/insights";

const COLORS = ['#6366f1', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export default function InsightsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const insights = await getInsightsData();
                setData(insights);
            } catch (error) {
                console.error("Failed to load insights:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <UflLoaderInline style="flip" text="Analyzing your progress..." />
            </div>
        );
    }

    const { focusData, timelineData, boomingArea, isPro } = data || {
        focusData: [],
        timelineData: [],
        boomingArea: "Growth",
        isPro: false
    };

    return (
        <div className={`relative max-w-6xl mx-auto pb-20 px-6 sm:px-0`}>
            {!isPro && (
                <div className="absolute inset-0 z-20 pt-20 flex items-start justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-lg rounded-lg">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-10 flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-md text-center mx-4">
                        <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Sparkles className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h4 className="text-2xl font-black tracking-tighter dark:text-white uppercase mb-3 text-transparent bg-clip-text bg-linear-to-br from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">Pro Insights Locked</h4>
                        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">Deep-dive AI analysis, efficiency tracking, and focus distribution are exclusively available to Habit Architect Pro members.</p>
                        <button onClick={() => window.location.href='/billing'} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 uppercase text-xs">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-indigo-500" size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">AI Analysis</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Growth Insights</h1>
                    <p className="text-slate-500 text-lg mt-1">Deep analysis of your current progress.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    Booming: {boomingArea}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Priority Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none pb-24 xl:pb-16">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="text-indigo-500" />
                                Focus Distribution
                            </CardTitle>
                            <CardDescription>Where your energy spent recently.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-75 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={focusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        paddingAngle={8}
                                        dataKey="value"
                                        cornerRadius={8}
                                    >
                                        {focusData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center flex-wrap gap-6 mt-4">
                                {focusData.map((entry: any, index: number) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" />
                                Efficiency Tracker
                            </CardTitle>
                            <CardDescription>Productivity score based on completions.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Critical Recommendations */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
                        <Target className="mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Next Target</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                            Your "{boomingArea}" area is currently leading. Focus on maintainig this momentum while balancing other categories.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all text-sm">
                            Optimize Schedule
                        </button>
                    </div>

                    <Card className="rounded-[2rem] border-rose-100 dark:border-rose-900/20 bg-rose-50/30 dark:bg-rose-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-rose-900 dark:text-rose-100 mb-1">Activity Alert</h4>
                                    <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">
                                        Ensure all your GitHub and WakaTime keys are set in settings to include them in the analysis.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
