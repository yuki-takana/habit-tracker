"use client";

import { useEffect, useState } from "react";
import { Sparkles, Target, Calendar, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = async () => {
        try {
            const res = await fetch("/api/challenges");
            if (res.ok) {
                const data = await res.json();
                setChallenges(data);
            }
        } catch (error) {
            console.error("Failed to fetch challenges:", error);
            toast.error("Failed to load challenges");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        toast("Delete this challenge?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await fetch(`/api/challenges/${id}`, {
                            method: "DELETE",
                        });
                        if (res.ok) {
                            toast.success("Challenge deleted");
                            fetchChallenges();
                        } else {
                            toast.error("Failed to delete challenge");
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error("Something went wrong");
                    }
                }
            },
            cancel: { label: "Cancel", onClick: () => {} }
        });
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="text-indigo-500" size={18} />
                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">Growth Journey</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Active Challenges</h1>
                    <p className="text-slate-500 text-lg mt-1">Track your commitment and transformation.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <UflLoaderInline style="flip" />
                    <p className="text-slate-500 font-medium text-lg">Loading your journey...</p>
                </div>
            ) : challenges.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {challenges.map((challenge) => (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 flex gap-2">
                                    <button
                                        onClick={() => handleDelete(challenge.id)}
                                        className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${challenge.status === 'active'
                                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                }`}>
                                                {challenge.status === 'active' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                                {challenge.status}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{challenge.focus}</span>
                                        </div>

                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter group-hover:text-indigo-500 transition-colors">
                                            {challenge.title}
                                        </h2>

                                        <p className="text-slate-500 text-lg mb-8 max-w-2xl leading-relaxed">
                                            {challenge.description || "No description provided for this challenge."}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                                                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                                                    <Calendar size={16} className="text-indigo-500" />
                                                    {challenge.durationDays} Days
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Start Date</span>
                                                <div className="font-black text-slate-900 dark:text-white">
                                                    {format(new Date(challenge.startDate), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">End Date</span>
                                                <div className="font-black text-slate-900 dark:text-white">
                                                    {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Auto-Sync</span>
                                                <div className={`font-black uppercase text-[12px] flex items-center gap-1.5 ${challenge.autoCreateTodos ? 'text-indigo-500' : 'text-slate-300'}`}>
                                                    {challenge.autoCreateTodos ? <Sparkles size={14} /> : <AlertCircle size={14} />}
                                                    {challenge.autoCreateTodos ? 'Enabled' : 'Disabled'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-48 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800">
                                        <div className="relative h-32 w-32 flex items-center justify-center">
                                            <svg className="h-full w-full rotate-[-90deg]">
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="58"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="10"
                                                    className="text-slate-200 dark:text-zinc-800"
                                                />
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="58"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="10"
                                                    strokeDasharray={364.4}
                                                    strokeDashoffset={364.4 - (364.4 * Math.min(100, (differenceInDays(new Date(), new Date(challenge.startDate)) / challenge.durationDays) * 100)) / 100}
                                                    strokeLinecap="round"
                                                    className="text-indigo-500 transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {Math.max(1, differenceInDays(new Date(), new Date(challenge.startDate)) + 1)}
                                                </span>
                                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Day</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {Math.round(Math.min(100, (differenceInDays(new Date(), new Date(challenge.startDate)) / challenge.durationDays) * 100))}% Done
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/10">
                    <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-900 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/5">
                        <Target className="text-indigo-500" size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No active challenges</h3>
                    <p className="text-slate-500 text-center max-w-sm mb-10 text-lg">
                        Big goals require big commitments. Start your first challenge from the dashboard today.
                    </p>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-10 py-6 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.98]"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
}
