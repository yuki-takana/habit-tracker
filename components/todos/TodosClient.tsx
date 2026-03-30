"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Flame, Shield, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { AddTodoModal } from "@/features/todos/add-todo-modal"
import { TodoItem } from "@/features/todos/todo-item"

type Filter = "all" | "pending" | "done" | "overdue"

interface Todo {
  id: string
  task: string
  startTime: Date | string | null
  reminderTime: string | Date | null
  category: string
  status: string
  completed: boolean
  completedAt?: Date | string | null
  plannedTime?: number | null
}

export function TodosClient({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [filter, setFilter] = useState<Filter>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Tick every second to keep overdue counts live
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const isOverdue = (todo: Todo) =>
    !todo.completed && todo.startTime && new Date(todo.startTime).getTime() < Date.now()

  const filtered = todos.filter(t => {
    if (filter === "done") return t.completed
    if (filter === "pending") return !t.completed && !isOverdue(t)
    if (filter === "overdue") return isOverdue(t)
    return true
  })

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed && !isOverdue(t)).length,
    overdue: todos.filter(t => isOverdue(t)).length,
  }

  const handleToggle = useCallback((id: string, completed: boolean) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed, status: completed ? "completed" : "pending" } : t)
    )
  }, [])

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  })

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-none">
              Daily Focus
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">{today}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-black tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Todo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", val: stats.total, color: "text-indigo-400" },
            { label: "Done", val: stats.done, color: "text-emerald-400" },
            { label: "Pending", val: stats.pending, color: "text-amber-400" },
            { label: "Overdue", val: stats.overdue, color: "text-red-400" },
          ].map(s => (
            <div
              key={s.label}
              className="bg-zinc-900 border border-zinc-800 rounded-[16px] px-4 py-3"
            >
              <p className="text-[9px] font-black tracking-[.16em] uppercase text-zinc-600 mb-1">
                {s.label}
              </p>
              <p className={cn("text-2xl font-black leading-none", s.color)}>
                {s.val}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-[9px] font-black tracking-widest uppercase text-zinc-600 mb-1.5">
              <span>Progress</span>
              <span>{Math.round((stats.done / stats.total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "done", "overdue"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-[10px] text-[11px] font-700 uppercase tracking-wider border transition-all",
                filter === f
                  ? "bg-indigo-950 border-indigo-700/50 text-indigo-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              )}
            >
              {f}
              {f === "overdue" && stats.overdue > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-4xl">
              <p className="text-[11px] font-black tracking-[.2em] uppercase text-zinc-700">
                {filter === "done" ? "Nothing completed yet" :
                 filter === "overdue" ? "No overdue todos" :
                 "No todos yet — add one above"}
              </p>
            </div>
          ) : (
            filtered.map(todo => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                task={todo.task}
                startTime={todo.startTime}
                reminderTime={todo.reminderTime}
                category={todo.category}
                status={todo.status}
                completed={todo.completed}
                onToggleComplete={handleToggle}
              />
            ))
          )}
        </div>

        {/* All done banner */}
        {stats.total > 0 && stats.done === stats.total && (
          <div className="mt-8 p-6 rounded-4xl bg-emerald-950/40 border border-emerald-800/30 text-center">
            <p className="text-lg font-black uppercase tracking-tight text-emerald-400 mb-1">
              All done today
            </p>
            <p className="text-sm text-emerald-700">
              Streak keeps going. Rest up and come back stronger.
            </p>
          </div>
        )}

      </div>

      <AddTodoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}