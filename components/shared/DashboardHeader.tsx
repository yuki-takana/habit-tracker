"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield, LayoutDashboard, Dumbbell, Flame, List, InfoIcon, Code2, Bot, CreditCard, Target } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { getSubscriptionConfig } from '@/app/action'
import { getDashboardSummary } from '@/lib/utils/api'
import { navItems } from './dashboard-sidebar'
import { useSession, signOut } from 'next-auth/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useXp } from '@/components/providers/xp-provider'
import { LogOut, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from "next-themes"

export default function DashboardHeader({ isPro, periodEnd }: { isPro: boolean, periodEnd?: Date | null }) {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = React.useState<any>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const pathname = usePathname()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const { data: session } = useSession()
    const { xp, level } = useXp()
    const { theme, setTheme } = useTheme()

    const userInitials = session?.user?.name
        ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || "U"


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
        <header className="fixed top-4 left-4 right-4 z-40 lg:hidden">
            <div className="flex h-[64px] items-center px-2 py-2 shadow justify-between rounded-2xl bg-background/20 backdrop-blur-sm border border-white/5">
                {/* Left: Menu */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-10 w-11 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors rounded-xl flex items-center justify-center text-foreground ml-1 border border-indigo-500/50"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Center: Title */}
                <Link href="/" className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity">
                    <span className="font-extrabold text-forground text-[15px] leading-tight font-sans tracking-tight">Habit AI</span>
                    <div className="flex items-center gap-1.5 mt-[2px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] opacity-90" />
                        <span className="text-xs text-slate-400 font-medium">Session active</span>
                    </div>
                </Link>

                {/* Right: Badges and User */}
                <div className="flex items-center gap-2 pr-1">
                    {isPro && (
                        <div className="flex flex-col items-center px-3 py-[3px] rounded-xl bg-indigo-500/10 border border-indigo-500/50 max-w-[80px]">
                            <span className="text-xs font-black tracking-widest uppercase text-indigo-500 leading-tight">PRO</span>
                            {/* {periodEnd && (
                                <span className="text-[9px] text-[#5C5C70] font-medium leading-none mt-[2px]">
                                    {Math.max(0, Math.ceil((new Date(periodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d left
                                </span>
                            )} */}
                        </div>
                    )}

                    {/* User Profile */}
                    <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <div className="h-10 w-10 shrink-0 rounded-full bg-[#8B7CFF] flex items-center justify-center cursor-pointer hover:bg-[#7261EB] transition-all text-white font-black text-sm shadow-lg overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    userInitials
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 ml-4">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{session?.user?.name}</p>
                                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Lvl {level} ({xp} XP)
                                        </span>
                                    </div>
                                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">{session?.user?.email}</p>
                                    {session?.user?.phone && (
                                        <p className="text-xs leading-none text-indigo-500 font-medium pt-0.5">{session.user.phone}</p>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setUserMenuOpen(false)}>
                                <Link
                                    href="/dashboard"
                                    className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/dashboard' ? 'text-indigo-500' : ''}`}
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                            {session?.user?.email === "abhisheaurya@gmail.com" && (
                                <DropdownMenuItem onClick={() => setUserMenuOpen(false)}>
                                    <Link
                                        href="/admin"
                                        className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/admin' ? 'text-indigo-500' : ''}`}
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Admin Panel</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setUserMenuOpen(false)}>
                                <Link
                                    href="/settings"
                                    className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/settings' ? 'text-indigo-500' : ''}`}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Profile Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                setTheme(theme === "dark" ? "light" : "dark");
                            }} className="cursor-pointer">
                                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                <span>Toggle Switch Theme</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 dark:text-red-400 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden ">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col pt-6 pb-20 overflow-y-auto min-h-screen">
                        <div className="px-6 mb-8 flex items-center justify-between ">
                            <Link href="/" className="flex items-center gap-3">
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
                                                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon size={20} className={clsx(active ? "text-white" : item.color || "opacity-70")} />
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
