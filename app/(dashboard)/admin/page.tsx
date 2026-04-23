"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Shield, Smartphone, AlertTriangle, CheckCircle2, ChevronRight, Users, Key, Gamepad2 } from 'lucide-react'
import { UflLoaderInline } from '@/components/ui/ufl-loader'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { getGlobalWhatsappStatus, toggleGlobalWhatsapp, getSubscriptionConfig, updateSubscriptionConfig, getAdminDashboardStats, getGamificationConfig, updateGamificationConfig } from '@/app/action'
import { DEFAULT_SUBSCRIPTION_CONFIG } from '@/lib/constants'
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LEVEL_THRESHOLDS as defaultLevelThresholds } from '@/lib/gamify'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const AdminDashboard = () => {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification' | 'security' | 'notifications'>('dashboard')

    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [subConfig, setSubConfig] = useState(DEFAULT_SUBSCRIPTION_CONFIG as any)
    const [isSavingConfig, setIsSavingConfig] = useState(false)
    const [stats, setStats] = useState<{ totalUsers: number, proUsers: number, freeUsers: number, chartData: any[] } | null>(null)

    // Gamification state
    const [levelThresholds, setLevelThresholds] = useState<any[]>(defaultLevelThresholds)
    const [isSavingGamification, setIsSavingGamification] = useState(false)

    // Security state
    const [targetEmail, setTargetEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    const [notifTitle, setNotifTitle] = useState("Test Todo Reminder")
    const [notifBody, setNotifBody] = useState("test: Your task 'Buy groceries' is starting now. Let's get it done!")
    const [notifUrl, setNotifUrl] = useState("/todos")
    const [isSendingNotif, setIsSendingNotif] = useState(false)

    const adminEmail = "abhisheaurya@gmail.com"

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/")
        }

        if (status === "authenticated" && session?.user?.email !== adminEmail) {
            redirect("/dashboard")
        }

        const fetchStatus = async () => {
            try {
                const [status, config, dashboardStats, gamificationConfig] = await Promise.all([
                    getGlobalWhatsappStatus(),
                    getSubscriptionConfig(),
                    getAdminDashboardStats(),
                    getGamificationConfig()
                ])
                setIsGlobalEnabled(status)
                setSubConfig(config)
                setStats(dashboardStats)
                if (gamificationConfig && Array.isArray(gamificationConfig) && gamificationConfig.length > 0) {
                    setLevelThresholds(gamificationConfig)
                }
            } catch (error) {
                toast.error("Failed to fetch system status or config")
            } finally {
                setIsLoading(false)
            }
        }

        if (status === "authenticated" && session?.user?.email === adminEmail) {
            fetchStatus()
        }
    }, [status, session])

    const handleToggle = async (checked: boolean) => {
        setIsSaving(true)
        try {
            await toggleGlobalWhatsapp(checked)
            setIsGlobalEnabled(checked)
            toast.success(`Global WhatsApp messaging is now ${checked ? 'ENABLED' : 'DISABLED'}`)
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsSaving(false)
        }
    }

    const handleConfigSave = async () => {
        setIsSavingConfig(true)
        try {
            await updateSubscriptionConfig(subConfig)
            toast.success("Subscription configuration updated successfully")
        } catch (error) {
            toast.error("Failed to update subscription configuration")
        } finally {
            setIsSavingConfig(false)
        }
    }

    const handleGamificationSave = async () => {
        setIsSavingGamification(true)
        try {
            // Sort thresholds securely
            const sortedThresholds = [...levelThresholds].sort((a, b) => a.level - b.level)
            await updateGamificationConfig(sortedThresholds)
            toast.success("Gamification settings updated successfully")
        } catch (error) {
            toast.error("Failed to update gamification settings")
        } finally {
            setIsSavingGamification(false)
        }
    }

    const handleSendNotification = async () => {
        if (!notifTitle || !notifBody) {
            toast.error("Title and message required")
            return
        }

        setIsSendingNotif(true)

        try {
            const res = await fetch("/api/admin/send-notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: notifTitle,
                    body: notifBody,
                    url: notifUrl,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to send")
            } else {
                toast.success("Notification sent to all users 🚀")
                setNotifTitle("")
                setNotifBody("")
            }
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setIsSendingNotif(false)
        }
    }

    const handleThresholdChange = (levelIndex: number, xpValue: string) => {
        const newValue = parseInt(xpValue)
        if (isNaN(newValue)) return

        const newThresholds = [...levelThresholds]
        newThresholds[levelIndex].xp = newValue
        setLevelThresholds(newThresholds)
    }

    const handleForcePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters")
            return
        }
        setIsSavingPassword(true)
        try {
            const res = await fetch('/api/admin/user-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetEmail, newPassword })
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Failed to force update password")
            } else {
                toast.success("User password forcefully updated")
                setTargetEmail('')
                setNewPassword('')
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSavingPassword(false)
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <UflLoaderInline style="flip" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-8 px-6 pt-10">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage global system configurations and service status.</p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
                <Button
                    variant={"outline"}
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'dashboard'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Smartphone size={16} />
                    Overview & Gateway
                </Button>
                <Button
                    variant={"outline"}
                    onClick={() => setActiveTab('gamification')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'gamification'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Gamepad2 size={16} />
                    Gamification
                </Button>
                <Button
                    variant={"outline"}
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'security'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Key size={16} />
                    User Security
                </Button>
                <Button
                    variant={"outline"}
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'notifications'
                        ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <Users size={16} />
                    Notifications
                </Button>
            </div>

            {activeTab === 'gamification' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            XP Level Thresholds
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Adjust the amount of lifetime XP required to reach each gamification level. Modifying this affects all users immediately.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {levelThresholds.map((threshold, index) => (
                                <div key={threshold.level} className="flex items-center space-x-4 bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                                    <div className="w-16 font-bold text-slate-700 dark:text-slate-300">Level {threshold.level}</div>
                                    <input
                                        type="number"
                                        disabled={threshold.level === 1}
                                        className="flex-1 h-9 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={threshold.xp}
                                        onChange={(e) => handleThresholdChange(index, e.target.value)}
                                    />
                                    <span className="text-xs text-slate-500 font-medium">XP</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleGamificationSave} disabled={isSavingGamification}>
                                {isSavingGamification ? "Saving Settings..." : "Save Gamification Rules"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Force Password Reset
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            As an administrator, you can override any user's password if they have lost access to their account.
                        </p>

                        <form onSubmit={handleForcePasswordChange} className="space-y-4 max-w-md">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target User Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                    value={targetEmail}
                                    placeholder="user@example.com"
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                    value={newPassword}
                                    placeholder="Min. 6 characters"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <Button type="submit" variant="destructive" disabled={isSavingPassword} className="w-full mt-4">
                                {isSavingPassword ? "Authorizing..." : "Force Reset Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Global WhatsApp Toggle */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden relative">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-5 w-5 text-indigo-500" />
                                        <h3 className="font-bold text-slate-900 dark:text-white">WhatsApp Messaging</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        This is a global master switch. When disabled, no WhatsApp reminders or webhooks will be processed for any user.
                                    </p>
                                </div>
                                <Switch
                                    checked={isGlobalEnabled}
                                    onCheckedChange={handleToggle}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
                                    {isGlobalEnabled ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400 italic">Systems are active and reminders are sending.</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 italic">reminders are currently suspended globally.</span>
                                        </>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-3 uppercase tracking-wider">Default Messaging Provider</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'twilio', label: 'Twilio' },
                                            { id: 'meta', label: 'Meta (Cloud API)' },
                                            { id: 'local', label: 'Local (WhatsApp Web)' }
                                        ].map((provider) => (
                                            <label
                                                key={provider.id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${subConfig.whatsapp_provider === provider.id
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                    : "border-slate-100 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="whatsapp_provider"
                                                    value={provider.id}
                                                    checked={subConfig.whatsapp_provider === provider.id}
                                                    onChange={(e) => setSubConfig({ ...subConfig, whatsapp_provider: e.target.value })}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-bold uppercase tracking-tight">{provider.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Service Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Twilio API</span>
                                    <span className="flex items-center gap-1.5 font-medium text-green-500">
                                        <span className="h-2 w-2 rounded-full bg-green-500" /> Operational
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Meta API</span>
                                    <span className="flex items-center gap-1.5 font-medium text-green-500">
                                        <span className="h-2 w-2 rounded-full bg-green-500" /> Operational
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Cron Jobs</span>
                                    <span className="flex items-center gap-1.5 font-medium text-green-500">
                                        <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Dashboard */}
                    {stats && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-center items-center">
                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize mb-1">Total Users</h3>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</div>
                                </div>
                                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/20 flex flex-col justify-center items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                                    <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize mb-1 relative z-10">Pro Users</h3>
                                    <div className="text-4xl font-black text-indigo-700 dark:text-indigo-300 relative z-10">{stats.proUsers}</div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-center items-center">
                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize mb-1">Free Tier Users</h3>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.freeUsers}</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 h-96">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Signups (Last 30 Days)</h3>
                                <ResponsiveContainer width="100%" height="85%">
                                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 600 }}
                                        />
                                        <Area type="monotone" dataKey="free" name="Free Signups" stroke="#94a3b8" fillOpacity={1} fill="url(#colorFree)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="paid" name="Pro Access" stroke="#6366f1" fillOpacity={1} fill="url(#colorPaid)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            Subscription Pricing & Feature Limits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Pricing (Pro Tier)</h4>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Price (USD)</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.pro_monthly_price_usd}
                                        onChange={(e) => setSubConfig({ ...subConfig, pro_monthly_price_usd: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Price (INR)</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.pro_monthly_price_inr}
                                        onChange={(e) => setSubConfig({ ...subConfig, pro_monthly_price_inr: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yearly Price (USD)</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.pro_yearly_price_usd}
                                        onChange={(e) => setSubConfig({ ...subConfig, pro_yearly_price_usd: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yearly Price (INR)</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.pro_yearly_price_inr}
                                        onChange={(e) => setSubConfig({ ...subConfig, pro_yearly_price_inr: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent Unlock Price (INR)</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.agent_price_inr || "49"}
                                        onChange={(e) => setSubConfig({ ...subConfig, agent_price_inr: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Feature Limits (Free Tier)</h4>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Active Habits</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.free_habit_limit}
                                        onChange={(e) => setSubConfig({ ...subConfig, free_habit_limit: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max AI Blueprint Generations</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                        value={subConfig.free_blueprint_limit}
                                        onChange={(e) => setSubConfig({ ...subConfig, free_blueprint_limit: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Active Payment Gateway</label>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gateway"
                                                value="both"
                                                checked={subConfig.active_payment_gateway === "both"}
                                                onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Both</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gateway"
                                                value="stripe"
                                                checked={subConfig.active_payment_gateway === "stripe"}
                                                onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stripe Only</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gateway"
                                                value="razorpay"
                                                checked={subConfig.active_payment_gateway === "razorpay"}
                                                onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Razorpay Only</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Setting to &quot;Both&quot; lets international users pay with Stripe and Indian users with Razorpay.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-500" />
                                Feature Gating (Global Access Control)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: 'feature_dashboard', label: 'Dashboard Tab' },
                                    { id: 'feature_insights', label: 'Insights Tab' },
                                    { id: 'feature_habits', label: 'Habits Tab' },
                                    { id: 'feature_todos', label: 'Todos Tab' },
                                    { id: 'feature_challenges', label: 'Challenges Tab' },
                                    { id: 'feature_workouts', label: 'Workouts Tab' },
                                ].map((feature) => (
                                    <div key={feature.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feature.label}</span>
                                        <Switch
                                            checked={subConfig[feature.id] === 'true'}
                                            onCheckedChange={(checked) => setSubConfig({ ...subConfig, [feature.id]: String(checked) })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-slate-500 italic">Disabling a feature will hide it from the sidebar and navigation for ALL users.</p>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleConfigSave} disabled={isSavingConfig}>
                                {isSavingConfig ? "Saving..." : "Save Configuration"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Send Push Notification
                        </h3>

                        <p className="text-sm text-slate-500 mb-6">
                            Broadcast a custom notification to all users.
                        </p>

                        <div className="space-y-4 max-w-lg">

                            <Input
                                type="text"
                                placeholder="Notification Title"
                                className="w-full h-10 px-3 rounded-md border dark:bg-zinc-900"
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                            />

                            <Textarea
                                placeholder="Notification Message"
                                className="w-full h-24 px-3 py-2 rounded-md border dark:bg-zinc-900"
                                value={notifBody}
                                onChange={(e) => setNotifBody(e.target.value)}
                            />

                            <Input
                                type="text"
                                placeholder="Redirect URL (e.g. /todos)"
                                className="w-full h-10 px-3 rounded-md border dark:bg-zinc-900"
                                value={notifUrl}
                                onChange={(e) => setNotifUrl(e.target.value)}
                            />

                            <Button onClick={handleSendNotification} disabled={isSendingNotif}>
                                {isSendingNotif ? "Sending..." : "Send to All Users"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
