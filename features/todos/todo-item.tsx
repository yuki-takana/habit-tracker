"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Clock,
  Check,
  Plus,
  Play,
  Loader2,
  AlertCircle,
  Timer,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useXp } from "@/components/providers/xp-provider";
import { ApiClient } from "@/lib/api-client";

interface TodoProps {
  id?: string;
  task: string;
  startTime?: Date | string | null;
  deadline?: Date | string | null;
  startedAt?: Date | string | null;
  reminderTime: Date | string | null;
  category: string;
  status: string;
  completed?: boolean;
  delayCount?: number;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

interface Particle {
  id: number;
  color: string;
  left: number;
  top: number;
  dx: number;
  dy: number;
  delay: number;
}

const CATEGORY_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    dot: string;
    particle: string;
    bar: string;
    timerColor: string;
    badgeBg: string;
  }
> = {
  fitness: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
    particle: "#f97316",
    bar: "bg-orange-500",
    timerColor: "text-orange-400",
    badgeBg: "bg-orange-500/10 border-orange-500/20",
  },
  health: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-400",
    particle: "#f43f5e",
    bar: "bg-rose-500",
    timerColor: "text-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/20",
  },
  work: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
    particle: "#6366f1",
    bar: "bg-indigo-500",
    timerColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  finance: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    particle: "#10b981",
    bar: "bg-emerald-500",
    timerColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  learning: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    particle: "#f59e0b",
    bar: "bg-amber-500",
    timerColor: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
  },
  mindset: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
    particle: "#a855f7",
    bar: "bg-purple-500",
    timerColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
  },
  general: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    dot: "bg-sky-400",
    particle: "#0ea5e9",
    bar: "bg-sky-500",
    timerColor: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
  },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category?.toLowerCase()] ?? CATEGORY_CONFIG["general"];
}

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  return audioCtx;
}

function playDone() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(523, ctx.currentTime);
    o.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    o.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch (_) { }
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

