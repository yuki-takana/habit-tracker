"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Save, Trash2, Clock,
  Dumbbell, BookOpen, Briefcase, Heart, Code, Star, Coffee,
  Moon, X, Check, Edit2,
} from "lucide-react";
import { toast } from "sonner";
import type { Routine, RoutineTask } from "@/types/routine";

// ─── Prop types ─────────────────────────────────────────────────────────────
interface RoutineBuilderProps {
  routine: Routine;
  onBack: () => void;
  onSaved: (updated: Routine) => void;
}

// ─── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "fitness", label: "Fitness", icon: Dumbbell, color: "#22c55e" },
  { key: "work", label: "Work", icon: Briefcase, color: "#3b82f6" },
  { key: "health", label: "Health", icon: Heart, color: "#ef4444" },
  { key: "coding", label: "Coding", icon: Code, color: "#8b5cf6" },
  { key: "learning", label: "Learning", icon: BookOpen, color: "#f59e0b" },
  { key: "personal", label: "Personal", icon: Star, color: "#ec4899" },
  { key: "break", label: "Break", icon: Coffee, color: "#f97316" },
  { key: "sleep", label: "Sleep", icon: Moon, color: "#64748b" },
];

const PALETTE_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6",
];

const EMOJI_OPTIONS = ["💪", "📚", "🧘", "🌅", "🏃", "💻", "🎯", "🌙", "☀️", "⚡", "🔥", "🎨"];

function getCategoryConfig(key: string | null) {
  return CATEGORIES.find(c => c.key === key) || { label: "Other", icon: Star, color: "#64748b" };
}

function formatDuration(mins: number) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

// Compute end time from startTime + duration
function endTime(start: string, duration: number) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + duration;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

// ─── Inline task add/edit form ───────────────────────────────────────────────
interface TaskFormProps {
  initial?: Partial<RoutineTask>;
  onSave: (data: Omit<RoutineTask, "id" | "order">) => void;
  onCancel: () => void;
}

