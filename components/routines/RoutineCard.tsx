"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, Edit2, Trash2, Zap, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Routine, RoutineTask } from "@/types/routine";

interface RoutineCardProps {
  routine: Routine;
  onEdit: (r: Routine) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness:  "bg-green-500",
  work:     "bg-blue-500",
  health:   "bg-red-500",
  coding:   "bg-violet-500",
  learning: "bg-amber-500",
  personal: "bg-pink-500",
  break:    "bg-orange-400",
  default:  "bg-zinc-400",
};

function getCategoryColor(cat: string | null) {
  return CATEGORY_COLORS[cat?.toLowerCase() || "default"] || CATEGORY_COLORS.default;
}

function formatDuration(mins: number) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

function totalRoutineDuration(tasks: RoutineTask[]) {
  return tasks.reduce((sum, t) => sum + t.duration, 0);
}

export default function RoutineCard({ routine, onEdit, onDelete, onActivate, index }: RoutineCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activating, setActivating] = useState(false);

  const accentColor = routine.color || "#6366f1";
  const totalMins = totalRoutineDuration(routine.tasks);

  async function handleActivate() {
    setActivating(true);
    try {
      const res = await fetch(`/api/routines/${routine.id}/activate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onActivate(routine.id);
      } else {
        toast.error(data.error || "Failed to activate");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActivating(false);
    }
  }

  function handleDelete() {
    toast(`Delete "${routine.name}"?`, {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/routines/${routine.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
              toast.success("Routine deleted");
              onDelete(routine.id);
            } else {
              toast.error(data.error || "Failed to delete");
            }
          } catch {
            toast.error("Something went wrong");
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`relative group rounded-2xl border overflow-hidden transition-all duration-200 ${
        routine.isActive
          ? "border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-500/8 shadow-md shadow-indigo-500/10"
          : "border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
      }`}
    >
      {/* Active accent top bar */}
      {routine.isActive && (
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}

      {/* Color dot on left edge */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full opacity-70"
        style={{ backgroundColor: accentColor }}
      />

      <div className="px-5 py-4 pl-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl leading-none shrink-0">{routine.emoji || "📋"}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                  {routine.name}
                </h3>
                {routine.isActive && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
                    Active
                  </span>
                )}
              </div>
              {routine.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 word-break">
                  {routine.description}
                </p>
              )}
            </div>
          </div>

          {/* 3-dot menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(routine); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); handleDelete(); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Wake {routine.wakeUpTime}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {routine.tasks.length} tasks
          </span>
          {totalMins > 0 && (
            <span>{formatDuration(totalMins)} planned</span>
          )}
        </div>

        {/* Task preview — category color dots */}
        {routine.tasks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {routine.tasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1"
                title={`${task.title} — ${task.startTime} (${task.duration}m)`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(task.category)}`} />
                <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 truncate max-w-[80px]">
                  {task.title}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{task.startTime}</span>
              </div>
            ))}
            {routine.tasks.length > 8 && (
              <div className="flex items-center px-2 py-1 text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                +{routine.tasks.length - 8} more
              </div>
            )}
          </div>
        )}

        {/* Empty task state */}
        {routine.tasks.length === 0 && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 italic mb-4">
            No tasks yet — click Edit to add your daily tasks
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(routine)}
            className="flex-1 text-xs font-bold py-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3 h-3" />
            Edit Routine
          </button>

          {routine.isActive ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-xs font-black border border-indigo-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </div>
          ) : (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {activating ? (
                <div className="w-3 h-3 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              Activate
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
