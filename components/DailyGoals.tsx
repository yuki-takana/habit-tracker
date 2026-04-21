"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  BookOpen,
  Briefcase,
  Heart,
  Code,
  Star,
  Coffee,
  Moon,
  Sunrise,
  Sun,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Bell,
  MoreVertical,
  Play,
  CheckCheck,
  AlertCircle,
  LayoutList,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ChallengeModal from "@/components/challenges/ChallengeModal";
import RoutineManager from "@/components/routines/RoutineManager";

interface DailyGoalsProps {
  onGenerate?: () => void;
}

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; iconColor: string; dot: string }
> = {
  fitness: {
    icon: Dumbbell,
    bg: "bg-green-500",
    iconColor: "text-white",
    dot: "bg-green-400",
  },
  health: {
    icon: Heart,
    bg: "bg-red-500",
    iconColor: "text-white",
    dot: "bg-red-400",
  },
  work: {
    icon: Briefcase,
    bg: "bg-blue-500",
    iconColor: "text-white",
    dot: "bg-blue-400",
  },
  coding: {
    icon: Code,
    bg: "bg-violet-500",
    iconColor: "text-white",
    dot: "bg-violet-400",
  },
  learning: {
    icon: BookOpen,
    bg: "bg-amber-500",
    iconColor: "text-white",
    dot: "bg-amber-400",
  },
  personal: {
    icon: Star,
    bg: "bg-pink-500",
    iconColor: "text-white",
    dot: "bg-pink-400",
  },
  break: {
    icon: Coffee,
    bg: "bg-orange-400",
    iconColor: "text-white",
    dot: "bg-orange-300",
  },
  default: {
    icon: Target,
    bg: "bg-slate-500",
    iconColor: "text-white",
    dot: "bg-slate-400",
  },
};

function getCategoryConfig(category: string) {
  const key = category?.toLowerCase() || "default";
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG["default"];
}

// ─── Status Config ────────────────────────────────────────────────────────────
function getStatusConfig(completed: boolean, status?: string) {
  if (completed || status === "completed")
    return {
      label: "Done",
      className:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    };
  if (status === "in_progress")
    return {
      label: "In Progress",
      className: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
    };
  if (status === "failed")
    return {
      label: "Missed",
      className: "bg-red-500/15 text-red-400 border border-red-500/25",
    };
  return {
    label: "Pending",
    className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
  };
}

// ─── Greeting Logic ───────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sunrise };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

function formatDate() {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return {
    day: days[now.getDay()],
    date: now.getDate(),
    month: months[now.getMonth()],
  };
}

// ─── Timeline Block Component ─────────────────────────────────────────────────
interface TimelineItem {
  id: string;
  task: string;
  time?: string;
  duration?: number;
  plannedTime?: number;
  category?: string;
  completed?: boolean;
  status?: string;
  reminderTime?: string;
  details?: string[];
}

interface TimelineBlockProps {
  item: TimelineItem;
  isLast: boolean;
  index: number;
}

