"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X } from "lucide-react";
import ChallengeForm from "@/components/challenges/challenge-form";
import { toast } from "sonner";

interface ActiveChallenge {
  id: string;
  title: string;
  focus: string;
  durationDays: number;
  startDate: string;
  status: string;
}

interface ChallengeModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Optional: pass already-fetched active challenges to skip the internal fetch */
  activeChallenges?: ActiveChallenge[];
  /** Called after a challenge is successfully created/replaced */
  onSuccess?: () => void;
}

export default function ChallengeModal({
  open,
  onClose,
  activeChallenges: externalChallenges,
  onSuccess,
}: ChallengeModalProps) {
  const [challenges, setChallenges] = useState<ActiveChallenge[]>(
    externalChallenges ?? []
  );

  // If caller didn't supply challenges, fetch them when modal opens
  useEffect(() => {
    if (!open || externalChallenges !== undefined) return;
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data))
          setChallenges(data.filter((c) => c.status === "active"));
      })
      .catch(() => {});
  }, [open, externalChallenges]);

  // Keep in sync if caller updates externally
  useEffect(() => {
    if (externalChallenges !== undefined) setChallenges(externalChallenges);
  }, [externalChallenges]);

  function handleSuccess() {
    onClose();
    onSuccess?.();
    toast.success("Challenge deployed! AI will factor it into your daily plan.");
  }

  const active = challenges[0];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 ">
          <div className="flex min-h-full items-center justify-center p-4 py-10 bg-black/50 backdrop-blur-sm">
            {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative z-10 w-full max-h-[90vh] max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  {active ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                        Active Challenge
                      </p>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                        {active.title}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        New Challenge
                      </p>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                        Start a Sprint
                      </p>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active challenge progress bar */}
            {active && (() => {
              const daysPassed = Math.max(
                0,
                Math.floor(
                  (Date.now() - new Date(active.startDate).getTime()) / 86400000
                )
              );
              const pct = Math.min(
                100,
                Math.round((daysPassed / active.durationDays) * 100)
              );
              return (
                <div className="mx-6 mt-2 mb-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {active.focus}
                    </span>
                    <span className="text-[10px] font-black text-zinc-400">
                      Day {daysPassed + 1} / {active.durationDays}
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 font-semibold">
                    {pct}% complete
                  </p>
                </div>
              );
            })()}

            {/* Challenge form */}
            <div className="px-6 pb-6">
              <ChallengeForm onSuccess={handleSuccess} />
            </div>
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
