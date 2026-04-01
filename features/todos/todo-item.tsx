"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clock, Check, Plus, Play, Loader2, Flame, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useXp } from "@/components/providers/xp-provider";

interface TodoProps {
  id?: string;
  task: string;
  startTime?: Date | string | null;
  reminderTime: Date | string | null;
  category: string;
  status: string;
  completed?: boolean;
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
  fitness:   { bg: "bg-orange-500/10",  text: "text-orange-500",  dot: "bg-orange-400",  particle: "#f97316" },
  health:    { bg: "bg-rose-500/10",    text: "text-rose-500",    dot: "bg-rose-400",    particle: "#f43f5e" },
  work:      { bg: "bg-indigo-500/10",  text: "text-indigo-500",  dot: "bg-indigo-400",  particle: "#6366f1" },
  finance:   { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-400", particle: "#10b981" },
  learning:  { bg: "bg-amber-500/10",   text: "text-amber-500",   dot: "bg-amber-400",   particle: "#f59e0b" },
  mindset:   { bg: "bg-purple-500/10",  text: "text-purple-500",  dot: "bg-purple-400",  particle: "#a855f7" },
  general:   { bg: "bg-sky-500/10",     text: "text-sky-500",     dot: "bg-sky-400",     particle: "#0ea5e9" },
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
  } catch (_) {}
}

export function TodoItem({ id, task, startTime, reminderTime, category, status, completed, onToggleComplete }: TodoProps) {
  const [timeLeft, setTimeLeft]       = useState("");
  const hasNotified                   = useRef(false);
  const [isCompleted, setIsCompleted] = useState(completed || status === "completed");
  const [loading, setLoading]         = useState(false);
  const [particles, setParticles]     = useState<Particle[]>([]);
  const particleId                    = useRef(0);
  const safeDate                      = startTime ? new Date(startTime) : new Date(reminderTime ? reminderTime : Date.now() + 3600000);
  const [currentTime, setCurrentTime] = useState(isNaN(safeDate.getTime()) ? new Date() : safeDate);
  const catStyle                      = getCategoryStyle(category);
  const { refreshXp }                 = useXp();

  useEffect(() => {
    const unlock = () => { try { getAudioCtx().resume(); } catch (_) {} };
    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, []);

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

  useEffect(() => {
    setIsCompleted(completed || status === "completed");
  }, [completed, status]);

  const toggleComplete = async (e: React.MouseEvent) => {
    if (!id) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);
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
      }
    } catch {
      setIsCompleted(!nextState);
      toast.error("Failed to update task");
    }
  };

  const extendTime = async (minutes: number) => {
    if (!id) return;
    setLoading(true);
    const now = new Date();
    const base = currentTime > now ? currentTime : now;
    const newDate = new Date(base.getTime() + minutes * 60000);
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: newDate.toISOString(), extraTime: minutes }),
      });
      if (res.ok) { setCurrentTime(newDate); setTimeLeft(""); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isCompleted) { setTimeLeft("Done!"); return; }
    const calc = () => {
      if (!currentTime || isNaN(currentTime.getTime())) { setTimeLeft("Invalid"); return; }
      const diff = currentTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Time's up!");
        if (!hasNotified.current) {
          hasNotified.current = true;
          try {
            if ("Notification" in window && Notification.permission === "granted")
              new Notification("Task Reminder", { body: `${task} is due now!` });
          } catch (_) {}
          toast.error("Time's up!", { description: task });
        }
        return;
      }
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    const t = setInterval(calc, 1000);
    calc();
    return () => clearInterval(t);
  }, [currentTime, isCompleted, task]);

  const isTimeUp = timeLeft === "Time's up!";

  return (
    <>
      <style>{`
        @keyframes fup-todo { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }
        @keyframes todo-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .todo-enter { animation: todo-in .3s ease forwards; }
      `}</style>

      <div className={cn(
        "todo-enter group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        "px-5 py-4 rounded-[1.6rem] border transition-all duration-300 overflow-hidden",
        "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm",
        isCompleted
          ? "border-emerald-500/20 opacity-70 scale-[0.985]"
          : isTimeUp
          ? "border-red-400/40 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-500/5"
          : "border-zinc-200/70 dark:border-zinc-800/80 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/5"
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

        {/* Left: checkbox + content */}
        <div className="flex items-center gap-4 pl-3 flex-1 min-w-0">
          <button
            onClick={toggleComplete}
            disabled={loading}
            className={cn(
              "shrink-0 w-9 h-9 rounded-[0.85rem] border-2 flex items-center justify-center transition-all duration-200",
              "disabled:opacity-50 active:scale-90",
              isCompleted
                ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-indigo-400"
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
            <span className={cn(
              "inline-block mt-1 text-[9px] font-extrabold tracking-[.18em] uppercase px-2 py-0.5 rounded-md",
              catStyle.bg, catStyle.text
            )}>
              {category}
            </span>
          </div>
        </div>

        {/* Right: timer + actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-3 sm:pl-0">
          {/* Extend time buttons */}
          {isTimeUp && !isCompleted && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-3 duration-500">
              <button
                onClick={() => extendTime(10)}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 text-[10px] font-extrabold tracking-wide uppercase hover:bg-orange-100 transition-all active:scale-95 border border-orange-200/50 dark:border-orange-500/20"
              >
                <Plus size={11} /> 10m
              </button>
              <button
                onClick={() => extendTime(15)}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 text-[10px] font-extrabold tracking-wide uppercase hover:bg-amber-100 transition-all active:scale-95 border border-amber-200/50 dark:border-amber-500/20"
              >
                <Plus size={11} /> 15m
              </button>
            </div>
          )}

          {/* Focus button */}
          {!isCompleted && id && (
            <Link
              href={`/todos/${id}/sessions`}
              onClick={() => toast("Entering focus mode ≡ƒºá", { description: task })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[0.9rem] bg-indigo-600 text-white text-[10px] font-extrabold tracking-widest uppercase hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-500/20 whitespace-nowrap"
            >
              <Play size={11} fill="currentColor" />
              Focus
            </Link>
          )}

          {/* Timer badge */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-[0.9rem] border transition-all duration-500 min-w-[110px] justify-center",
            isTimeUp
              ? "bg-red-50 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/20"
              : isCompleted
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20"
              : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200/60 dark:border-zinc-800"
          )}>
            <Clock
              size={13}
              className={isTimeUp ? "text-red-500" : isCompleted ? "text-emerald-500" : "text-zinc-400"}
            />
            <span className={cn(
              "text-xs font-mono font-extrabold tabular-nums",
              isTimeUp ? "text-red-500 animate-pulse" : isCompleted ? "text-emerald-500" : "text-zinc-600 dark:text-zinc-300"
            )}>
              {timeLeft}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
