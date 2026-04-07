"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield, LayoutDashboard, Dumbbell, Flame, List, InfoIcon, Code2, Bot, CreditCard, Target } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { getSubscriptionConfig } from '@/app/action'
import { getDashboardSummary } from '@/lib/utils/api'

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, key: "feature_dashboard" },
    // { name: "Workouts", href: "/workouts", icon: Dumbbell, key: "feature_workouts" },
    { name: "Habits", href: "/habits", icon: Flame, key: "feature_habits" },
    { name: "Challenges", href: "/challenges", icon: Target, key: "feature_challenges" },
    { name: "Todos", href: "/todos", icon: List, key: "feature_todos" },
    { name: "Insights", href: "/insights", icon: InfoIcon, key: "feature_insights" },
    { name: "Coding", href: "/coding", icon: Code2 },
    { name: "Blueprint", href: "/blueprint", icon: Bot },
]

export default function DashboardHeader({ isPro, periodEnd }: { isPro: boolean, periodEnd?: Date | null }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const [config, setConfig] = React.useState<any>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)


    // Fetch config for feature gating
    useEffect(() => {
        const fetchConfig = async () => {
            const data = await getSubscriptionConfig()
            const result = await getDashboardSummary()
            setConfig(data)
            setDashboardData(result)
        }
        fetchConfig()
    }, [])

    const filteredNavItems = navItems.filter(item => {
        if (item.href === "/coding") {
            return dashboardData?.keys?.coding === true
        }
        if (!item.key) return true
        if (!config) return true
        return config[item.key] === "true"
    })

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 justify-between md:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                            H
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white lg:hidden">Habit AI</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {isPro && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide uppercase">
                            <Shield size={14} />
                            <span>Pro Max</span>
                            {periodEnd && (
                                <span className="ml-1 opacity-70 normal-case font-medium text-[10px]">
                                    ({Math.max(0, Math.ceil((new Date(periodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d left)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden ">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col pt-6 pb-20 overflow-y-auto min-h-screen">
                        <div className="px-6 mb-8 flex items-center justify-between ">
                            <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                                    H
                                </div>
                                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Habit AI</span>
                            </Link>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-50 dark:bg-zinc-900">
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 space-y-1">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-2">Main Menu</div>
                            {filteredNavItems.map((item) => {
                                const Icon = item.icon
                                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                                            active
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon size={20} className={active ? "text-white" : "opacity-70"} />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {!isPro && (
                            <div className="px-6 mt-6">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <h4 className="font-bold mb-1">Unlock Productivity</h4>
                                    <p className="text-xs text-white/80 mb-3">Get unlimited habits, AI generation & detailed analytics.</p>
                                    <Link href="/billing" className="block w-full text-center py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
                                        Upgrade Now
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
