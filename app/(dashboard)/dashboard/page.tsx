"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Flame, Zap, Trophy, Github, Users, Plus, ArrowUpRight, TrendingUp } from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import TaskForm from '@/components/tasks/task-form'
import ChallengeForm from '@/components/challenges/challenge-form'
import { ActiveBlueprintsWidget } from '@/components/dashboard/ActiveBlueprintsWidget'
import { LifeArchitectOverview } from '@/components/dashboard/LifeArchitectOverview'
import { Lock, Settings2 } from 'lucide-react'
import { getDashboardSummary } from '@/lib/utils/api'

const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChallengeOpen, setIsChallengeOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const result = await getDashboardSummary();
                setData(result);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                <UflLoaderInline style="flip" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing your life architecture...</p>
            </div>
        );
    }

    const stats = data?.stats || {
        habitScore: { value: "0%", change: "N/A" },
        streak: { value: 0, label: "days" },
        energy: { value: 80, label: "/ 100" },
        commits: { value: 0, label: "This week" }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                            UFL Session Active • <span className="text-indigo-500">
                                {data?.activeChallenge
                                    ? `${data.activeChallenge.focus} Challenge: Day ${data.activeChallenge.currentDay} of ${data.activeChallenge.durationDays}`
                                    : `No Active Challenge`}
                            </span>
                        </p>
                    </div>
                </div>
                <Popover open={isChallengeOpen} onOpenChange={setIsChallengeOpen}>
                    <PopoverTrigger asChild>
                        <Button className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all gap-2">
                            <Plus size={18} />
                            Start a Challenge
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[min(450px,95vw)] p-8 border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-zinc-950 max-h-[90vh] overflow-y-auto custom-scrollbar" align="end">
                        <ChallengeForm onSuccess={() => setIsChallengeOpen(false)} />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Life Architect Section (New Features) */}
            {data?.lifeArchitect && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <LifeArchitectOverview data={data.lifeArchitect} />
                </motion.div>
            )}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Habit Score", value: stats.habitScore.value, sub: stats.habitScore.change, icon: Trophy, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { label: "Daily Streak", value: stats.streak.value, sub: "Consecutive Days", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Avg Energy", value: stats.energy.value, sub: "/ 100 Flow", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                    { label: "Code Output", value: stats.commits.value, sub: "Units Produced", icon: Github, color: "text-slate-900 dark:text-white", bg: "bg-slate-500/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 font-mono">{stat.label}</h3>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</span>
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                                <TrendingUp size={10} />
                                {stat.sub}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Blueprints Section */}
            <div className="grid grid-cols-1 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <ActiveBlueprintsWidget />
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Coding Activity */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 overflow-hidden"
                >
                    {data?.keys && !data.keys.coding && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-sm text-center">
                                <Lock className="h-8 w-8 text-indigo-500 mb-3" />
                                <h4 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-2">Coding Locked</h4>
                                <p className="text-[10px] text-slate-500 font-medium mb-4 uppercase tracking-widest">WakaTime / GitHub Integration Required</p>
                                <Button onClick={() => window.location.href='/settings'} className="rounded-xl w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Settings2 size={14}/> Integrate Now</Button>
                            </div>
                        </div>
                    )}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Engineering Velocity</h3>
                            <p className="text-xs text-slate-500 font-medium">Daily Git Commits & Project Time</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border border-slate-100 dark:border-zinc-800">
                            <Activity className="h-5 w-5 text-indigo-500" />
                        </div>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.githubActivityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#09090b', color: '#fff' }}
                                />
                                <Bar dataKey="commits" name="Commits" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="freelance" name="Freelance" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Bio-Rhythms (Energy vs Gym) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bio-Rhythm Feedback</h3>
                            <p className="text-xs text-slate-500 font-medium">Daily Energy Resonance & Workout Load</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border border-slate-100 dark:border-zinc-800">
                            <TrendingUp className="h-5 w-5 text-yellow-500" />
                        </div>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.energyGymData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#09090b', color: '#fff' }} />
                                <Area type="monotone" dataKey="energy" name="Energy" stroke="#eab308" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" />
                                <Area type="monotone" dataKey="workoutIntensity" name="Intensity" stroke="#ef4444" strokeWidth={4} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Social Proof & Connections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="relative rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 lg:col-span-2 overflow-hidden"
                >
                    {data?.keys && !data.keys.social && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-sm text-center">
                                <Lock className="h-8 w-8 text-indigo-500 mb-3" />
                                <h4 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-2">Social Locked</h4>
                                <p className="text-[10px] text-slate-500 font-medium mb-4 uppercase tracking-widest">LinkedIn / Twitter Integration Required</p>
                                <Button onClick={() => window.location.href='/settings'} className="rounded-xl w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"><Settings2 size={14}/> Integrate Now</Button>
                            </div>
                        </div>
                    )}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Authority Building</h3>
                            <p className="text-xs text-slate-500 font-medium">LinkedIn/Twitter Outreach & Content Sync</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border border-slate-100 dark:border-zinc-800">
                            <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.networkingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#09090b', color: '#fff' }} />
                                <Line type="monotone" dataKey="connections" name="Connections" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                                <Line type="monotone" dataKey="posts" name="Posts" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    )
}

export default Dashboard