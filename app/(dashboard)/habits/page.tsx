"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles, Activity, CheckCircle, RefreshCcw, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { AddHabitModal } from "@/features/habits/add-habit-modal";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/api/useHabits";
import { habitsApi, subscriptionApi } from "@/lib/api/services";

export default function HabitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limits, setLimits] = useState<any>(null);
  
  const { habits, isLoading: loading, mutate } = useHabits();
  const habitsArray = Array.isArray(habits) ? habits : [];
  const fetchLimits = async () => {
    try {
      const data = await subscriptionApi.getLimits();
      setLimits(data);
    } catch (e) { console.error(e); }
  };

  const handleSync = async (habitId: string) => {
    try {
      await habitsApi.sync(habitId);
      toast.success("Synced to Daily Todos!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sync");
    }
  };

  const handleDelete = (id: string) => {
    toast("Delete this ritual?", {
      description: "All progress will be lost forever.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await habitsApi.delete(id);
            toast.success("Ritual removed");
            mutate();
          } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  const handleLog = async (habitId: string) => {
    try {
      await habitsApi.log(habitId);
      toast.success("Session logged!");
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">Atomic Habits</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Daily Rituals</h1>
          <p className="text-slate-500 text-lg mt-1">Small wins lead to massive transformations.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-14 w-full md:w-auto px-6 rounded-2xl bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-bold"
        >
          <Plus size={20} />
          <span>New Ritual</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <UflLoaderInline style="flip" />
          <p className="text-slate-500 font-medium text-lg">Loading your rituals...</p>
        </div>
      ) : habitsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habitsArray.map((habit) => (
            <div key={habit.id} className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{habit.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">{habit.category}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Activity size={20} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Consistency</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{habit._count?.logs || 0} Sessions</span>
                  </div>
                </div>
                {habit.autoCreateTodos && (
                  <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                      <RefreshCcw size={10} className="animate-spin-slow" />
                      Auto-Sync
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => handleLog(habit.id)}
                  disabled={habit.logs && habit.logs.length > 0}
                  className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${habit.logs && habit.logs.length > 0
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                >
                  {habit.logs && habit.logs.length > 0 ? (
                    <>
                      <CheckCircle size={14} />
                      Completed
                    </>
                  ) : (
                    <>
                      <Activity size={14} />
                      Log Session
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSync(habit.id)}
                  className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all flex items-center justify-center"
                  title="Sync to Daily Todo"
                >
                  <Target size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/10">
          <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-900 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/5">
            <Activity className="text-indigo-500" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No rituals yet</h3>
          <p className="text-slate-500 text-center max-w-sm mb-10 text-lg">
            Consistency is the secret sauce. Start your first daily ritual now.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.98]"
          >
            Create Your First Habit
          </button>
        </div>
      )}

      <AddHabitModal
        isOpen={isModalOpen}
        limits={limits}
        onClose={() => {
          setIsModalOpen(false);
          mutate();
          fetchLimits();
        }}
      />
    </div>
  );
}