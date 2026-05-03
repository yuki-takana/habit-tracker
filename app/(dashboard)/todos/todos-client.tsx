"use client";

import { AddTodoModal } from "@/features/todos/add-todo-modal";
import {
    Plus, ClipboardList, Smartphone, Loader2,
    Clock, CheckCircle2, AlertCircle, Sunrise, Sun, Moon,
    Briefcase, Dumbbell, Heart, BookOpen, Star, Target,
    TrendingUp, ChevronDown, CheckCheck, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AiGoalAssistant } from "@/features/ai-goals/ai-goal-assistant";
import { GoalPromptDialog } from "@/features/todos/goal-prompt-dialog";
import { RoutinePromptDialog } from "@/features/todos/routine-prompt-dialog";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toggleWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/features/todos/todo-item";
import UFLProgressCard from "@/features/analytics/shareable-card";
import { getTreeEmojiString, calculateTreeScale } from '@/lib/utils/forest';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
    id: string;
    task: string;
    category?: string;
    status?: string;
    completed?: boolean;
    startTime?: string | null;
    deadline?: string | null;
    startedAt?: string | null;
    reminderTime?: string | null;
    delayCount?: number;
    earnedXp?: number;
}

interface GroupedTasks {
    today: Task[];
    timeUp: Task[];
    completed: Task[];
    inProgress: Task[];
    failed: Task[];
}

interface Stats {
    total: number;
    completed: number;
    today: number;
    timeUps: number;
    inProgress: number;
    failed: number;
}

interface TodosPageProps {
    // Initial data passed from server component (page.tsx)
    initialGrouped: GroupedTasks;
    initialStats: Stats;
    initialHasGoal: boolean;
    initialHasRoutine: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good morning", icon: Sunrise };
    if (h < 17) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
}

function formatDate() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
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

// ─── Forest components (unchanged) ───────────────────────────────────────────

function TreeMini({ category, index, treeTaskCount, activeTree, setActiveTree }: any) {
    const ref = useRef<HTMLDivElement>(null);
    const emoji = getTreeEmojiString(category, index);
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
                activeTree?.category === category && activeTree?.index === index
                    ? "scale-150 z-20 drop-shadow-xl"
                    : "group-hover:scale-125 drop-shadow-sm group-hover:drop-shadow-md"
            )}>
                <div className="text-2xl sm:text-3xl leading-none transition-all duration-300"
                    style={{ transform: `scale(${scale})` }}>
                    {emoji}
                </div>
            </div>
        </div>
    );
}

