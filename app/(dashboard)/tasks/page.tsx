"use client"
import TaskForm from '@/components/tasks/task-form'
import { TodoItem } from '@/features/todos/todo-item'
import { Target } from 'lucide-react'
import { UflLoaderInline } from '@/components/ui/ufl-loader'
import React, { useEffect, useState } from 'react'

const TasksPage = () => {
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks")
            if (res.ok) {
                const data = await res.json()
                setTasks(data)
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    90-Day Challenge Tasks
                </h1>
                <p className="text-slate-500 text-lg">
                    Long-term goals and milestones for your transformation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <TaskForm />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                        <Target className="text-indigo-500" />
                        Active Milestones
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <UflLoaderInline style="pulse-dots" />
                            <p className="text-slate-500 font-medium">Loading your journey...</p>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="grid gap-4">
                            {tasks.map((task) => (
                                <TodoItem
                                    key={task.id}
                                    id={task.id}
                                    task={task.title}
                                    category={task.category || "General"}
                                    status={task.status || "upcoming"}
                                    completed={task.completed ?? false}
                                    startTime={task.startTime ?? task.startDate ?? null}
                                    deadline={task.endDate ?? task.deadline ?? null}
                                    startedAt={task.startedAt ?? null}
                                    reminderTime={task.reminderTime ? new Date(task.reminderTime) : null}
                                    delayCount={task.delayCount ?? 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center bg-slate-50/30 dark:bg-zinc-900/10">
                            <p className="text-slate-400 mb-0">No long-term tasks set yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TasksPage
