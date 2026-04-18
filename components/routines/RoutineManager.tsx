"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import RoutineCard from "./RoutineCard";
import RoutineBuilder from "./RoutineBuilder";
import type { Routine } from "@/types/routine";

type View = "list" | "builder" | "create";

// ─── Create Routine Modal ───────────────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void;
  onCreate: (r: Routine) => void;
}

function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [name, setName]           = useState("");
  const [emoji, setEmoji]         = useState("📋");
  const [wakeUpTime, setWakeUp]   = useState("06:00");
  const [description, setDesc]    = useState("");
  const [creating, setCreating]   = useState(false);

  const QUICK_EMOJIS = ["💪", "📚", "🧘", "🌅", "🏃", "💻", "🎯", "🌙", "☀️", "⚡"];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, wakeUpTime, emoji }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${data.data.name}" created!`);
        onCreate(data.data);
      } else {
        toast.error(data.error || "Failed to create routine");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6"
      >
        <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-1">New Routine</h2>
        <p className="text-sm text-zinc-500 mb-5">Create a daily schedule template you can reuse.</p>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Emoji quick pick */}
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                  emoji === e
                    ? "bg-indigo-500/15 ring-2 ring-indigo-500/40"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Name input */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Routine Name *
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Weekday Hustle, Weekend Recovery"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Description
            </label>
            <input
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional short description"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Wake-up time */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Wake-up Time
            </label>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 w-fit">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <input
                type="time"
                value={wakeUpTime}
                onChange={e => setWakeUp(e.target.value)}
                className="bg-transparent text-sm font-bold text-zinc-800 dark:text-zinc-100 border-none focus:outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Sparkles className="w-4 h-4" />
              }
              Create & Edit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Manager ───────────────────────────────────────────────────────────
export default function RoutineManager() {
  const [routines, setRoutines]       = useState<Routine[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<View>("list");
  const [selectedRoutine, setSelected]= useState<Routine | null>(null);
  const [showCreateModal, setCreate]  = useState(false);

  const activeRoutine = routines.find(r => r.isActive);

  const fetchRoutines = useCallback(async () => {
    try {
      const res = await fetch("/api/routines");
      const data = await res.json();
      if (data.success) setRoutines(data.data);
    } catch (err) {
      console.error("Failed to load routines:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  // Called when a card activates → update all isActive flags locally
  function handleActivate(activatedId: string) {
    setRoutines(prev =>
      prev.map(r => ({ ...r, isActive: r.id === activatedId }))
    );
  }

  function handleDelete(deletedId: string) {
    setRoutines(prev => prev.filter(r => r.id !== deletedId));
    if (selectedRoutine?.id === deletedId) {
      setSelected(null);
      setView("list");
    }
  }

  function handleEdit(routine: Routine) {
    setSelected(routine);
    setView("builder");
  }

  function handleBuilderSaved(updated: Routine) {
    setRoutines(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
    setSelected(updated);
  }

  function handleCreated(newRoutine: Routine) {
    setRoutines(prev => [...prev, newRoutine]);
    setCreate(false);
    setSelected(newRoutine);
    setView("builder");
  }

  // ── Builder view ──────────────────────────────────────────────────────────
  if (view === "builder" && selectedRoutine) {
    // Get the latest version from state (may have been updated)
    const latestRoutine = routines.find(r => r.id === selectedRoutine.id) || selectedRoutine;
    return (
      <RoutineBuilder
        routine={latestRoutine}
        onBack={() => { setView("list"); setSelected(null); }}
        onSaved={handleBuilderSaved}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">My Routines</h1>
              <p className="text-sm text-zinc-500 mt-1 wrap-break-word">
                Daily schedule templates. Activate one to guide your AI daily planner.
              </p>
            </div>
            <button
              onClick={() => setCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-black hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>

          {/* Active routine banner */}
          {activeRoutine && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-base shrink-0">
                {activeRoutine.emoji || "📋"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-wider">Active Routine</p>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{activeRoutine.name}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
                <Clock className="w-3 h-3" />
                {activeRoutine.wakeUpTime}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && routines.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-3xl">
              📋
            </div>
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-2">No routines yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Create your first routine to define when you do what — the AI will use it to build your daily plan.
            </p>
            <button
              onClick={() => setCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-black hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Create My First Routine
            </button>
          </motion.div>
        )}

        {/* Routine grid */}
        {!loading && routines.length > 0 && (
          <div className="space-y-3">
            {/* Active first, then sorted by createdAt */}
            {[...routines]
              .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((routine, i) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onActivate={handleActivate}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateModal
            onClose={() => setCreate(false)}
            onCreate={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