function TreeTooltip({ data }: any) {
    const { category, index, treeTaskCount, emoji, x, y } = data;
    console.log("========== tree count ============== ",treeTaskCount)
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

function ForestView({ tasks }: { tasks: Task[] }) {
  const [activeTree, setActiveTree] = useState<any>(null);

  const TREE_CAPACITY = 10;

  const categories = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        completed: number;
        xp: number;
        fullTrees: number;
        progressPct: number;
        currentTreeProgress: number;
      }
    > = {};

    tasks.forEach((t) => {
      const cat = (t.category || "general").toLowerCase();

      if (!map[cat]) {
        map[cat] = {
          total: 0,
          completed: 0,
          xp: 0,
          fullTrees: 0,
          progressPct: 0,
          currentTreeProgress: 0,
        };
      }

      map[cat].total++;
      if (t.completed) map[cat].completed++;
      map[cat].xp += t.earnedXp || 0;
    });

    // 👉 compute tree progression
    Object.keys(map).forEach((cat) => {
      const totalCompleted = map[cat].completed;

      const fullTrees = Math.floor(totalCompleted / TREE_CAPACITY);
      const currentTreeProgress = totalCompleted % TREE_CAPACITY;
      const progressPct =
        (currentTreeProgress / TREE_CAPACITY) * 100;

      map[cat].fullTrees = fullTrees;
      map[cat].currentTreeProgress = currentTreeProgress;
      map[cat].progressPct = progressPct;
    });

    return Object.entries(map);
  }, [tasks]);

  if (!categories.length) return null;

  return (
    <div className="mb-6 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <p className="text-[10px] font-extrabold tracking-[.2em] uppercase text-zinc-400 dark:text-zinc-500">
          Virtual Forest
        </p>
        <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800" />
      </div>

      {/* Forest Container */}
      <div className="relative bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:px-6 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-8">

          {categories.map(([cat, data]) => {
            return (
              <div
                key={cat}
                className="flex flex-col items-center gap-2 relative group/cat"
              >
                {/* Hover bg */}
                <div className="absolute -inset-x-3 -inset-y-2 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl opacity-0 group-hover/cat:opacity-100 transition-opacity pointer-events-none" />

                {/* Tree */}
                <div className="relative z-10">
                  <TreeMini
                    category={cat}
                    progress={data.progressPct} 
                    fullTrees={data.fullTrees}
                    activeTree={activeTree}
                    setActiveTree={setActiveTree}
                  />

                  {/* 🌲 Completed Trees Badge */}
                  {data.fullTrees > 0 && (
                    <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full 
                      bg-emerald-500 text-white text-[9px] font-bold shadow">
                      {data.fullTrees}
                    </div>
                  )}
                </div>

                {/* Label */}
                <p className="text-[8px] sm:text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.15em]">
                  {cat}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {activeTree && <TreeTooltip data={activeTree} />}
    </div>
  );
}
function TaskSkeleton() {
    return (
        <div className="flex gap-4 mb-5">
            <div className="w-12 shrink-0 hidden lg:block" />
            <div className="flex flex-col items-center pt-1.5">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-px flex-1 mt-1.5 bg-zinc-100 dark:bg-zinc-800 min-h-[40px]" />
            </div>
            <div className="flex-1 pb-5">
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="h-3 w-1/3 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function useInfiniteSection(initialItems: Task[], pageSize = 10) {
    const [items, setItems] = useState<Task[]>(initialItems);
    const [page, setPage] = useState(1);
    const hasMore = items.length < initialItems.length || page * pageSize < initialItems.length;

    // When initialItems change (after refresh), reset
    useEffect(() => { setItems(initialItems.slice(0, pageSize)); setPage(1); }, [initialItems]);

    const loadMore = useCallback(() => {
        const next = page + 1;
        setItems(initialItems.slice(0, next * pageSize));
        setPage(next);
    }, [page, initialItems, pageSize]);

    const visibleItems = initialItems.slice(0, page * pageSize);
    const canLoadMore = page * pageSize < initialItems.length;

    return { visibleItems, canLoadMore, loadMore };
}


function TaskSection({
    title, icon, tasks, cat, onToggleComplete
}: {
    title: string;
    icon: React.ReactNode;
    tasks: Task[];
    cat: "today" | "timeUp" | "completed" | "inProgress" | "failed";
    onToggleComplete: (id: string, completed: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(cat !== "completed" && cat !== "failed");
    const { visibleItems, canLoadMore, loadMore } = useInfiniteSection(tasks, 10);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Auto-load more when sentinel enters viewport
    useEffect(() => {
        if (!isOpen || !canLoadMore) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { threshold: 0.1 }
        );
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [isOpen, canLoadMore, loadMore]);

    if (!tasks.length) return null;

    const accentMap = {
        today: "text-indigo-500", timeUp: "text-red-500", completed: "text-emerald-500",
        inProgress: "text-indigo-500", failed: "text-rose-500",
    };
    const bgAccentMap = {
        today: "bg-indigo-500/10", timeUp: "bg-red-500/10", completed: "bg-emerald-500/10",
        inProgress: "bg-indigo-500/10", failed: "bg-rose-500/10",
    };

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center gap-2.5 w-full text-left mb-6 mt-8 group"
            >
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", bgAccentMap[cat], accentMap[cat])}>
                    {icon}
                </div>
                <h2 className="text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">{title}</h2>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
                    {tasks.length}
                </span>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")} />
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
                            {visibleItems.map((task, idx) => {
                                const isLast = idx === visibleItems.length - 1 && !canLoadMore;
                                const { icon: CatIcon, bg, color } = getCategoryIconAndColor(task.category || '');
                                const isDone = task.completed || task.status === 'completed';
                                const inProgress = task.status === 'in_progress';

                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.25 }}
                                        className="flex gap-4 group"
                                    >
                                        {/* Timestamp */}
                                        <div className="w-12 shrink-0 pt-2.5 text-right hidden lg:block">
                                            <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-600 leading-none">
                                                {task.reminderTime
                                                    ? new Date(task.reminderTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
                                                    : "—:——"}
                                            </span>
                                        </div>

                                        {/* Timeline dot + line */}
                                        <div className="flex flex-col items-center pt-1.5">
                                            <div className={cn(
                                                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md",
                                                bg, isDone && "opacity-70 saturate-50"
                                            )}>
                                                {isDone
                                                    ? <CheckCheck className="w-3.5 h-3.5 text-white" />
                                                    : <CatIcon className={cn("w-3.5 h-3.5", color)} />
                                                }
                                                {inProgress && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-background animate-pulse" />
                                                )}
                                            </div>
                                            {!isLast && (
                                                <div className="w-px flex-1 mt-1.5 bg-gradient-to-b from-zinc-300/30 dark:from-zinc-700/50 to-transparent min-h-[20px]" />
                                            )}
                                        </div>

                                        {/* Task card */}
                                        <div className="flex-1 pb-5 min-w-0">
                                            <TodoItem
                                                id={task.id}
                                                task={task.task}
                                                category={task.category || "General"}
                                                status={task.status || (task.completed ? "completed" : "pending")}
                                                completed={task.completed ?? false}
                                                startTime={task.startTime ?? null}
                                                deadline={task.deadline ?? null}
                                                startedAt={task.startedAt ?? null}
                                                reminderTime={task.reminderTime ? new Date(task.reminderTime) : null}
                                                delayCount={task.delayCount ?? 0}
                                                onToggleComplete={onToggleComplete}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Intersection observer sentinel for auto-load */}
                        {canLoadMore && (
                            <div ref={sentinelRef} className="flex gap-4 mb-4">
                                <div className="w-12 shrink-0 hidden lg:block" />
                                <div className="flex flex-col items-center">
                                    <div className="w-8 shrink-0 flex justify-center">
                                        <div className="w-px h-full bg-gradient-to-b from-zinc-300/30 dark:from-zinc-700/50 to-transparent" />
                                    </div>
                                </div>
                                <div className="flex-1 py-3 flex items-center justify-center gap-2 text-zinc-400 text-[10px] font-extrabold tracking-widest uppercase">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading more...
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TodosPage({
    initialGrouped,
    initialStats,
    initialHasGoal,
    initialHasRoutine,
}: TodosPageProps) {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [grouped, setGrouped] = useState<GroupedTasks>(initialGrouped);
    const [stats, setStats] = useState<Stats>(initialStats);
    const [hasGoal, setHasGoal] = useState(initialHasGoal);
    const [hasRoutine, setHasRoutine] = useState(initialHasRoutine);
    const [showGoalPrompt, setShowGoalPrompt] = useState(!initialHasGoal);
    const [showRoutinePrompt, setShowRoutinePrompt] = useState(initialHasGoal && !initialHasRoutine);

    // All tasks flat list for forest view
    const allTasks = useMemo(() => [
        ...grouped.today, ...grouped.inProgress, ...grouped.completed,
        ...grouped.timeUp, ...grouped.failed
    ], [grouped]);

    const { text: greetingText, icon: GreetingIcon } = getGreeting();
    const { day, date, month } = formatDate();
    const userName = session?.user?.name ? session.user.name.split(" ")[0] : "there";
    const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    useEffect(() => {
        // @ts-ignore
        if (session?.user?.whatsappEnabled !== undefined) {
            // @ts-ignore
            setIsWhatsappEnabled(session.user.whatsappEnabled || false);
        }
    }, [session]);

    const handleToggleComplete = useCallback((id: string, completed: boolean) => {
        setGrouped(prev => {
            const updated = { ...prev };
            (Object.keys(updated) as (keyof GroupedTasks)[]).forEach(key => {
                updated[key] = updated[key].map(t => t.id === id ? { ...t, completed } : t);
            });
            return updated;
        });
        // Update stats optimistically
        setStats(prev => ({
            ...prev,
            completed: completed ? prev.completed + 1 : Math.max(0, prev.completed - 1),
        }));
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

    // Refresh grouped data after modal actions (lightweight — no full page reload)
    const refreshGrouped = useCallback(async () => {
        try {
            const res = await fetch('/api/todos/dashboard');
            if (res.ok) {
                const result = await res.json();
                setGrouped(result.grouped);
                if (result.stats) setStats(result.stats);
                setHasGoal(result.hasGoal);
                setHasRoutine(result.hasRoutine);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const isEmpty = allTasks.length === 0;

    return (
        <>
            <style>{`
                @keyframes header-in {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .page-header { animation: header-in .45s ease forwards; }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="page-header mb-8 pt-6">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                {day} {date}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                        </div>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-500 font-medium mb-4">{month}</div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <GreetingIcon className="w-5 h-5 text-amber-500" />
                                <span className="text-zinc-500 dark:text-zinc-400 text-5xl font-medium">
                                    {greetingText},
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight">
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
                                {toggleLoading
                                    ? <Loader2 size={20} className="animate-spin" />
                                    : <Smartphone size={20} />}
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

                    {/* Progress bar */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                                Progress in motion
                            </p>
                            <span className={cn(
                                "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
                                progressPct >= 80
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : progressPct >= 50
                                        ? "bg-amber-500/15 text-amber-500"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            )}>
                                {progressPct}% complete
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full",
                                    progressPct >= 80 ? "bg-emerald-500" : progressPct >= 50 ? "bg-amber-500" : "bg-indigo-500"
                                )}
                            />
                        </div>
                        <div className="flex gap-3 mt-3">
                            {[
                                { label: "total", value: stats.total, color: "text-zinc-500" },
                                { label: "done", value: stats.completed, color: "text-emerald-500" },
                                { label: "pending", value: stats.total - stats.completed, color: "text-amber-500" },
                            ].map(s => (
                                <div key={s.label} className="flex items-baseline gap-1">
                                    <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Forest ─────────────────────────────────────────── */}
                {allTasks.length > 0 && <ForestView tasks={allTasks} />}

                {/* ── Task sections ──────────────────────────────────── */}
                {isEmpty ? (
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
                ) : (
                    <div>
                        <TaskSection title="Time Up" icon={<AlertCircle size={14} />} tasks={grouped.timeUp} cat="timeUp" onToggleComplete={handleToggleComplete} />
                        <TaskSection title="In Progress" icon={<Clock size={14} />} tasks={grouped.inProgress} cat="inProgress" onToggleComplete={handleToggleComplete} />
                        <TaskSection title="Today's Missions" icon={<Clock size={14} />} tasks={grouped.today} cat="today" onToggleComplete={handleToggleComplete} />
                        <TaskSection title="Completed" icon={<CheckCircle2 size={14} />} tasks={grouped.completed} cat="completed" onToggleComplete={handleToggleComplete} />
                        <TaskSection title="Failed" icon={<XCircle size={14} />} tasks={grouped.failed} cat="failed" onToggleComplete={handleToggleComplete} />
                    </div>
                )}

                {/* ── Modals ─────────────────────────────────────────── */}
                <AddTodoModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); refreshGrouped(); }}
                />
                <AiGoalAssistant
                    isOpen={isAiModalOpen}
                    onClose={() => { setIsAiModalOpen(false); refreshGrouped(); }}
                />
                <GoalPromptDialog
                    isOpen={showGoalPrompt}
                    onClose={() => {
                        setShowGoalPrompt(false);
                        if (!hasRoutine) setShowRoutinePrompt(true);
                        else refreshGrouped();
                    }}
                />
                <RoutinePromptDialog
                    isOpen={showRoutinePrompt}
                    onClose={() => { setShowRoutinePrompt(false); refreshGrouped(); }}
                />
            </div>
        </>
    );
}