function getProgressPercent(
  startedAt: Date | string | null | undefined,
  deadline: Date | string | null | undefined
): number {
  if (!startedAt || !deadline) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const total = end - start;
  if (total <= 0) return 100;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function TodoItem({
  id,
  task,
  startTime,
  deadline,
  startedAt,
  reminderTime,
  category,
  status,
  completed,
  delayCount,
  onToggleComplete,
}: TodoProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [overdueMs, setOverdueMs] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const hasNotified = useRef(false);
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(
    completed || status === "completed"
  );
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status || "upcoming");
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  const cat = getCategoryConfig(category);
  const { refreshXp } = useXp();

  const isFailed = localStatus === "failed" || localStatus === "missed";
  const isOverdue =
    (localStatus === "late" || timeLeft === "Overdue!") && !isCompleted && !isFailed;
  const isInProgress = localStatus === "in_progress" && !isCompleted && !isFailed;
  const showTimerSection =
    (isInProgress || isOverdue) && (deadline || startedAt);

  console.log("show timer section is ", isInProgress, showTimerSection, deadline, startedAt)

  useEffect(() => {
    const unlock = () => {
      try {
        getAudioCtx().resume();
      } catch (_) { }
    };
    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, []);

  useEffect(() => {
    setIsCompleted(completed || status === "completed");
    setLocalStatus(status);
  }, [completed, status]);

  const spawnParticles = useCallback((color: string) => {
    const n = 12;
    const newParticles: Particle[] = Array.from({ length: n }, () => {
      const angle = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 55;
      return {
        id: particleId.current++,
        color,
        left: 18 + Math.random() * 40,
        top: 30 + Math.random() * 30,
        dx: Math.cos(angle) * d,
        dy: -(Math.abs(Math.sin(angle) * d) + 8),
        delay: Math.random() * 0.18,
      };
    });
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(
      () =>
        setParticles((p) =>
          p.filter((x) => !newParticles.find((n) => n.id === x.id))
        ),
      900
    );
  }, []);

  const triggerCelebration = useCallback(
    (color: string) => {
      spawnParticles(color);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: [color, "#ffffff", "#10b981"],
      });
      playDone();
    },
    [spawnParticles]
  );

  const toggleComplete = async (e?: React.MouseEvent) => {
    if (!id) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState) setLocalStatus("completed");
    onToggleComplete?.(id, nextState);

    if (nextState) {
      triggerCelebration(cat.particle);
      toast.success("Task completed", { description: task });
    }

    try {
      await ApiClient.toggleTodoComplete(id, nextState);
      await refreshXp();
      router.refresh();
    } catch {
      setIsCompleted(!nextState);
      if (!nextState) setLocalStatus(status);
      toast.error("Failed to update task");
    }
  };

  const startTask = async () => {
    if (!id) return;
    setLoading(true);
    setLocalStatus("in_progress");
    try {
      await ApiClient.startTodo(id);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLocalStatus(status);
      toast.error("Failed to start task");
    } finally {
      setLoading(false);
    }
  };

  const failTask = async () => {
    if (!id) return;
    setLoading(true);
    setLocalStatus("failed");
    setIsCompleted(false);

    try {
      await ApiClient.failTodo(id);
      toast.error("Task marked as failed");
      router.refresh();
    } catch {
      setLocalStatus(status);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const delayTask = async (minutes: number) => {
    if (!id) return;
    setLoading(true);
    const updatedStartTime = new Date(
      Date.now() + minutes * 60000
    ).toISOString();
    let updatedDeadline = undefined;
    if (deadline) {
      updatedDeadline = new Date(
        new Date(deadline).getTime() + minutes * 60000
      ).toISOString();
    }
    const newDelayCount = (delayCount || 0) + 1;
    setLocalStatus("upcoming");
    toast.success(`Task delayed by ${minutes}m`);

    try {
      await ApiClient.delayTodo(id, updatedStartTime, updatedDeadline, newDelayCount);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLocalStatus(status);
      toast.error("Failed to delay task");
    } finally {
      setLoading(false);
    }
  };

  // Live countdown tick
  useEffect(() => {
    if (isCompleted || localStatus === "completed" || isFailed) {
      setTimeLeft(isFailed ? "Failed" : "Done!");
      return;
    }

    const calc = () => {
      if (deadline && (localStatus === "in_progress" || localStatus === "late")) {
        const d = new Date(deadline).getTime();
        const diff = d - Date.now();

        if (diff <= 5 * 60000 && diff > 0 && !hasNotified.current) {
          hasNotified.current = true;
          toast("Almost out of time! ⏳", {
            description: `${task} deadline is approaching. Have you completed it?`,
            duration: 20000,
            action: {
              label: "Done",
              onClick: () => toggleComplete(),
            },
            cancel: {
              label: "No",
              onClick: () => failTask(),
            },
          });
          setTimeLeft(formatDuration(diff));
          setOverdueMs(0);
          setProgressPct(getProgressPercent(startedAt, deadline));
        } else if (diff <= 0) {
          setTimeLeft("Overdue!");
          setOverdueMs(Math.abs(diff));
          setProgressPct(100);
          if (!hasNotified.current) {
            hasNotified.current = true;
            try {
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              )
                new Notification("Task Deadline", {
                  body: `${task} is overdue!`,
                });
            } catch (_) { }
            toast.error("Deadline passed!", { description: task });
          }
        } else {
          setTimeLeft(formatDuration(diff));
          setOverdueMs(0);
          setProgressPct(getProgressPercent(startedAt, deadline));
        }
      } else {
        setTimeLeft("");
        setProgressPct(0);
      }
    };

    const t = setInterval(calc, 1000);
    calc();
    return () => clearInterval(t);
  }, [deadline, isCompleted, localStatus, task, startedAt]);

  const cardBorderClass = isCompleted
    ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-transparent"
    : isFailed
      ? "border-rose-500/30 bg-rose-50 dark:bg-rose-950/10 grayscale opacity-75"
      : isOverdue
        ? "border-red-500/30 bg-red-50 dark:bg-red-950/10"
        : isInProgress
          ? "border-indigo-500/25 bg-indigo-50 dark:bg-indigo-950/[0.06]"
          : localStatus === "ready"
            ? "border-amber-500/30 bg-amber-50 dark:bg-amber-950/10"
            : "border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80";

  return (
    <>
      <style>{`
        @keyframes particle-up {
          0%  { opacity: 1; transform: translate(0, 0) scale(1); }
          100%{ opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); }
        }
        @keyframes todo-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes overdue-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes progress-stripe {
          0%   { background-position: 0 0; }
          100% { background-position: 28px 0; }
        }
        .todo-card-enter { animation: todo-in 0.28s ease forwards; }
        .overdue-blink   { animation: overdue-pulse 1.1s ease-in-out infinite; }
        .progress-stripe {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 5px,
            rgba(255,255,255,0.06) 5px,
            rgba(255,255,255,0.06) 10px
          );
          background-size: 28px 28px;
          animation: progress-stripe 1.2s linear infinite;
        }
      `}</style>

      <div
        className={cn(
          "todo-card-enter relative rounded-2xl border transition-all duration-300 overflow-hidden",
          "bg-white/70 dark:bg-background/70 backdrop-blur-sm",
          isCompleted || isFailed ? "opacity-60 scale-[0.988]" : "opacity-100 scale-100",
          cardBorderClass
        )}
    >
        {/* Category accent bar */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full",
            cat.dot
          )}
        />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none z-10"
            style={{
              background: p.color,
              left: p.left,
              top: p.top,
              // @ts-ignore
              "--dx": p.dx + "px",
              "--dy": p.dy + "px",
              animation: "particle-up .82s ease-out forwards",
              animationDelay: p.delay + "s",
            }}
          />
        ))}

        {/* ── MAIN CONTENT ── */}
        <div className="pl-5 pr-4 pt-3.5 pb-3 flex flex-col gap-2.5">

          {/* ── ROW 1: Checkbox + Task Info + Status Chip ── */}
          <div className="flex items-center gap-3">

            {/* Checkbox */}
            <button
              onClick={toggleComplete}
              disabled={loading}
              className={cn(
                "shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 flex items-center justify-center",
                "transition-all duration-200 active:scale-90 disabled:opacity-50",
                isCompleted
                  ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : `border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-opacity-80 hover:${cat.dot.replace("bg-", "border-")}`
              )}
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin text-indigo-400" />
              ) : isCompleted ? (
                <Check size={14} className="text-emerald-400" strokeWidth={3} />
              ) : (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    cat.dot,
                    "opacity-40 group-hover:opacity-90"
                  )}
                />
              )}
            </button>

            {/* Task name + category */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-bold leading-snug tracking-tight break-words whitespace-normal transition-all duration-300",
                  isCompleted
                    ? "line-through text-zinc-500"
                    : "text-zinc-800 dark:text-zinc-100"
                )}
              >
                {task}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "text-[9px] font-black tracking-[.18em] uppercase px-2 py-0.5 rounded-md border",
                    cat.badgeBg,
                    cat.text
                  )}
                >
                  {category}
                </span>
                {(delayCount ?? 0) > 0 && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-0.5 tracking-wide">
                    ↻ delayed ×{delayCount}
                  </span>
                )}
              </div>
            </div>

            {/* Status chip — right aligned */}
            <div className="shrink-0">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wide">
                  <Check size={10} strokeWidth={3} />
                  <span className="hidden sm:inline">Done</span>
                </div>
              ) : isFailed ? (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black tracking-wide">
                  <AlertCircle size={10} />
                  <span className="">Failed</span>
                </div>
              ) : isOverdue ? (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-wide overdue-blink">
                  <AlertCircle size={10} />
                  <span className="hidden sm:inline">Overdue</span>
                </div>
              ) : isInProgress ? (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                  <span className="hidden sm:inline">In Progress</span>
                  <span className="sm:hidden">Active</span>
                </div>
              ) : localStatus === "ready" ? (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wide">
                  <Flame size={10} />
                  <span className="hidden sm:inline">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 text-[10px] font-black tracking-wide">
                  <Clock size={10} />
                  <span className="">
                    {startTime
                      ? new Date(startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "Upcoming"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── TIMER SECTION — only when in_progress or overdue ── */}
          {showTimerSection && (
            <div
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-300",
                isOverdue
                  ? "bg-red-50 dark:bg-red-950/20 border-red-500/20"
                  : "bg-zinc-50 dark:bg-[#0d0d1a] border-zinc-200 dark:border-zinc-800/80"
              )}
            >
              {/* Timer icon + value */}
              <div className="shrink-0 flex items-center gap-2">
                <Timer
                  size={14}
                  className={cn(
                    isOverdue ? "text-red-400" : cat.timerColor,
                    isOverdue && "overdue-blink"
                  )}
                />
                <div>
                  <p className="text-[8px] font-bold tracking-[.15em] uppercase text-zinc-600 leading-none mb-0.5">
                    {isOverdue ? "Over by" : "Time left"}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-base sm:text-lg font-black leading-none tabular-nums",
                      isOverdue
                        ? "text-red-400 overdue-blink"
                        : cat.timerColor
                    )}
                  >
                    {isOverdue ? formatDuration(overdueMs) : timeLeft}
                  </p>
                </div>
              </div>

              {/* Progress bar + timestamps */}
              {!isOverdue && deadline && (
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="relative h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                        progressPct > 85
                          ? "bg-red-500 progress-stripe"
                          : progressPct > 60
                            ? "bg-amber-500"
                            : cat.bar
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {startedAt
                        ? new Date(startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "–"}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold",
                        progressPct > 85 ? "text-red-400" : "text-zinc-500"
                      )}
                    >
                      Due{" "}
                      {new Date(deadline).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Overdue: full-width red bar */}
              {isOverdue && (
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-red-500/20 overflow-hidden">
                    <div className="h-full w-full bg-red-500/60 progress-stripe" />
                  </div>
                  <p className="text-[9px] text-red-500/60 font-mono mt-1">
                    Deadline was{" "}
                    {deadline
                      ? new Date(deadline).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "–"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIONS ROW — only when not completed and not failed ── */}
          {!isCompleted && !isFailed && (
            <>
              {/* Separator */}
              <div className="h-px bg-zinc-200 dark:bg-zinc-800/60 -mx-1" />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">

                {/* Delay buttons — only when not started and not in progress */}
                {!startedAt && localStatus !== "in_progress" && (
                  <>
                    <button
                      onClick={() => delayTask(15)}
                      disabled={loading}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black tracking-wide uppercase hover:bg-orange-500/15 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Plus size={10} />
                      <span>15m</span>
                    </button>
                    <button
                      onClick={() => delayTask(30)}
                      disabled={loading}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wide uppercase hover:bg-amber-500/15 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Plus size={10} />
                      <span>30m</span>
                    </button>
                  </>
                )}
                {/* Start Now — only when not started and not in_progress */}
                {!startedAt && localStatus !== "in_progress" && (
                  <button
                    onClick={startTask}
                    disabled={loading}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-wide uppercase hover:bg-indigo-500/15 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play size={10} fill="currentColor" />
                    <span className="hidden sm:inline">Start Now</span>
                    <span className="sm:hidden">Start</span>
                  </button>
                )}

                {/* Focus Mode CTA — when in_progress */}
                {localStatus === "in_progress" && id && (
                  isOverdue ? (
                    <button
                      onClick={() => toggleComplete()}
                      className="shrink-0 ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 border border-red-400/50 shadow-[0_0_16px_rgba(239,68,68,0.35)] hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all active:scale-95 text-white text-[10px] sm:text-[11px] font-black tracking-widest uppercase"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Finish it!</span>
                    </button>
                  ) : (
                    <Link
                      href={`/todos/${id}/sessions`}
                      onClick={() =>
                        toast("Entering focus mode 🎯", { description: task })
                      }
                      className={cn(
                        "shrink-0 ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl",
                        "text-white text-[10px] sm:text-[11px] font-black tracking-widest uppercase",
                        "transition-all active:scale-95",
                        "bg-indigo-600 border border-indigo-400/40 shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:bg-indigo-500 hover:shadow-[0_0_24px_rgba(99,102,241,0.5)]"
                      )}
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Focus</span>
                    </Link>
                  )
                )}

                {/* Overdue without in_progress — still show focus */}
                {isOverdue && localStatus !== "in_progress" && id && (
                  <button
                    onClick={() => toggleComplete()}
                    className="shrink-0 ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 border border-red-400/50 text-white text-[10px] sm:text-[11px] font-black tracking-widest uppercase shadow-[0_0_16px_rgba(239,68,68,0.35)] hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all active:scale-95"
                  >
                    <Play size={11} fill="currentColor" />
                    <span>Finish it!</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}