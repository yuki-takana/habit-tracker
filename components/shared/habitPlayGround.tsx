"use client";

import { useCallback, useRef, useState } from "react";
import { Badge } from "../ui/badge";

const TODOS = [
  "Stop smoking",
  "Drink 2L water",
  "Walk 5k steps",
  "Read 10 pages",
  "Sleep before 12",
];

const EMOJI_POOL = ["🌱", "🌿", "🌷", "🌻", "🌳", "🌲", "🌼", "🍀"];

let audioCtx: AudioContext | null = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function playTick() {
  try {
    const ctx = getAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(523, ctx.currentTime);
    o.frequency.setValueAtTime(659, ctx.currentTime + 0.07);
    o.frequency.setValueAtTime(784, ctx.currentTime + 0.14);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch (_) { }
}
function playAllDone() {
  try {
    const ctx = getAudioContext();
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.085;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch (_) { }
}

// Arrow curving down-left (top hint → todo card)
function ArrowDownLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 70"
      width="52"
      height="46"
      fill="none"
      aria-hidden
      className="text-emerald-400 shrink-0"
    >
      <path
        d="M62 6 C54 2, 30 8, 18 28 C10 42, 12 55, 16 62"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="120"
        strokeDashoffset="120"
        style={{ animation: "drawArrow 0.7s ease forwards" }}
      />
      <path
        d="M16 62 C13 54, 8 52, 4 54"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        style={{ animation: "drawArrow 0.25s ease 0.65s forwards" }}
      />
      <path
        d="M16 62 C18 54, 22 52, 26 56"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        style={{ animation: "drawArrow 0.25s ease 0.65s forwards" }}
      />
    </svg>
  );
}

// Same arrow, flipped horizontally → curves down-right (todo card → emoji row)
function ArrowDownRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 70"
      width="52"
      height="46"
      fill="none"
      aria-hidden
      className="text-gray-400 shrink-0"
      style={{ transform: "scaleX(-1)" }}
    >
      <path
        d="M62 6 C54 2, 30 8, 18 28 C10 42, 12 55, 16 62"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="120"
        strokeDashoffset="120"
        style={{ animation: "drawArrow 0.7s ease 0.15s forwards" }}
      />
      <path
        d="M16 62 C13 54, 8 52, 4 54"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        style={{ animation: "drawArrow 0.25s ease 0.8s forwards" }}
      />
      <path
        d="M16 62 C18 54, 22 52, 26 56"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        style={{ animation: "drawArrow 0.25s ease 0.8s forwards" }}
      />
    </svg>
  );
}

export default function HabitMobilePreview() {
  const [currentTodoIndex, setCurrentTodoIndex] = useState(0);
  const [emojiProgress, setEmojiProgress] = useState<(string | null)[]>(
    Array(5).fill(null)
  );
  const [isFaded, setIsFaded] = useState(false);
  const [ticked, setTicked] = useState(false);
  const lockedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setTicked(true);

    setTimeout(() => {
      setTicked(false);

      setEmojiProgress((prev) => {
        const next = [...prev];
        const empty = next.findIndex((e) => e === null);
        if (empty !== -1) {
          next[empty] =
            EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        }

        if (next.every((e) => e !== null)) {
          playAllDone();
          setIsFaded(true);
          setTimeout(() => {
            setEmojiProgress(Array(5).fill(null));
            setIsFaded(false);
            lockedRef.current = false;
          }, 1000);
        } else {
          playTick();
          lockedRef.current = false;
        }

        return next;
      });

      setCurrentTodoIndex((prev) => (prev + 1) % TODOS.length);
    }, 220);
  }, []);

  const filledCount = emojiProgress.filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes drawArrow { to { stroke-dashoffset: 0; } }

        @keyframes tickPop {
          0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.25) rotate(4deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
        }
        .tick-pop { animation: tickPop 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        @keyframes emojiIn {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          70%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1)  rotate(0deg);  opacity: 1; }
        }
        .emoji-in { animation: emojiIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <div className="w-full bg-background text-foreground">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center pt-16 pb-10 px-6">
          <div className="flex justify-center mb-4">
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1 text-[10px] font-bold tracking-widest capitalize border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Try It Now
            </Badge>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter capitalize leading-none mb-3 text-foreground">
            Build habits.<br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Watch them grow.
            </span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
            Complete your daily todos and watch your tree evolve — this is your
            actual dashboard experience.
          </p>
        </div>

        {/* ── Interactive demo ─────────────────────────────────────── */}
        <div className="flex justify-center px-6 pb-16">
          <div className="w-full max-w-sm flex flex-col">

            {/* Top hint row — label left, arrow right-aligned curving down-left */}
            <div className="flex items-end justify-between mb-2 px-1">
              <span className="text-[11px] font-semibold text-muted-foreground/70 tracking-wide uppercase">
                Today's habit
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground italic">
                  Tick habits...
                </span>
                <ArrowDownRight />
              </div>
            </div>

            {/* ── Todo card ── */}
            <div
              onClick={handleComplete}
              className={`w-full rounded-2xl px-5 py-5 flex items-center justify-between cursor-pointer active:scale-[0.97] transition-all duration-200 select-none ${ticked
                  ? "bg-emerald-500/15 border border-emerald-500/40"
                  : "bg-white dark:bg-zinc-800/80 border  hover:border-zinc-600/40"
                }`}
            >
              <span
                className={`text-base font-semibold transition-all duration-200 leading-snug ${ticked
                    ? "line-through text-emerald-400/50"
                    : "text-foreground/80 dark:text-zinc-100"
                  }`}
              >
                {TODOS[currentTodoIndex]}
              </span>

              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ml-4 ${ticked
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-transparent border-zinc-500 dark:border-zinc-500"
                  }`}
              >
                {ticked && (
                  <svg
                    className="tick-pop"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                  >
                    <path
                      d="M2 6.5l3.5 3.5 5.5-6"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Middle hint row — arrow left curving down-right, label right */}
            <div className="flex items-start justify-between mt-2 mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft />
                <span className="text-[11px] font-semibold text-emerald-400 italic mt-1">
                  To grow a garden!
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground/50 mt-1 tracking-wide">
                {filledCount}/5 today
              </span>
            </div>

            {/* ── Emoji progress row ── */}
            <div
              className={`w-full bg-background border dark:bg-zinc-800/80 rounded-2xl px-3 py-5 flex justify-between items-center transition-all duration-500 ${isFaded ? "opacity-20 scale-[0.97]" : "opacity-100 scale-100"
                }`}
            >
              {emojiProgress.map((emoji, i) => (
                <div
                  key={`${i}-${emoji}`}
                  className={`flex-1 flex flex-col items-center gap-1 ${emoji ? "emoji-in" : ""
                    }`}
                >
                  <span className={`text-2xl ${!emoji ? "opacity-20" : ""}`}>
                    {emoji ?? "🌱"}
                  </span>
                  {/* tiny dot indicator below each slot */}
                  <span
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${emoji
                        ? "bg-emerald-400"
                        : "bg-zinc-600 dark:bg-zinc-600"
                      }`}
                  />
                </div>
              ))}
            </div>

            {/* Bottom label */}
            <p className="text-center text-[10px] text-muted-foreground/40 font-medium mt-3 tracking-widest uppercase">
              Your garden grows with every habit
            </p>

          </div>
        </div>

      </div>
    </>
  );
}