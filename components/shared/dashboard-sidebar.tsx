"use client"

import { Code2, Dumbbell, Flame, InfoIcon, LayoutDashboard, List, Bot, CreditCard, Target } from 'lucide-react';
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import Link from 'next/link';
import { getSubscriptionConfig } from '@/app/action';
import { getDashboardSummary } from '@/lib/utils/api';

export const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        key: "feature_dashboard"
    },
    // {
    //     name: "Workouts",
    //     href: "/workouts",
    //     icon: Dumbbell,
    //     key: "feature_workouts"
    // },
    {
        name: "Todos",
        href: "/todos",
        icon: List, key:
            "feature_todos"
    },
    {
        name: "Habits",
        href: "/habits",
        icon: Flame,
        key: "feature_habits"
    },
    {
        name: "Challenges",
        href: "/challenges",
        icon: Target,
        key: "feature_challenges"
    },
    {
        name: "Daily Goals",
        href: "/daily-goals",
        icon: Bot,
        key: "feature_daily_goals"
    },
    {
        name: "Insights",
        href: "/insights",
        icon: InfoIcon,
        key: "feature_insights"
    },
    {
        name: "Coding",
        href: "/coding",
        icon: Code2
    },
    {
        name: "Blueprint",
        href: "/blueprint",
        icon: Bot
    },
];

const DashboardSidebar = ({isPro}:{ isPro: boolean}) => {
    const pathname = usePathname()
    const [config, setConfig] = React.useState<any>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const subConfig = await getSubscriptionConfig()
            setConfig(subConfig)

            const result = await getDashboardSummary()
            setDashboardData(result)
        }

        fetchData()
    }, [])
    const filteredNavItems = navItems.filter(item => {
        if (item.href === "/coding") {
            return dashboardData?.keys?.coding === true
        }

        if (!item.key) return true
        if (!config) return true

        return config[item.key] === "true"
    })

    return (
        <>
            {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────────────────── */}
            <aside className="hidden lg:flex fixed left-0 h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-6">
                <nav className="space-y-1 flex-1 mt-4">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    active
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-900"
                                )}
                            >
                                <Icon size={20} className="shrink-0" />
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
            </aside>

        </>
    )
}

export default DashboardSidebar