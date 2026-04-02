"use client";

import { useCallback, useRef, useState } from "react";
import { Badge } from "../ui/badge";

const TODOS = [
  "Stop smoking",
  "Drink 2L water",
  "Walk 5k steps",
  "Read 10 pages",
  "Sleep before 12"
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
export default function HabitMobilePreview() {
  const [currentTodoIndex, setCurrentTodoIndex] = useState(0);
  const [emojiProgress, setEmojiProgress] = useState<(string | null)[]>(Array(5).fill(null));
  const [isFaded, setIsFaded] = useState(false);
  const [ticked, setTicked] = useState(false);

  const lockedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    // 1. Tick the checkbox immediately
    setTicked(true);

    // 2. After short tick-hold, advance todo + fill emoji
    setTimeout(() => {
      setTicked(false);

      setEmojiProgress((prev) => {
        const next = [...prev];
        const empty = next.findIndex((e) => e === null);
        if (empty !== -1) {
          next[empty] = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
        }

        if (next.every((e) => e !== null)) {
          // All slots full — play fanfare, fade, reset
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
    }, 220); // hold checkmark for 220 ms — feels snappy but visible
  }, []);

  // const currentTodo = TODOS[currentTodoIndex];

  return (
    <>
      <style>{`
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

      <div className="w-full bg-background text-white flex items-center justify-center px-4">
        <div className="w-full flex flex-col gap-5">
          <div className="text-center mb-10 relative">

            <div className="flex justify-center mb-4">
              <Badge
                variant="outline"
                className="gap-2 px-3 py-1 text-[10px] font-bold tracking-widest uppercase border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                Try It Now
              </Badge>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none mb-3 text-foreground">
              Build habits.<br />
              <span className="text-indigo-600 dark:text-indigo-400">Watch them grow.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
              Complete your daily todos and watch your tree evolve — this is your actual dashboard experience.
            </p>
          </div>
          <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2">
            {/* Top hint */}
            <div className="w-full flex justify-end pr-2">
              <span className="text-xs text-gray-400 relative">
                Tick habits...
                <span className="absolute -bottom-4 right-1 text-lg rotate-45">↘</span>
              </span>
            </div>

            {/* Todo card */}
            <div
              onClick={handleComplete}
              className={`w-full rounded-2xl px-4 py-5 flex items-center justify-between cursor-pointer active:scale-[0.97] transition-all duration-200 select-none ${ticked
                ? "bg-emerald-500/20 border border-emerald-500/40"
                : "bg-[#2a3441] border border-transparent"
                }`}
            >
              <span
                className={`text-base font-semibold transition-all duration-200 ${ticked
                  ? "line-through text-emerald-400/60"
                  : "text-gray-200"
                  }`}
              >
                {TODOS[currentTodoIndex]}
              </span>

              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ml-3 ${ticked
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-transparent border-gray-400"
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

            {/* Middle hint */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-emerald-400 text-xs font-semibold">
                To grow a garden!
              </span>
              <span className="text-emerald-400 text-lg -mt-1">↙</span>
            </div>

            {/* Emoji progress */}
            <div className="w-full bg-[#2a3441] rounded-2xl px-2 py-5 flex justify-between items-center">
              {emojiProgress.map((emoji, i) => (
                <div
                  key={`${i}-${emoji}`} // key changes when emoji fills → triggers re-mount → animation fires
                  className={`flex-1 flex justify-center text-xl transition-all duration-500 ${isFaded ? "opacity-20 scale-90" : "opacity-100"
                    } ${emoji ? "emoji-in" : ""}`}
                >
                  {emoji ?? <span className="opacity-20">🌱</span>}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}