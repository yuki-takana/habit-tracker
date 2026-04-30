"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, Tag } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiClient } from "@/lib/api-client";

export function AddTodoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [category, setCategory] = useState("Code");
  const [hours, setHours] = useState("09");
  const [minutes, setMinutes] = useState("00");
  const [deadlineHours, setDeadlineHours] = useState("23");
  const [deadlineMinutes, setDeadlineMinutes] = useState("59");
  const [loading, setLoading] = useState(false);
  const [plannedTime, setPlannedTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [divideIntoSessions, setDivideIntoSessions] = useState(false);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setIsCalendarOpen(false);
      const future = new Date(Date.now() + 10 * 60000); // Pad +10 mins into the future
      let h = future.getHours();
      let m = future.getMinutes();
      
      const nearest5 = Math.ceil(m / 5) * 5;
      if (nearest5 >= 60) {
        h = (h + 1) % 24;
        m = 0;
      } else {
        m = nearest5;
      }
      
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    // Combine date with local time
    const reminderDate = new Date(date);
    reminderDate.setHours(parseInt(hours));
    reminderDate.setMinutes(parseInt(minutes));
    reminderDate.setSeconds(0);

    const deadlineDate = new Date(date);
    deadlineDate.setHours(parseInt(deadlineHours));
    deadlineDate.setMinutes(parseInt(deadlineMinutes));
    deadlineDate.setSeconds(0);

    setLoading(true);
    try {
      await ApiClient.createTodo({
        task: title,
        category,
        startTime: reminderDate.toISOString(),
        deadline: deadlineDate.toISOString(),
        plannedTime: plannedTime || null,
        sessionDuration: divideIntoSessions ? sessionDuration : null,
        breakTime: divideIntoSessions ? breakTime : null,
      });

      setTitle("");
      setDate(undefined);
      setHours("09");
      setMinutes("00");
      setCategory("Code");
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create todo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm dark:bg-black/40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-8 shadow-2xl dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 overflow-y-auto scroll-smooth custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quick Todo</h2>
                <p className="text-sm text-slate-500">Focus on what matters today.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Task Name</label>
                <input
                  autoFocus
                  placeholder="e.g. 2 hours of Deep Work"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-lg font-medium outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Reminder Window</label>
                    <div className="flex gap-3">
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "flex-1 justify-start text-left font-medium h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                            {date ? format(date, "MMM d") : <span>Date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                            className="rounded-2xl border-none"
                          />
                        </PopoverContent>
                      </Popover>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Select value={hours} onValueChange={setHours}>
                          <SelectTrigger className="w-20 h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold">
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-slate-400 font-bold">:</span>
                        <Select value={minutes} onValueChange={setMinutes}>
                          <SelectTrigger className="w-20 h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Deadline</label>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Select value={deadlineHours} onValueChange={setDeadlineHours}>
                        <SelectTrigger className="w-20 h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold">
                          <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                              {i.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-slate-400 font-bold">:</span>
                      <Select value={deadlineMinutes} onValueChange={setDeadlineMinutes}>
                        <SelectTrigger className="w-20 h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "59"].map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-indigo-500/5">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        <SelectValue placeholder="Select Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium">
                      <SelectItem value="Code">Code</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Planned Time (minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={plannedTime}
                      onChange={(e) => setPlannedTime(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 font-medium outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="divideSessions"
                      checked={divideIntoSessions}
                      onChange={(e) => setDivideIntoSessions(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="divideSessions" className="text-sm font-medium text-slate-700 dark:text-slate-300">Divide into sessions</label>
                  </div>

                  <AnimatePresence>
                    {divideIntoSessions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Session (min)</label>
                            <input
                              type="number"
                              placeholder="25"
                              value={sessionDuration}
                              onChange={(e) => setSessionDuration(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 font-medium outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Break (min)</label>
                            <input
                              type="number"
                              placeholder="5"
                              value={breakTime}
                              onChange={(e) => setBreakTime(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 font-medium outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <UflLoaderInline style="pulse-dots" compact={true} className="mr-2" />}
                {loading ? "Adding..." : "Add to Daily Focus"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