function TimelineBlock({ item, isLast, index }: TimelineBlockProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = getCategoryConfig(item.category || "default");
  const statusCfg = getStatusConfig(
    item.completed || false,
    item.status
  );
  const CatIcon = cat.icon;
  const duration = item.duration || item.plannedTime || 0;

  const displayTime =
    item.time ||
    (item.reminderTime
      ? new Date(item.reminderTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "—:——");

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
      className="flex gap-4 group"
    >
      {/* Left: Timestamp */}
      <div className="w-12 shrink-0 pt-2.5 text-right">
        <span className="text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-500 tabular-nums leading-none">
          {displayTime}
        </span>
      </div>

      {/* Center: Icon + Line */}
      <div className="flex flex-col items-center">
        {/* Colored Circle Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${cat.bg} ${item.completed ? "opacity-70 saturate-50" : ""
            }`}
        >
          {item.completed || item.status === "completed" ? (
            <CheckCheck className="w-4 h-4 text-white" />
          ) : (
            <CatIcon className={`w-4 h-4 ${cat.iconColor}`} />
          )}
          {/* In-progress pulse */}
          {item.status === "in_progress" && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-background animate-pulse" />
          )}
        </motion.div>

        {/* Vertical connector line */}
        {!isLast && (
          <div className="w-px flex-1 mt-1.5 bg-gradient-to-b from-zinc-300/30 dark:from-zinc-700/50 to-transparent min-h-[20px]" />
        )}
      </div>

      {/* Right: Task Card */}
      <div className="flex-1 pb-5">
        <div
          className={`relative rounded-xl border transition-all duration-200 overflow-hidden
            ${item.completed || item.status === "completed"
              ? "bg-zinc-50/40 dark:bg-zinc-900/30 border-zinc-200/30 dark:border-zinc-800/30 opacity-70"
              : item.status === "in_progress"
                ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/40 dark:border-blue-800/30 shadow-sm shadow-blue-500/5"
                : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
            }
          `}
        >
          {/* Top bar — category color accent */}
          {!item.completed && item.status !== "completed" && (
            <div className={`h-0.5 ${cat.bg} opacity-60`} />
          )}

          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Task name */}
                <h4
                  className={`font-semibold text-sm leading-snug ${item.completed || item.status === "completed"
                    ? "line-through text-zinc-400 dark:text-zinc-600"
                    : "text-zinc-800 dark:text-zinc-100"
                    }`}
                >
                  {item.task}
                </h4>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {duration > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
                      <Clock className="w-3 h-3" />
                      {duration >= 60
                        ? `${Math.floor(duration / 60)} hr${duration % 60 > 0
                          ? ` ${duration % 60} min`
                          : ""
                        }`
                        : `${duration} min`}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Sub-details (like workout reps) */}
                {item.details && item.details.length > 0 && (
                  <div className="mt-2.5 space-y-0.5">
                    {item.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500"
                      >
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right side: Status + Menu */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${statusCfg.className}`}
                >
                  {statusCfg.label}
                </span>

                {/* 3-dot menu */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section Block (Morning / Afternoon / Evening) ────────────────────────────
interface SectionProps {
  title: string;
  icon: React.ElementType;
  items: TimelineItem[];
  accentColor: string;
  defaultOpen?: boolean;
  startIndex: number;
}

function TimelineSection({
  title,
  icon: Icon,
  items,
  accentColor,
  defaultOpen = true,
  startIndex,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  const doneCount = items.filter(
    (i) => i.completed || i.status === "completed"
  ).length;

  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full text-left mb-4 group"
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentColor}`}
        >
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 ml-1">
          {doneCount}/{items.length}
        </span>
        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"
            }`}
        />
      </button>

      {/* Timeline items */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {items.map((item, idx) => (
              <TimelineBlock
                key={item.id}
                item={item}
                isLast={idx === items.length - 1}
                index={startIndex + idx}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DailyGoalsArchitect({ onGenerate }: DailyGoalsProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wakeUpTime, setWakeUpTime] = useState("06:30");
  const [todayGoals, setTodayGoals] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [userName, setUserName] = useState("there");

  // ── Routine & Challenge state ─────────────────────────────────────────────
  const [activeRoutine, setActiveRoutine] = useState<any>(null);
  const [showRoutinePanel, setShowRoutinePanel] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);

  const { text: greetingText, icon: GreetingIcon } = getGreeting();
  const { day, date, month } = formatDate();

  useEffect(() => {
    fetchTodayGoals();
    fetchActiveRoutine();
    fetchActiveChallenges();
  }, []);

  // ── Fetch active routine ──────────────────────────────────────────────────
  const fetchActiveRoutine = async () => {
    try {
      const res = await fetch("/api/routines");
      const data = await res.json();
      if (data.success) {
        const active = data.data.find((r: any) => r.isActive);
        setActiveRoutine(active || null);
      }
    } catch { /* silent */ }
  };

  // ── Fetch active challenges ───────────────────────────────────────────────
  const fetchActiveChallenges = async () => {
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setActiveChallenges(Array.isArray(data) ? data.filter((c: any) => c.status === "active") : []);
      }
    } catch { /* silent */ }
  };

  const fetchTodayGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/daily-goals");
      const data = await response.json();
      if (data.success) {
        setTodayGoals(data.data);
        setStats(data.data.stats);
        if (data.data.wakeUpTime) setWakeUpTime(data.data.wakeUpTime);
        if (data.data.name) setUserName(data.data.name.split(" ")[0]);
      } else if (data.wakeUpTime) {
        setWakeUpTime(data.wakeUpTime);
      }
      if (data.name) setUserName(data.name.split(" ")[0]);
    } catch (err) {
      console.error("Error fetching today's goals:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyGoals = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/daily-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wakeUpTime }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Daily plan generated!");
        await fetchTodayGoals();
        onGenerate?.();
      } else {
        setError(data.message || "Failed to generate daily goals");
        toast.error(data.message || "Failed to generate daily goals");
      }
    } catch (err) {
      setError("An error occurred while generating goals");
      toast.error("An error occurred while generating goals");
    } finally {
      setGenerating(false);
    }
  };

  // Split todos into time blocks
  const splitIntoBlocks = useCallback(
    (todos: any[]) => {
      if (!todos?.length) return { morning: [], afternoon: [], evening: [] };

      const getHour = (todo: any) => {
        if (todo.reminderTime) return new Date(todo.reminderTime).getHours();
        if (todo.time) {
          const [h] = todo.time.split(":");
          return parseInt(h, 10);
        }
        return -1;
      };

      const items = [...todos].sort((a, b) => {
        const ha = getHour(a);
        const hb = getHour(b);
        if (ha === -1 && hb === -1) return 0;
        if (ha === -1) return 1;
        if (hb === -1) return -1;
        return ha - hb;
      });

      return {
        morning: items.filter((t) => {
          const h = getHour(t);
          return h === -1 || (h >= 5 && h < 12);
        }),
        afternoon: items.filter((t) => {
          const h = getHour(t);
          return h >= 12 && h < 17;
        }),
        evening: items.filter((t) => {
          const h = getHour(t);
          return h >= 17 && h <= 23;
        }),
      };
    },
    []
  );

  // Also handle schedule blocks from generated goals
  const getTimelineItems = useCallback((): {
    morning: TimelineItem[];
    afternoon: TimelineItem[];
    evening: TimelineItem[];
  } => {
    if (!todayGoals) return { morning: [], afternoon: [], evening: [] };

    // If we have todos array, use it
    if (todayGoals.todos?.length) {
      return splitIntoBlocks(
        todayGoals.todos.map((t: any) => ({
          ...t,
          time: t.time || (t.reminderTime ? new Date(t.reminderTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined),
        }))
      );
    }

    // Fallback: use schedule blocks
    const toItems = (arr: any[]): TimelineItem[] =>
      arr?.map((s: any, i: number) => ({
        id: `schedule-${i}`,
        task: s.task,
        time: s.time,
        duration: s.duration,
        category: s.category || "default",
        completed: false,
        status: "pending",
      })) || [];

    return {
      morning: toItems(todayGoals.schedule?.morning || []),
      afternoon: toItems(todayGoals.schedule?.afternoon || []),
      evening: toItems(todayGoals.schedule?.evening || []),
    };
  }, [todayGoals, splitIntoBlocks]);

  const blocks = getTimelineItems();
  const totalItems =
    blocks.morning.length + blocks.afternoon.length + blocks.evening.length;
  const completedItems = [
    ...blocks.morning,
    ...blocks.afternoon,
    ...blocks.evening,
  ].filter((i) => i.completed || i.status === "completed").length;
  const progressPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >

          {/* Greeting */}
          <div className="mb-5 flex items-center justify-between">
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

            <div>
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
            </div>
          </div>

          {/* Progress Card */}
          {todayGoals && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                    Progress in motion
                  </p>
                  {stats && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5 font-medium">
                      {stats.totalStreakDays > 0
                        ? `You're on a roll! ${stats.totalStreakDays} days strong.`
                        : "Start your streak today!"}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-black px-3 py-1.5 rounded-full ${progressPct >= 80
                    ? "bg-emerald-500/15 text-emerald-500"
                    : progressPct >= 50
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                >
                  {progressPct}% complete
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${progressPct >= 80
                    ? "bg-emerald-500"
                    : progressPct >= 50
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                    }`}
                />
              </div>

              {/* Stat chips */}
              {stats && (
                <div className="flex gap-3 mt-3">
                  {[
                    {
                      label: "total",
                      value: stats.totalScheduled || totalItems,
                      color: "text-zinc-500",
                    },
                    {
                      label: "done",
                      value: stats.completed || completedItems,
                      color: "text-emerald-500",
                    },
                    {
                      label: "pending",
                      value: stats.pending || totalItems - completedItems,
                      color: "text-amber-500",
                    },
                  ].map((s) => (
                    <div key={s.label} className="flex items-baseline gap-1">
                      <span className={`text-sm font-black ${s.color}`}>
                        {s.value}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Controls Row */}
          <div className="flex items-center gap-3 mt-4 ">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 flex-1 shadow-sm">
              <Sunrise className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 shrink-0">
                Wake
              </label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:ring-0 focus:outline-none flex-1 min-w-0"
              />
            </div>

            {!todayGoals && (
              <Button
                onClick={generateDailyGoals}
                disabled={generating}
                className="rounded-xl h-9 px-5 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 "
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Planning...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    Generate
                  </span>
                )}
              </Button>
            )}

            {todayGoals && (
              <Button
                onClick={fetchTodayGoals}
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 shrink-0"
                title="Reload"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* ── Routine + Challenge Context Strip ──────────────────────── */}
          <div className="flex gap-2 mt-3">
            {/* Active Routine chip */}
            <button
              onClick={() => setShowRoutinePanel(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all flex-1 min-w-0 ${activeRoutine
                ? "bg-indigo-500/8 border-indigo-500/25 text-indigo-500 hover:bg-indigo-500/15"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
            >
              <LayoutList className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {activeRoutine ? activeRoutine.emoji + " " + activeRoutine.name : "No routine active"}
              </span>
              <ArrowRight className="w-3 h-3 shrink-0 ml-auto opacity-60" />
            </button>

            {/* Challenge chip */}
            <button
              onClick={() => setShowChallengeModal(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all flex-1 min-w-0 ${activeChallenges.length > 0
                ? "bg-amber-500/8 border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {activeChallenges.length > 0
                  ? `${activeChallenges[0].focus} · Day ${Math.max(1, Math.floor((Date.now() - new Date(activeChallenges[0].startDate).getTime()) / 86400000) + 1)}`
                  : "Start a challenge"}
              </span>
              <Plus className="w-3 h-3 shrink-0 ml-auto opacity-60" />
            </button>
          </div>
        </motion.div>

        {/* ── Error State ────────────────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-6"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* ── Loading skeleton ───────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 pt-2">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1">
                  <div className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Timeline ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!loading && todayGoals && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Strategy quote */}
              {todayGoals.dailySummary && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 px-4 py-3 rounded-xl bg-indigo-500/8 dark:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/15"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">
                    Today's Strategy
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                    "{todayGoals.dailySummary}"
                  </p>
                </motion.div>
              )}

              {/* Timeline Sections */}
              <TimelineSection
                title="Morning"
                icon={Sunrise}
                items={blocks.morning}
                accentColor="bg-amber-500"
                defaultOpen={true}
                startIndex={0}
              />
              <TimelineSection
                title="Afternoon"
                icon={Sun}
                items={blocks.afternoon}
                accentColor="bg-blue-500"
                defaultOpen={true}
                startIndex={blocks.morning.length}
              />
              <TimelineSection
                title="Evening"
                icon={Moon}
                items={blocks.evening}
                accentColor="bg-violet-500"
                defaultOpen={true}
                startIndex={blocks.morning.length + blocks.afternoon.length}
              />

              {/* Insights strip */}
              {todayGoals.insights && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 grid grid-cols-1 gap-3"
                >
                  {todayGoals.insights.gapsIdentified?.length > 0 && (
                    <div className="p-4 rounded-xl bg-orange-500/8 dark:bg-orange-500/10 border border-orange-500/15">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">
                        Critical Gaps
                      </p>
                      <div className="space-y-1.5">
                        {todayGoals.insights.gapsIdentified.map(
                          (gap: string, i: number) => (
                            <p
                              key={i}
                              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 italic pl-3 border-l-2 border-orange-400/40"
                            >
                              {gap}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {todayGoals.insights.topPriorities?.length > 0 && (
                    <div className="p-4 rounded-xl bg-indigo-500/8 dark:bg-indigo-500/10 border border-indigo-500/15">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                        Today's Priorities
                      </p>
                      <div className="space-y-1.5">
                        {todayGoals.insights.topPriorities.map(
                          (p: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                            >
                              <TrendingUp className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                              {p}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Empty State ──────────────────────────────────────────── */}
          {!loading && !todayGoals && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-5 text-indigo-500">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-2">
                No plan for today yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium mb-8 max-w-xs leading-relaxed">
                Let AI design your optimal schedule based on your habits,
                streak, and pending todos.
              </p>
              <Button
                onClick={generateDailyGoals}
                disabled={generating}
                className="px-8 py-5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Architecting your day...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Today's Plan
                  </span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Routine slide-over panel ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showRoutinePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowRoutinePanel(false); fetchActiveRoutine(); }}
            />
            {/* Slide-in panel from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-zinc-50 dark:bg-zinc-950 shadow-2xl overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => { setShowRoutinePanel(false); fetchActiveRoutine(); }}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <RoutineManager />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Challenge modal (reusable) ─────────────────────────────────────────── */}
      <ChallengeModal
        open={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        activeChallenges={activeChallenges}
        onSuccess={fetchActiveChallenges}
      />
    </div>
  );
}