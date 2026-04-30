"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Coffee,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { toast } from "sonner";
import Link from "next/link";

interface TodoSession {
    id: string;
    status: "PENDING" | "RUNNING" | "PAUSED" | "COMPLETED";
    targetDuration: number;
    breakDuration: number;
    order: number;
    startedAt?: string;
    duration?: number;
}

interface TodoData {
    id: string;
    task: string;
    category: string;
    plannedTime: number;
    completed: boolean;
    sessions: TodoSession[];
}

export default function TodoSessionsPage() {
    const params = useParams();
    const router = useRouter();
    const todoId = params.id as string;

    const [todo, setTodo] = useState<TodoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<TodoSession | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [onBreak, setOnBreak] = useState(false);

    const fetchTodo = useCallback(async () => {
        try {
            const res = await fetch(`/api/todos/${todoId}/sessions`);
            if (res.ok) {
                const data = await res.json();
                setTodo(data);

                // Find current active or next pending session
                const current = data.sessions.find((s: TodoSession) =>
                    s.status === "RUNNING" || s.status === "PAUSED"
                ) || data.sessions.find((s: TodoSession) => s.status === "PENDING" && s.order === 0)
                    || data.sessions.find((s: TodoSession) => s.status === "PENDING");

                setActiveSession(current || null);

                if (current) {
                    if (current.status === "RUNNING") {
                        setIsPaused(false);
                    }
                    setSecondsLeft(current.targetDuration * 60);
                }
            }
        } catch (error) {
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    }, [todoId]);

    useEffect(() => {
        fetchTodo();
    }, [fetchTodo]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!isPaused && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0 && activeSession && !isPaused) {
            handleCompleteSession();
        }

        return () => clearInterval(interval);
    }, [isPaused, secondsLeft, activeSession]);

    const handleStartSession = async () => {
        if (!activeSession) return;

        try {
            const res = await fetch(`/api/todos/${todoId}/sessions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    action: "START"
                })
            });

            if (res.ok) {
                setIsPaused(false);
                setActiveSession({ ...activeSession, status: "RUNNING" });
                toast.success("Session started! Focus mode on.");
            }
        } catch (error) {
            toast.error("Failed to start session");
        }
    };

    const handlePauseSession = async () => {
        if (!activeSession) return;

        try {
            const res = await fetch(`/api/todos/${todoId}/sessions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    action: "PAUSE"
                })
            });

            if (res.ok) {
                setIsPaused(true);
                setActiveSession({ ...activeSession, status: "PAUSED" });
            }
        } catch (error) {
            toast.error("Failed to pause session");
        }
    };

    const handleResumeSession = async () => {
        if (!activeSession) return;

        try {
            const res = await fetch(`/api/todos/${todoId}/sessions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    action: "RESUME"
                })
            });

            if (res.ok) {
                setIsPaused(false);
                setActiveSession({ ...activeSession, status: "RUNNING" });
            }
        } catch (error) {
            toast.error("Failed to resume session");
        }
    };

    const handleCompleteSession = async () => {
        if (!activeSession) return;

        try {
            const res = await fetch(`/api/todos/${todoId}/sessions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: activeSession.id,
                    action: "COMPLETE"
                })
            });

            if (res.ok) {
                toast.success("Session completed! Great job.");

                if (activeSession.breakDuration > 0) {
                    setOnBreak(true);
                    setSecondsLeft(activeSession.breakDuration * 60);
                    setIsPaused(false);
                } else {
                    fetchTodo();
                }
            }
        } catch (error) {
            toast.error("Failed to complete session");
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <UflLoaderInline style="pulse-dots" />
                <p className="text-slate-500 font-medium">Preparing your focus room...</p>
            </div>
        );
    }

    if (!todo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle size={48} className="text-red-500" />
                <p className="text-slate-900 dark:text-white font-bold text-xl">Todo not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link
                href="/todos"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Focus</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Timer Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                            {onBreak ? "Break Time" : activeSession ? `Session ${activeSession.order + 1}` : "Completed"}
                        </span>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            {todo.task}
                        </h1>
                        <p className="text-slate-500 mb-12 font-medium">{todo.category}</p>

                        <div className="relative inline-flex items-center justify-center mb-12">
                            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-slate-100 dark:text-zinc-800"
                                />
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray="100 100"
                                    strokeLinecap="round"
                                    className="text-indigo-600 dark:text-indigo-500"
                                    initial={{ pathLength: 1 }}
                                    animate={{ pathLength: activeSession ? secondsLeft / (activeSession.targetDuration * 60) : 0 }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                                    {formatTime(secondsLeft)}
                                </span>
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                                    {onBreak ? "Relax & Recharge" : "Time to Focus"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            {!activeSession && !onBreak ? (
                                <div className="flex flex-col items-center gap-4">
                                    <CheckCircle2 size={64} className="text-green-500" />
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">All sessions completed!</p>
                                    <Button onClick={() => router.push('/todos')} className="bg-indigo-600">Back to List</Button>
                                </div>
                            ) : (
                                <>
                                    {isPaused ? (
                                        <button
                                            onClick={activeSession?.status === "PENDING" ? handleStartSession : handleResumeSession}
                                            className="h-20 w-20 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40 active:scale-95 group"
                                        >
                                            <Play size={32} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePauseSession}
                                            className="h-20 w-20 rounded-full bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-lg active:scale-95 group"
                                        >
                                            <Pause size={32} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setSecondsLeft(onBreak ? 0 : (activeSession?.targetDuration || 0) * 60)}
                                        className="h-14 w-14 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95 group"
                                    >
                                        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Clock className="text-indigo-500" size={20} />
                            Session Plan
                        </h2>

                        <div className="space-y-4">
                            {todo.sessions.map((session, index) => (
                                <div
                                    key={session.id}
                                    className={`relative p-4 rounded-2xl border transition-all ${activeSession?.id === session.id
                                            ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30 ring-2 ring-indigo-500/10"
                                            : session.status === "COMPLETED"
                                                ? "bg-slate-50/50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800"
                                                : "bg-white dark:bg-zinc-950 border-slate-100 dark:border-zinc-900"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold ${session.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-600"
                                                    : activeSession?.id === session.id
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                                                }`}>
                                                {session.status === "COMPLETED" ? <CheckCircle2 size={16} /> : index + 1}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${session.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                                                    }`}>
                                                    {session.targetDuration} min Work
                                                </p>
                                                {session.breakDuration > 0 && (
                                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                        <Coffee size={10} /> {session.breakDuration} min break after
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {activeSession?.id === session.id && (
                                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Planned</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {todo.plannedTime || 0} <span className="text-sm font-bold text-slate-400">minutes</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
