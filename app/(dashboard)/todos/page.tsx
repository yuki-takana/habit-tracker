"use client";

import { AddTodoModal } from "@/features/todos/add-todo-modal";
import {
    Plus, ClipboardList, Smartphone, Loader2,
    Clock, CheckCircle2, AlertCircle, Sunrise, Sun, Moon, 
    Briefcase, Dumbbell, Heart, BookOpen, Star, Target, TrendingUp, ChevronDown, CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AiGoalAssistant } from "@/features/ai-goals/ai-goal-assistant";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toggleWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TodoItem } from "@/features/todos/todo-item";
import UFLProgressCard from "@/features/analytics/shareable-card";
import { getTreeEmojiString, calculateTreeScale } from '@/lib/utils/forest';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sunrise };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

function formatDate() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return { day: days[now.getDay()], date: now.getDate(), month: months[now.getMonth()] };
}

function getCategoryIconAndColor(category: string) {
  const c = category?.toLowerCase() || '';
  switch (c) {
    case 'fitness': return { icon: Dumbbell, bg: 'bg-orange-500', color: 'text-white' };
    case 'health': return { icon: Heart, bg: 'bg-rose-500', color: 'text-white' };
    case 'work': return { icon: Briefcase, bg: 'bg-indigo-500', color: 'text-white' };
    case 'finance': return { icon: TrendingUp, bg: 'bg-emerald-500', color: 'text-white' };
    case 'learning': return { icon: BookOpen, bg: 'bg-amber-500', color: 'text-white' };
    case 'mindset': return { icon: Star, bg: 'bg-purple-500', color: 'text-white' };
    default: return { icon: Target, bg: 'bg-sky-500', color: 'text-white' };
  }
}


// ─── Forest Tree Card ─────────────────────────────────────────────────────────

function TreeMini({ category, index, treeTaskCount, activeTree, setActiveTree }: any) {
    const ref = useRef<HTMLDivElement>(null);
    const emoji = getTreeEmojiString(category, index);
    
    // Smooth size mapping: 0 to 5 -> 0.55 to 1.0 scale
    const scale = calculateTreeScale(treeTaskCount);

    const handleOpen = () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setActiveTree({ category, index, treeTaskCount, emoji, x: rect.left + rect.width / 2, y: rect.top });
    };

    return (
        <div
            ref={ref}
            onMouseEnter={handleOpen}
            onMouseLeave={() => setActiveTree(null)}
            onClick={handleOpen}
            className="relative flex items-end justify-center cursor-pointer group h-12 w-8 sm:w-10 z-10"
        >
            <div className={cn(
                "relative flex items-end justify-center transition-all duration-300 origin-bottom",
                activeTree?.category === category && activeTree?.index === index ? "scale-150 z-20 drop-shadow-xl" : "group-hover:scale-125 drop-shadow-sm group-hover:drop-shadow-md"
            )}>
                <div className="text-2xl sm:text-3xl leading-none transition-all duration-300" style={{ transform: `scale(${scale})` }}>
                    {emoji}
                </div>
            </div>
        </div>
    );
}

function TreeTooltip({ data }: any) {
    const { category, index, treeTaskCount, emoji, x, y } = data;
    return (
        <div
            className="fixed z-50 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 animate-in fade-in zoom-in-95 pointer-events-none"
            style={{ left: x, top: y - 10, transform: "translate(-50%, -100%)" }}
        >
            <p className="text-xs font-black uppercase tracking-widest text-center text-emerald-500">
                {category} {index > 0 ? `Tree ${index + 1}` : ""}
            </p>
            <p className="text-[10px] text-zinc-500 text-center font-bold mt-0.5 uppercase tracking-wide">
                {treeTaskCount === 5 ? "Fully Grown" : "Growing"}
            </p>
            <div className="mt-2.5 text-center">
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    {emoji} {treeTaskCount} / 5
                </p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">tasks completed</p>
            </div>
        </div>
    );
}

// ─── Forest View ──────────────────────────────────────────────────────────────