function TaskForm({ initial, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "work");
  const [startTime, setStart] = useState(initial?.startTime || "08:00");
  const [duration, setDuration] = useState(initial?.duration || 60);
  const [notes, setNotes] = useState(initial?.notes || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Task name is required"); return; }
    onSave({ title: title.trim(), category, startTime, duration, notes: notes.trim() || null });
  }

  const catConfig = getCategoryConfig(category);
  const CatIcon = catConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/8 p-4 mb-3"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task name (e.g. Morning Run)"
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />

        {/* Category grid */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${active
                    ? "text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  style={active ? { backgroundColor: cat.color } : {}}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time + Duration row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStart(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
              Duration — {formatDuration(duration)}
            </label>
            <input
              type="range"
              min={5}
              max={240}
              step={5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>
        </div>

        {/* End time preview */}
        <p className="text-[11px] text-zinc-400 font-medium">
          <span className="font-bold text-zinc-600 dark:text-zinc-400">{startTime}</span>
          {" → "}
          <span className="font-bold text-zinc-600 dark:text-zinc-400">{endTime(startTime, duration)}</span>
          {" "}({formatDuration(duration)})
        </p>

        {/* Notes */}
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            {initial?.id ? "Update Task" : "Add Task"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Main Builder ────────────────────────────────────────────────────────────
export default function RoutineBuilder({ routine, onBack, onSaved }: RoutineBuilderProps) {
  const [name, setName] = useState(routine.name);
  const [description, setDesc] = useState(routine.description || "");
  const [wakeUpTime, setWakeUp] = useState(routine.wakeUpTime);
  const [color, setColor] = useState(routine.color || "#6366f1");
  const [emoji, setEmoji] = useState(routine.emoji || "📋");
  const [tasks, setTasks] = useState<RoutineTask[]>(
    [...routine.tasks].sort((a, b) => a.order - b.order)
  );
  const [showAddForm, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setEmojiP] = useState(false);

  // ── Save metadata ──────────────────────────────────────────────────────────
  async function handleSaveMetadata() {
    if (!name.trim()) { toast.error("Routine name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/routines/${routine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, wakeUpTime, color, emoji }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Routine saved!");
        onSaved(data.data);
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Add task ───────────────────────────────────────────────────────────────
  async function handleAddTask(taskData: Omit<RoutineTask, "id" | "order">) {
    try {
      const res = await fetch(`/api/routines/${routine.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [...prev, data.data].sort((a, b) => a.order - b.order));
        setShowAdd(false);
        toast.success("Task added!");
      } else {
        toast.error(data.error || "Failed to add task");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  // ── Update task ────────────────────────────────────────────────────────────
  async function handleUpdateTask(taskData: Omit<RoutineTask, "id" | "order">) {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/routines/${routine.id}/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data.data } : t));
        setEditingTask(null);
        toast.success("Task updated!");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  // ── Delete task ────────────────────────────────────────────────────────────
  function handleDeleteTask(taskId: string) {
    toast("Delete this task?", {
      description: "It will be removed from your routine plan.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/routines/${routine.id}/tasks/${taskId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
              setTasks(prev => prev.filter(t => t.id !== taskId));
              toast.success("Task removed");
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

  // ── Reorder tasks (drag-end) ───────────────────────────────────────────────
  async function handleReorder(newTasks: RoutineTask[]) {
    const reordered = newTasks.map((t, i) => ({ ...t, order: i }));
    setTasks(reordered);
    try {
      await fetch(`/api/routines/${routine.id}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: reordered.map(t => ({ id: t.id, order: t.order })) }),
      });
    } catch {
      // Silent fail on reorder — UI is already updated
    }
  }

  const totalMins = tasks.reduce((s, t) => s + t.duration, 0);
  const sortedTasks = [...tasks].sort((a, b) => {
    const [ah, am] = a.startTime.split(":").map(Number);
    const [bh, bm] = b.startTime.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Routines
          </button>
          <button
            onClick={handleSaveMetadata}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>

        {/* ── Routine Metadata Card ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 p-5 mb-6 shadow-sm">
          {/* Emoji + Name row */}
          <div className="flex items-start gap-3 mb-4">
            {/* Emoji picker */}
            <div className="relative">
              <button
                onClick={() => setEmojiP(!showEmojiPicker)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all"
                style={{ borderColor: color, backgroundColor: color + "18" }}
              >
                {emoji}
              </button>
              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setEmojiP(false)} />
                  <div className="absolute left-0 top-16 z-20 grid grid-cols-6 gap-1 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    {EMOJI_OPTIONS.map(e => (
                      <button
                        key={e}
                        onClick={() => { setEmoji(e); setEmojiP(false); }}
                        className={`w-8 h-8 rounded-lg text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors ${emoji === e ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Routine name"
                className="w-full bg-transparent text-xl font-black text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:outline-none focus:ring-0 mb-1"
              />
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Short description (optional)"
                rows={2}
                className="w-full bg-transparent text-sm text-zinc-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:outline-none focus:ring-0 resize-none break-words"
              />
            </div>
          </div>

          {/* Color palette */}
          {/* <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {PALETTE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110 border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : c,
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div> */}

          {/* Wake-up time */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Wake-up Time</p>
            <div className="flex items-center gap-2 w-fit bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <input
                type="time"
                value={wakeUpTime}
                onChange={e => setWakeUp(e.target.value)}
                className="bg-transparent text-sm font-bold text-zinc-800 dark:text-zinc-100 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── Tasks Section ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-zinc-800 dark:text-zinc-100">Daily Tasks</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {tasks.length} tasks · {totalMins > 0 ? `${formatDuration(totalMins)} total` : "no time planned"}
              </p>
            </div>
            <button
              onClick={() => { setShowAdd(true); setEditingTask(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>

          {/* Add task form */}
          <AnimatePresence>
            {showAddForm && !editingTask && (
              <TaskForm
                onSave={handleAddTask}
                onCancel={() => setShowAdd(false)}
              />
            )}
          </AnimatePresence>

          {/* Task list (timeline sorted by startTime) */}
          {sortedTasks.length === 0 && !showAddForm ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-400 mb-1">No tasks yet</p>
              <p className="text-xs text-zinc-400">Add tasks to build your daily routine timeline</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task, idx) => {
                const cat = getCategoryConfig(task.category);
                const CatIcon = cat.icon;
                const isEditing = editingTask?.id === task.id;

                return (
                  <div key={task.id}>
                    <AnimatePresence>
                      {isEditing ? (
                        <TaskForm
                          initial={editingTask}
                          onSave={handleUpdateTask}
                          onCancel={() => setEditingTask(null)}
                        />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex gap-3 group"
                        >
                          {/* Timeline left */}
                          <div className="w-12 shrink-0 pt-3 text-right">
                            <span className="text-[11px] font-mono font-bold text-zinc-400 tabular-nums">
                              {task.startTime}
                            </span>
                          </div>

                          {/* Connector with icon */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: cat.color }}
                            >
                              <CatIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            {idx < sortedTasks.length - 1 && (
                              <div className="w-px flex-1 mt-1 bg-zinc-200 dark:bg-zinc-800 min-h-[12px]" />
                            )}
                          </div>

                          {/* Task card */}
                          <div className="flex-1">
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 px-3 py-2.5 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">

                              {/* Row 1: Title + Actions */}
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 break-words flex-1">
                                  {task.title}
                                </p>

                                <div className="flex items-center gap-1 opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={() => { setEditingTask(task); setShowAdd(false); }}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Row 2: Meta */}
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[10px] font-bold text-zinc-400">
                                  {task.startTime} → {endTime(task.startTime, task.duration)}
                                </span>
                                <span className="text-[10px] text-zinc-300 dark:text-zinc-700">·</span>
                                <span className="text-[10px] font-bold text-zinc-400">
                                  {formatDuration(task.duration)}
                                </span>
                              </div>

                              {/* Row 3: Notes (FULL WIDTH) */}
                              {task.notes && (
                                <p className="text-[11px] text-zinc-400 mt-1 italic break-words w-full">
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* + Add task button at bottom */}
          {tasks.length > 0 && !showAddForm && !editingTask && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAdd(true)}
              className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Task
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
