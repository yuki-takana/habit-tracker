"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clock, Check, Plus, Play, Loader2, CalendarClock, AlertCircle, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useXp } from "@/components/providers/xp-provider";

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; particle: string }> = {
  fitness: { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-400", particle: "#f97316" },
  health: { bg: "bg-rose-500/10", text: "text-rose-500", dot: "bg-rose-400", particle: "#f43f5e" },
  work: { bg: "bg-indigo-500/10", text: "text-indigo-500", dot: "bg-indigo-400", particle: "#6366f1" },
  finance: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-400", particle: "#10b981" },
  learning: { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-400", particle: "#f59e0b" },
  mindset: { bg: "bg-purple-500/10", text: "text-purple-500", dot: "bg-purple-400", particle: "#a855f7" },
  general: { bg: "bg-sky-500/10", text: "text-sky-500", dot: "bg-sky-400", particle: "#0ea5e9" },
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? CATEGORY_COLORS["general"];
}

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}

function playDone() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(523, ctx.currentTime);
    o.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
    o.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.5);
  } catch (_) { }
}

export function TodoItem({ id, task, startTime, deadline, startedAt, reminderTime, category, status, completed, delayCount, onToggleComplete }: TodoProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const hasNotified = useRef(false);
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(completed || status === "completed");
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(status || "upcoming");
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  const catStyle = getCategoryStyle(category);
  const { refreshXp } = useXp();

  useEffect(() => {
    const unlock = () => { try { getAudioCtx().resume(); } catch (_) { } };
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
    setTimeout(() => setParticles((p) => p.filter((x) => !newParticles.find((n) => n.id === x.id))), 900);
  }, []);

  const triggerCelebration = useCallback((color: string) => {
    spawnParticles(color);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.65 }, colors: [color, "#ffffff", "#10b981"] });
    playDone();
  }, [spawnParticles]);


  const toggleComplete = async (e: React.MouseEvent) => {
    if (!id) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState) setLocalStatus("completed");
    onToggleComplete?.(id, nextState);

    if (nextState) {
      triggerCelebration(catStyle.particle);
      toast.success("Task completed", { description: task });
    }

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextState }),
      });
      if (res.ok) {
        await refreshXp();
        router.refresh();
      }
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
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startedAt: new Date().toISOString(), status: "in_progress" }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setLocalStatus(status);
      toast.error("Failed to start task");
    } finally {
      setLoading(false);
    }
  };

  const delayTask = async (minutes: number) => {
    if (!id) return;
    setLoading(true);
    const updatedStartTime = new Date(Date.now() + minutes * 60000).toISOString();
    let updatedDeadline = undefined;
    if (deadline) {
      updatedDeadline = new Date(new Date(deadline).getTime() + minutes * 60000).toISOString();
    }
    const newDelayCount = (delayCount || 0) + 1;

    setLocalStatus("upcoming"); // visually sets to upcoming while delayed
    toast.success(`Task delayed by ${minutes}m`);

    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: updatedStartTime,
          ...(updatedDeadline && { deadline: updatedDeadline }),
          delayCount: newDelayCount,
          lastDelayedAt: new Date().toISOString(),
          status: "upcoming"
        }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setLocalStatus(status);
      toast.error("Failed to delay task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCompleted || localStatus === "completed") { setTimeLeft("Done!"); return; }

    const calc = () => {
      // Show countdown ONLY if deadline exists and status includes progress or late tracking
      if (deadline && (localStatus === "in_progress" || localStatus === "late")) {
        const d = new Date(deadline).getTime();
        const diff = d - Date.now();
        if (diff <= 0) {
          setTimeLeft("Overdue!");
          if (!hasNotified.current) {
            hasNotified.current = true;
            try {
              if ("Notification" in window && Notification.permission === "granted")
                new Notification("Task Deadline", { body: `${task} is overdue!` });
            } catch (_) { }
            toast.error("Deadline passed!", { description: task });
          }
        } else {
          const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      } else {
        setTimeLeft(""); // Clear timer
      }
    };

    const t = setInterval(calc, 1000);
    calc();
    return () => clearInterval(t);
  }, [deadline, isCompleted, localStatus, task]);

  // Derived styling mappings based on status
  let outerBorder = "border-zinc-200/70 dark:border-zinc-800/80 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/5";
  let opacityAndScale = "opacity-100 scale-100";
  let checkBtnConfig = "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-indigo-400";

  if (isCompleted) {
    outerBorder = "border-emerald-500/20";
    opacityAndScale = "opacity-70 scale-[0.985]";
    checkBtnConfig = "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30";
  } else if (localStatus === "late" || localStatus === "missed") {
    outerBorder = "border-red-400/50 bg-red-50/30 dark:bg-red-950/20 shadow-lg shadow-red-500/5";
    checkBtnConfig = "border-red-300 dark:border-red-800 bg-white dark:bg-zinc-800/60 hover:border-red-500";
  } else if (localStatus === "ready") {
    outerBorder = "border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/20 shadow-lg shadow-amber-500/5 hover:border-amber-500";
    checkBtnConfig = "border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-800/60 hover:border-amber-500";
  } else if (localStatus === "in_progress") {
    outerBorder = "border-indigo-400/50 shadow-md shadow-indigo-500/10 bg-indigo-50/10 dark:bg-indigo-950/10";
    checkBtnConfig = "border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-800/60 hover:border-indigo-500";
  }

  return (
    <>
      <style>{`
        @keyframes fup-todo { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }
        @keyframes todo-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .todo-enter { animation: todo-in .3s ease forwards; }
      `}</style>

      <div className={cn(
        "todo-enter group relative grid grid-cols-1 sm:flex sm:flex-row sm:items-center justify-between gap-y-3 gap-x-4",
        "px-5 py-4 rounded-[1.6rem] border transition-all duration-300 overflow-hidden",
        "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm",
        opacityAndScale,
        outerBorder
      )}>
        {/* Category accent bar */}
        <div className={cn("absolute left-0 top-4 bottom-4 w-1 rounded-full", catStyle.dot)} />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none z-10"
            style={{
              background: p.color,
              left: p.left, top: p.top,
              // @ts-ignore
              "--dx": p.dx + "px", "--dy": p.dy + "px",
              animation: "fup-todo .82s ease-out forwards",
              animationDelay: p.delay + "s",
            }}
          />
        ))}

        {/* ROW 1: Checkbox + Content + Start Button + Status Badge */}
        <div className="flex items-center justify-between w-full">
          {/* Left Block */}
          <div className="flex items-center gap-4 pl-3 flex-1 min-w-0">
            <button
              onClick={toggleComplete}
              disabled={loading}
              className={cn(
                "shrink-0 w-9 h-9 rounded-[0.85rem] border-2 flex items-center justify-center transition-all duration-200",
                "disabled:opacity-50 active:scale-90",
                checkBtnConfig
              )}
            >
              {loading
                ? <Loader2 size={14} className="animate-spin text-indigo-400" />
                : isCompleted
                  ? <Check size={16} className="text-white" strokeWidth={3} />
                  : <div className={cn("w-2 h-2 rounded-full transition-colors", catStyle.dot, "opacity-40 group-hover:opacity-80")} />
              }
            </button>

            <div className="min-w-0 flex-1">
              <p className={cn(
                "text-sm font-bold leading-snug tracking-tight transition-all duration-300 truncate",
                isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-100"
              )}>
                {task}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "inline-block text-[9px] font-extrabold tracking-[.18em] uppercase px-2 py-0.5 rounded-md",
                  catStyle.bg, catStyle.text
                )}>
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Right Aligned Block in Row 1 */}
          <div className="flex items-center gap-2 shrink-0">

            {(localStatus === "late" || localStatus === "missed") && !isCompleted && !deadline && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-extrabold tracking-wide border border-red-200/50 dark:border-red-500/20">
                <AlertCircle size={12} /> {localStatus === "missed" ? "Missed" : "Late"}
              </div>
            )}

            {(timeLeft !== "" || isCompleted || localStatus === "in_progress" || localStatus === "upcoming" || localStatus === "ready") && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-[0.9rem] border transition-all duration-500 min-w-auto sm:min-w-[110px] justify-center",
                timeLeft === "Overdue!" || localStatus === "late" || localStatus === "missed"
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/20"
                  : isCompleted || timeLeft === "Done!"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20"
                    : localStatus === "ready" || localStatus === "upcoming"
                      ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20"
                      : "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200/60 dark:border-indigo-800"
              )}>
                <Clock
                  size={13}
                  className={
                    timeLeft === "Overdue!" || localStatus === "late" || localStatus === "missed" ? "text-red-500"
                      : isCompleted ? "text-emerald-500"
                        : localStatus === "ready" || localStatus === "upcoming" ? "text-amber-500"
                          : "text-indigo-400"
                  }
                />
                <span className={cn(
                  "text-xs font-mono font-extrabold tabular-nums whitespace-nowrap",
                  timeLeft === "Overdue!" || localStatus === "late" || localStatus === "missed" ? "text-red-500 animate-pulse"
                    : isCompleted ? "text-emerald-500"
                      : localStatus === "ready" || localStatus === "upcoming" ? "text-amber-600 dark:text-amber-400"
                        : "text-indigo-600 dark:text-indigo-300"
                )}>
                  {isCompleted ? "Done!" : timeLeft || (
                    localStatus === "upcoming"
                      ? (startTime ? `Starts ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Upcoming")
                      : localStatus === "ready"
                        ? "Ready"
                        : "In Progress"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Additional Actions (Only Visible if Applicable) */}
        {!isCompleted && (!startedAt || localStatus === "in_progress") && (
          <div className="flex items-center gap-1.5 pl-14 sm:pl-0 shrink-0 overflow-x-auto w-full sm:w-auto mt-1 sm:mt-0 pb-1 sm:pb-0">
            {!startedAt && (
              <>
                <button
                  onClick={() => delayTask(15)}
                  disabled={loading}
                  className="flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 text-[10px] font-extrabold tracking-wide uppercase hover:bg-orange-100 transition-all active:scale-95 border border-orange-200/50 dark:border-orange-500/20"
                >
                  <Plus size={11} /> 15m
                </button>
                <button
                  onClick={() => delayTask(30)}
                  disabled={loading}
                  className="flex shrink-0 items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 text-[10px] font-extrabold tracking-wide uppercase hover:bg-amber-100 transition-all active:scale-95 border border-amber-200/50 dark:border-amber-500/20"
                >
                  <Plus size={11} /> 30m
                </button>
                {!isCompleted && !startedAt && localStatus !== "in_progress" && (
                  <button
                    onClick={() => startTask()}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold tracking-wide uppercase hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-200/50 dark:border-indigo-500/20"
                  >
                    <Play size={11} fill="currentColor" /> <span className="hidden sm:inline">Start Now</span><span className="sm:hidden">Start</span>
                  </button>
                )}
              </>
            )}

            {localStatus === "in_progress" && id && (
              <Link
                href={`/todos/${id}/sessions`}
                onClick={() => toast("Entering focus mode ≡ƒºá", { description: task })}
                className="flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-[0.9rem] bg-indigo-600 text-white text-[10px] font-extrabold tracking-widest uppercase hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-500/20 whitespace-nowrap"
              >
                <Play size={11} fill="currentColor" /> Focus
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