function ForestView({ tasks }: { tasks: any[] }) {
    const [activeTree, setActiveTree] = useState<any>(null);

    const categories = useMemo(() => {
        const map: Record<string, { total: number; completed: number; xp: number }> = {};
        tasks.forEach((t) => {
            const cat = (t.category || "general").toLowerCase();
            if (!map[cat]) map[cat] = { total: 0, completed: 0, xp: 0 };
            map[cat].total++;
            if (t.completed) map[cat].completed++;
            map[cat].xp += t.earnedXp || 0;
        });
        return Object.entries(map);
    }, [tasks]);

    if (!categories.length) return null;

    return (
        <div className="mb-6 relative">
            <div className="flex items-center gap-2 mb-3 px-1">
                <p className="text-[10px] font-extrabold tracking-[.2em] uppercase text-zinc-400 dark:text-zinc-500">Virtual Forest</p>
                <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800" />
            </div>
            
            <div className="relative bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:px-6 sm:py-6 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10 pb-2 sm:pb-0">
                    {categories.map(([cat, counts]) => {
                        const numTrees = Math.max(1, Math.ceil(counts.completed / 5));
                        const elements = [];
                        for (let i = 0; i < numTrees; i++) {
                            const treeTaskCount = (i === numTrees - 1 && counts.completed > 0 && counts.completed % 5 !== 0)
                                ? counts.completed % 5
                                : counts.completed === 0 ? 0 : 5;
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
                           <div key={cat} className="flex flex-col items-center gap-3 relative group/cat">
                              <div className="absolute -inset-x-3 -inset-y-2 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                              <div className="flex items-end gap-1 sm:gap-1.5 h-12 relative z-10">
                                  {elements}
                              </div>
                              <p className="text-[8px] sm:text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.15em] z-10">
                                {cat}
                              </p>
                           </div>
                        );
                    })}
                </div>
            </div>
            {activeTree && <TreeTooltip data={activeTree} />}
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
    const [stats, setStats] = useState<any>({ total: 0, completed: 0, today: 0, timeUps: 0 });
    const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, totalPages: 1 });
    const [grouped, setGrouped] = useState<any>({ today: [], timeUp: [], completed: [] });
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ timeUp: true, today: true, completed: false });

    const { text: greetingText, icon: GreetingIcon } = getGreeting();
    const { day, date, month } = formatDate();
    const userName = session?.user?.name ? session.user.name.split(" ")[0] : "there";
    const progressPct = (stats?.total || 0) > 0 ? Math.round(((stats?.completed || 0) / (stats?.total || 1)) * 100) : 0;

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
        } catch {
            toast.error("Failed to update WhatsApp settings.");
        } finally {
            setToggleLoading(false);
        }
    };

    const fetchTasks = async (page = 1) => {
        try {
            const res = await fetch(`/api/todos?page=${page}&limit=10`);
            if (res.ok) {
                const result = await res.json();
                setTasks(result.data);
                if (result.stats) setStats(result.stats);
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
                if (result.stats) setStats(result.stats);
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
        const accentMap = {
            today: "text-indigo-500",
            timeUp: "text-red-500",
            completed: "text-emerald-500",
        };
        const bgAccentMap = {
            today: "bg-indigo-500/10",
            timeUp: "bg-red-500/10",
            completed: "bg-emerald-500/10",
        };

        const isOpen = openSections[cat];
        const setOpen = () => setOpenSections(prev => ({...prev, [cat]: !prev[cat]}));

        return (
            <div className="mb-4">
                <button
                    onClick={setOpen}
                    className="flex items-center gap-2.5 w-full text-left mb-6 mt-8 group"
                >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", bgAccentMap[cat], accentMap[cat])}>
                        {icon}
                    </div>
                    <h2 className="text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">{title}</h2>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
                        {list.length}
                    </span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <ChevronDown
                        className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col">
                                {visible.map((task, idx) => {
                                    const isLast = idx === visible.length - 1 && !hasMore;
                                    const { icon: CatIcon, bg, color } = getCategoryIconAndColor(task.category);
                                    const isDone = task.completed || task.status === 'completed';
                                    const inProgress = task.status === 'in_progress';

                                    return (
                                       <motion.div
                                          initial={{ opacity: 0, x: -12 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                                          className="flex gap-4 group" key={task.id}
                                       >
                                            {/* Left: Timestamp */}
                                            <div className="w-12 shrink-0 pt-2.5 text-right hidden lg:block">
                                                <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-600 leading-none">
                                                    {task.reminderTime ? new Date(task.reminderTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—:——"}
                                                </span>
                                            </div>

                                            {/* Center: Icon + Line */}
                                            <div className="flex flex-col items-center pt-1.5">
                                                <div className={cn("relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md", bg, isDone && "opacity-70 saturate-50")}>
                                                    {isDone ? <CheckCheck className="w-3.5 h-3.5 text-white" /> : <CatIcon className={cn("w-3.5 h-3.5", color)} />}
                                                    {inProgress && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-background animate-pulse" />
                                                    )}
                                                </div>
                                                {!isLast && (
                                                    <div className="w-px flex-1 mt-1.5 bg-gradient-to-b from-zinc-300/30 dark:from-zinc-700/50 to-transparent min-h-[20px]" />
                                                )}
                                            </div>

                                            {/* Right: Task Card */}
                                            <div className="flex-1 pb-5 min-w-0">
                                                <TodoItem
                                                    id={task.id}
                                                    task={task.task}
                                                    category={task.category || "General"}
                                                    status={task.status}
                                                    completed={task.completed ?? false}
                                                    startTime={task.startTime ?? null}
                                                    deadline={task.deadline ?? null} 
                                                    startedAt={task.startedAt ?? null} 
                                                    reminderTime={task.reminderTime ? new Date(task.reminderTime) : null}
                                                    delayCount={task.delayCount ?? 0}
                                                    onToggleComplete={handleToggleComplete}
                                                />
                                            </div>
                                       </motion.div>
                                    );
                                })}
                            </div>

                            {hasMore && (
                                <div className="flex gap-4 mb-4">
                                    <div className="w-12 shrink-0 hidden lg:block" />
                                    <div className="flex flex-col items-center"><div className="w-8 shrink-0 flex justify-center"><div className="w-px h-full bg-gradient-to-b from-zinc-300/30 dark:from-zinc-700/50 to-transparent" /></div></div>
                                    <button
                                        onClick={() => handleLoadMore(cat)}
                                        className="flex-1 py-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[10px] font-extrabold tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all active:scale-95"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
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

                {/* Header */}
                <div className="page-header mb-8 pt-6">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                {day} {date}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        </div>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-500 font-medium mb-4">
                        {month}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <GreetingIcon className="w-5 h-5 text-amber-500" />
                                <span className="text-zinc-500 dark:text-zinc-400 text-3xl sm:text-4xl font-medium">
                                    {greetingText},
                                </span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white leading-tight">
                                {userName}!
                            </h1>
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
                    
                    {/* Progress Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                                    Progress in motion
                                </p>
                            </div>
                            <span className={cn("text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider", progressPct >= 80 ? "bg-emerald-500/15 text-emerald-500" : progressPct >= 50 ? "bg-amber-500/15 text-amber-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500")}>
                                {progressPct}% complete
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", progressPct >= 80 ? "bg-emerald-500" : progressPct >= 50 ? "bg-amber-500" : "bg-indigo-500")} />
                        </div>
                        <div className="flex gap-3 mt-3">
                            {[{ label: "total", value: stats?.total || 0, color: "text-zinc-500" }, { label: "done", value: stats?.completed || 0, color: "text-emerald-500" }, { label: "pending", value: (stats?.total || 0) - (stats?.completed || 0), color: "text-amber-500" }].map(s => (
                                <div key={s.label} className="flex items-baseline gap-1">
                                    <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Forest */}
                {!loading && tasks.length > 0 && <ForestView tasks={tasks} />}

                {/* Todo sections */}
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
                    onClose={() => { setIsModalOpen(false); fetchTasks(); fetchGroupedTasks(); }}
                />
                <AiGoalAssistant
                    isOpen={isAiModalOpen}
                    onClose={() => { setIsAiModalOpen(false); fetchTasks(); }}
                />
            </div>
        </>
    );
}