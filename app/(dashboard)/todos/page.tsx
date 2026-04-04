"use client";

import { AddTodoModal } from "@/features/todos/add-todo-modal";
import {
    Plus, ClipboardList, Smartphone, Loader2,
    Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { AiGoalAssistant } from "@/features/ai-goals/ai-goal-assistant";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toggleWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TodoItem } from "@/features/todos/todo-item";
import UFLProgressCard from "@/features/analytics/shareable-card";

const EMOJI_POOL = ["🌱", "🌿", "🌷", "🌻", "🌳", "🌲", "🌼", "🍀"];

function getTreeEmojiString(category: string, index: number) {
    let str = category + "_" + index;
    let hash = 0;
    for (let j = 0; j < str.length; j++) hash = Math.imul(31, hash) + str.charCodeAt(j) | 0;
    const idSeed = Math.abs(hash);
    return EMOJI_POOL[idSeed % EMOJI_POOL.length];
}

// ─── Forest Tree Card ─────────────────────────────────────────────────────────

function TreeMini({
    category,
    index,
    treeTaskCount,
    activeTree,
    setActiveTree,
}: any) {
    const ref = useRef<HTMLDivElement>(null);
    const emoji = getTreeEmojiString(category, index);
    const scale = 0.6 + treeTaskCount * 0.4; // 0 to 5 -> 0.6 to 2.6

    const handleOpen = () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setActiveTree({
            category,
            index,
            treeTaskCount,
            emoji,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    return (
        <div
            ref={ref}
            onMouseEnter={handleOpen}
            onMouseLeave={() => setActiveTree(null)}
            onClick={handleOpen}
            className="relative flex flex-col items-center justify-center cursor-pointer group h-24 w-20"
        >
            <div 
                className={cn(
                    "relative flex items-center justify-center transition-all duration-300 drop-shadow-lg",
                    activeTree?.category === category && activeTree?.index === index
                        ? "scale-140 z-10"
                        : "group-hover:scale-125"
                )}
            >
                <div 
                    className="text-4xl transition-all duration-300"
                    style={{ transform: `scale(${scale})` }}
                >
                    {emoji}
                </div>
            </div>

            <p className="text-[10px] mt-8 text-zinc-400 font-bold uppercase tracking-wide">
                {category}
            </p>
        </div>
    );
}

function TreeTooltip({ data }: any) {
    const { category, index, treeTaskCount, emoji, x, y } = data;

    return (
        <div
            className="fixed z-50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md
                       bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800
                       animate-in fade-in zoom-in-95 pointer-events-none"
            style={{
                left: x,
                top: y - 10,
                transform: "translate(-50%, -100%)",
            }}
        >
            <p className="text-sm font-extrabold uppercase tracking-wide text-center text-emerald-500">
                {category} {index > 0 ? `Tree ${index + 1}` : ''}
            </p>

            <p className="text-xs text-zinc-500 text-center font-semibold mt-1">
                {treeTaskCount === 5 ? "Fully Grown" : "Growing"}
            </p>

            <div className="mt-2 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                    {emoji} {treeTaskCount} / 5
                </p>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                    tasks completed
                </p>
            </div>
        </div>
    );
}
// ─── Forest View ──────────────────────────────────────────────────────────────

interface ForestProps {
    tasks: any[];
}

function ForestView({ tasks }: { tasks: any[] }) {
    const [activeTree, setActiveTree] = useState<any>(null);

    const categories = useMemo(() => {
        const map: Record<string, {
            total: number;
            completed: number;
            xp: number;
        }> = {};

        tasks.forEach((t) => {
            const cat = (t.category || "general").toLowerCase();

            if (!map[cat]) {
                map[cat] = { total: 0, completed: 0, xp: 0 };
            }

            map[cat].total++;

            if (t.completed) {
                map[cat].completed++;
            }
            map[cat].xp += t.earnedXp || 0;
        });
        return Object.entries(map);
    }, [tasks]);

    if (!categories.length) return null;

    return (
        <div className="mb-12 relative ">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6 px-1">
                <p className="text-[10px] font-extrabold tracking-[.2em] uppercase text-zinc-400">
                    Your Forest
                </p>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-xs text-zinc-400">{categories.length}</span>
            </div>

            <Card>
                <div className="relative flex flex-wrap justify-center py-10 gap-x-6 gap-y-12">
                    {categories.map(([cat, counts]) => {
                        const numTrees = Math.max(1, Math.ceil(counts.completed / 5));
                        const elements = [];

                        for (let i = 0; i < numTrees; i++) {
                            const treeTaskCount = (i === numTrees - 1 && counts.completed > 0 && counts.completed % 5 !== 0) 
                                ? (counts.completed % 5) 
                                : (counts.completed === 0 ? 0 : 5);
                                
                            elements.push(
                                <TreeMini
                                    key={`${cat}-${i}`}
                                    category={cat}
                                    index={i}
                                    treeTaskCount={treeTaskCount}
                                    activeTree={activeTree}
                                    setActiveTree={setActiveTree}
                                />
                            );
                        }

                        return (
                            <div key={cat} className="flex gap-4 items-center">
                                {elements}
                            </div>
                        );
                    })}
                </div>
            </Card>
            {/* Tooltip */}
            {activeTree && (
                <TreeTooltip data={activeTree} />
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TodosPage() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [visibleCounts, setVisibleCounts] = useState({ today: 10, timeUp: 10, completed: 10 });
    const [stats, setStats] = useState<any>({
        total: 0,
        completed: 0,
        today: 0,
        timeUps: 0,
    });
    const [pagination, setPagination] = useState<any>({
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [grouped, setGrouped] = useState<any>({
        today: [],
        timeUp: [],
        completed: [],
    });

    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            setIsWhatsappEnabled(session.user.whatsappEnabled || false);
        }
    }, [session]);

    const handleToggleComplete = useCallback((id: string, completed: boolean) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t));
    }, []);

    const handleToggleWhatsapp = async () => {
        setToggleLoading(true);
        try {
            const next = !isWhatsappEnabled;
            await toggleWhatsapp(next);
            setIsWhatsappEnabled(next);
            toast.success(next ? "WhatsApp reminders enabled!" : "WhatsApp reminders disabled.");
        } catch { toast.error("Failed to update WhatsApp settings."); }
        finally { setToggleLoading(false); }
    };

    const fetchTasks = async (page = 1) => {
        try {
            const res = await fetch(`/api/todos?page=${page}&limit=10`);

            if (res.ok) {
                const result = await res.json();

                setTasks(result.data);
                setStats(result.stats);
                setPagination(result.pagination);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    const fetchGroupedTasks = async () => {
        try {
            const res = await fetch(`/api/todos/dashboard`);

            if (res.ok) {
                const result = await res.json();
                setGrouped(result.grouped);
                setStats(result.stats);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchGroupedTasks();
    }, []);


    const handleLoadMore = (cat: "today" | "timeUp" | "completed") =>
        setVisibleCounts((p) => ({ ...p, [cat]: p[cat] + 10 }));

    function renderSection(
        title: string,
        icon: React.ReactNode,
        list: any[],
        cat: "today" | "timeUp" | "completed"
    ) {
        if (!list.length) return null;
        const visible = list.slice(0, visibleCounts[cat]);
        const hasMore = list.length > visibleCounts[cat];
        const accentMap = { today: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10", timeUp: "text-red-500 bg-red-50 dark:bg-red-500/10", completed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" };
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className={cn("p-2 rounded-xl", accentMap[cat])}>
                        {icon}
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-zinc-800 dark:text-zinc-100">
                        {title}
                    </h2>
                    <span className="text-xs font-extrabold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {list.length}
                    </span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="flex flex-col gap-3">
                    {visible.map((task) => (
                        <TodoItem
                            key={task.id}
                            id={task.id}
                            task={task.task}
                            startTime={task.startTime}
                            reminderTime={task.reminderTime ? new Date(task.reminderTime) : new Date()}
                            category={task.category || "General"}
                            status={task.status}
                            completed={task.completed}
                            onToggleComplete={handleToggleComplete}
                        />
                    ))}
                </div>
                {hasMore && (
                    <button
                        onClick={() => handleLoadMore(cat)}
                        className="mt-4 w-full py-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-extrabold tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all active:scale-[0.99]"
                    >
                        Load More
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <style>{`
        @keyframes header-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .page-header { animation: header-in .45s ease forwards; }
      `}</style>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pt-10">
                    <div>
                        <p className="text-[9px] font-extrabold tracking-[.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                            Daily Focus
                        </p>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none mb-1">
                            Build habits.<br />
                            <span className="text-indigo-600 dark:text-indigo-400">Watch them grow.</span>
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-2">
                            Synchronize your reality with your intentions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleToggleWhatsapp}
                            disabled={toggleLoading}
                            className={cn(
                                "h-11 w-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm",
                                isWhatsappEnabled
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            {toggleLoading ? <Loader2 size={20} className="animate-spin" /> : <Smartphone size={20} />}
                        </button>

                        <UFLProgressCard />

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-11 px-5 rounded-2xl bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm font-extrabold tracking-wide"
                        >
                            <Plus size={18} />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* ── Forest ──────────────────────────────────────────────── */}
                {!loading && tasks.length > 0 && <ForestView tasks={tasks} />}

                {/* ── Todo sections ───────────────────────────────────────── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                        </div>
                        <p className="text-xs font-extrabold tracking-[.2em] uppercase text-zinc-400 animate-pulse">
                            Syncing consciousness...
                        </p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div>
                        {renderSection("Time Up", <AlertCircle size={18} />, grouped.timeUp, "timeUp")}
                        {renderSection("Today's Missions", <Clock size={18} />, grouped.today, "today")}
                        {renderSection("Completed", <CheckCircle2 size={18} />, grouped.completed, "completed")}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-8 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                        <div className="w-20 h-20 rounded-[1.8rem] bg-white dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                            <ClipboardList className="text-indigo-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                            Empty Workspace
                        </h3>
                        <p className="text-zinc-400 text-center max-w-xs mb-8 text-sm font-medium leading-relaxed">
                            The future is unwritten. Define your next victory and start the countdown.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-extrabold tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.97] text-sm"
                        >
                            Create First Task
                        </button>
                    </div>
                )}

                {/* Modals */}
                <AddTodoModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); fetchTasks(); }}
                />
                <AiGoalAssistant
                    isOpen={isAiModalOpen}
                    onClose={() => { setIsAiModalOpen(false); fetchTasks(); }}
                />
            </div>
        </>
    );
}