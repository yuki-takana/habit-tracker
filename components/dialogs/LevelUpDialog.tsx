"use client";

import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Trophy, Star, Zap, X } from "lucide-react";

interface LevelUpDialogProps {
  newLevel: number;
  xp: number;
  onClose: () => void;
}

// Map level → flavour text
function getLevelTitle(level: number): string {
  if (level >= 20) return "Legend";
  if (level >= 15) return "Champion";
  if (level >= 10) return "Expert";
  if (level >= 7)  return "Advanced";
  if (level >= 4)  return "Rising Star";
  return "Achiever";
}

function getLevelColor(level: number): string {
  if (level >= 20) return "from-yellow-400 to-amber-600";
  if (level >= 15) return "from-purple-500 to-indigo-600";
  if (level >= 10) return "from-blue-500 to-cyan-500";
  if (level >= 7)  return "from-emerald-400 to-teal-600";
  return "from-indigo-500 to-violet-600";
}

export default function LevelUpDialog({ newLevel, xp, onClose }: LevelUpDialogProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Single light burst — celebratory but not overwhelming
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.55 },
      scalar: 0.9,
      gravity: 1.2,
    });
  }, []);

  const title = getLevelTitle(newLevel);
  const gradient = getLevelColor(newLevel);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in zoom-in-90 fade-in duration-500 ease-out">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">

          {/* Top gradient banner */}
          <div className={`bg-gradient-to-br ${gradient} px-6 pt-8 pb-10 text-center relative overflow-hidden`}>
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />

            {/* Dismiss button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <X size={14} />
            </button>

            {/* Stars decoration */}
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-yellow-300 fill-yellow-300"
                  style={{ animationDelay: `${i * 80}ms`, animation: "pop 0.4s ease-out both" }}
                />
              ))}
            </div>

            {/* Level badge */}
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-4 ring-white/30">
                <span className="text-white font-black text-3xl">{newLevel}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Trophy size={14} className="text-yellow-900" />
              </div>
            </div>

            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Level Up!</p>
            <h2 className="text-white font-black text-2xl leading-tight">{title}</h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-1">
              You've reached <span className="font-bold text-slate-900 dark:text-white">Level {newLevel}</span>!
              Your consistency is paying off 🔥
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
              Total XP: <span className="font-bold text-indigo-500">{xp} XP</span>
            </p>

            <button
              onClick={onClose}
              className={`w-full py-3 rounded-2xl bg-gradient-to-r ${gradient} text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all`}
            >
              <Zap size={16} />
              Let's Keep Going!
            </button>
          </div>
        </div>
      </div>

      {/* Inline keyframe for star pop */}
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
