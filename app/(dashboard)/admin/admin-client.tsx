"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Shield, Smartphone, AlertTriangle, Gamepad2, Key, Bell } from 'lucide-react'
import { UflLoaderInline } from '@/components/ui/ufl-loader'
import { Switch } from "@/components/ui/switch"
import {
    getGlobalWhatsappStatus, toggleGlobalWhatsapp,
    getSubscriptionConfig, updateSubscriptionConfig,
    getAdminDashboardStats, getGamificationConfig, updateGamificationConfig
} from '@/app/action'
import { DEFAULT_SUBSCRIPTION_CONFIG, FEATURES, GATEWAYS, PROVIDERS } from '@/lib/constants'
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LEVEL_THRESHOLDS as defaultLevelThresholds } from '@/lib/gamify'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

import { Badge, Panel, PanelHeader, StatCard, FieldInput, PillGroup, ActionButton } from './components'
import { useQuery } from '@tanstack/react-query'

type Tab = 'dashboard' | 'gamification' | 'security' | 'notifications'

export const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Smartphone size={12} /> },
    { id: 'gamification', label: 'Gamification', icon: <Gamepad2 size={12} /> },
    { id: 'security', label: 'Security', icon: <Key size={12} /> },
    { id: 'notifications', label: 'Push', icon: <Bell size={12} /> },
]

// ─── Main component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState<Tab>('dashboard')

    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [subConfig, setSubConfig] = useState(DEFAULT_SUBSCRIPTION_CONFIG as any)
    const [isSavingConfig, setIsSavingConfig] = useState(false)

    const [levelThresholds, setLevelThresholds] = useState<any[]>(defaultLevelThresholds)
    const [isSavingGamification, setIsSavingGamification] = useState(false)

    const [targetEmail, setTargetEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)

    const [notifTitle, setNotifTitle] = useState('Test Todo Reminder')
    const [notifBody, setNotifBody] = useState("Your task 'Buy groceries' is starting now.")
    const [notifUrl, setNotifUrl] = useState('/todos')
    const [isSendingNotif, setIsSendingNotif] = useState(false)
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const adminEmail = 'abhisheaurya@gmail.com'


    const { data, isLoading: isQueryLoading, error } = useQuery({
        queryKey: ['admin-init'],
        queryFn: async () => {
            const [waStatus, config, dashboardStats, gamificationConfig] = await Promise.all([
                getGlobalWhatsappStatus(),
                getSubscriptionConfig(),
                getAdminDashboardStats(),
                getGamificationConfig(),
            ])

            return {
                waStatus,
                config,
                dashboardStats,
                gamificationConfig,
            }
        },
        enabled: status === 'authenticated' && session?.user?.email === adminEmail,
        staleTime: 1000 * 60 * 5, 
    })
    const stats = data?.dashboardStats

    useEffect(() => {
        if (!data) return

        setIsGlobalEnabled(data.waStatus)
        setSubConfig(data.config)

        if (Array.isArray(data.gamificationConfig)) {
            setLevelThresholds(data.gamificationConfig)
        }
    }, [data])

    const handleToggle = async (checked: boolean) => {
        setIsSaving(true)
        try {
            await toggleGlobalWhatsapp(checked)
            setIsGlobalEnabled(checked)
            toast.success(`WhatsApp is now ${checked ? 'ENABLED' : 'DISABLED'}`)
        } catch { toast.error('Failed to update status') }
        finally { setIsSaving(false) }
    }

    const handleConfigSave = async () => {
        setIsSavingConfig(true)
        try {
            await updateSubscriptionConfig(subConfig)
            toast.success('Configuration saved')
        } catch { toast.error('Failed to save configuration') }
        finally { setIsSavingConfig(false) }
    }

    const handleGamificationSave = async () => {
        setIsSavingGamification(true)
        try {
            const sorted = [...levelThresholds].sort((a, b) => a.level - b.level)
            await updateGamificationConfig(sorted)
            toast.success('Gamification settings saved')
        } catch { toast.error('Failed to save gamification settings') }
        finally { setIsSavingGamification(false) }
    }

    const handleSendNotification = async () => {
        if (!notifTitle || !notifBody) { toast.error('Title and message required'); return }
        setIsSendingNotif(true)
        try {
            const res = await fetch('/api/admin/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: notifTitle, body: notifBody, url: notifUrl }),
            })
            const data = await res.json()
            if (!res.ok) toast.error(data.error || 'Failed to send')
            else { toast.success('Notification sent 🚀'); setNotifTitle(''); setNotifBody('') }
        } catch { toast.error('Something went wrong') }
        finally { setIsSendingNotif(false) }
    }

    const handleForcePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        setIsSavingPassword(true)
        try {
            const res = await fetch('/api/admin/user-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetEmail, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) toast.error(data.error || 'Failed to reset password')
            else { toast.success('Password reset successfully'); setTargetEmail(''); setNewPassword('') }
        } catch { toast.error('An error occurred') }
        finally { setIsSavingPassword(false) }
    }

    if (isQueryLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <UflLoaderInline style="flip" />
            </div>
        )
    }

    const maxXp = levelThresholds.length
        ? (levelThresholds[levelThresholds.length - 1].xp || 1)
        : 1

    // Shared fully-themed input class
    const inputCls = cn(
        'w-full h-9 rounded-md border border-border bg-background px-3',
        'text-[13px] text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50',
        'transition-colors',
    )

    return (
        <div className="max-w-5xl mx-auto pb-16 px-5 pt-10 space-y-6">

            {/* ── Page header ───────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Shield size={16} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                            Admin Control Center
                        </h1>
                        <p className="text-[11px] text-muted-foreground font-mono">habits.hellocoders.in</p>
                    </div>
                </div>
                <div className="w-fit flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/20 rounded-md px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Systems nominal
                    </span>
                </div>
            </div>

            {/* ── Tab bar ───────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center sm:gap-0.5 bg-muted border border-border rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                            'text-[12px] font-medium transition-all',
                            activeTab === t.id
                                ? 'bg-background text-foreground shadow-sm border border-border'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} delta="+12 this week" />
                            <StatCard label="Pro Users" value={stats.proUsers.toLocaleString()} delta={`${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% conversion`} accent />
                            <StatCard label="Free Tier" value={stats.freeUsers.toLocaleString()} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {/* Chart */}
                        {stats && (
                            <Panel>
                                <PanelHeader
                                    title="Signups — last 30 days"
                                    right={<Badge variant="accent">Live</Badge>}
                                />

                                <div className="p-4 h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={stats.chartData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <defs>
                                                {/* Free */}
                                                <linearGradient id="gFree" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="0%"
                                                        stopColor="hsl(var(--muted-foreground))"
                                                        stopOpacity={isDark ? 0.35 : 0.25}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="hsl(var(--muted-foreground))"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>

                                                {/* Paid */}
                                                <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="0%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={isDark ? 0.6 : 0.4}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>

                                            {/* Grid */}
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke={
                                                    isDark
                                                        ? "hsl(var(--border) / 0.3)"
                                                        : "hsl(var(--border) / 0.5)"
                                                }
                                            />

                                            {/* X Axis */}
                                            <XAxis
                                                dataKey="date"
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: isDark ? '#a1a1aa' : '#71717a' }}
                                            />

                                            {/* Y Axis */}
                                            <YAxis
                                                stroke="hsl(var(--muted-foreground))"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: isDark ? '#a1a1aa' : '#71717a' }}
                                            />

                                            {/* Tooltip */}
                                            <Tooltip
                                                cursor={{
                                                    stroke: "hsl(var(--primary))",
                                                    strokeWidth: 1,
                                                    opacity: isDark ? 0.6 : 0.3,
                                                }}
                                                contentStyle={{
                                                    background: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "12px",
                                                    fontSize: "12px",
                                                    color: "hsl(var(--foreground))",
                                                    boxShadow: isDark
                                                        ? "0 4px 25px rgba(0,0,0,0.6)"
                                                        : "0 4px 20px rgba(0,0,0,0.15)",
                                                }}
                                                labelStyle={{
                                                    color: "hsl(var(--foreground))",
                                                    fontWeight: 600,
                                                }}
                                                itemStyle={{
                                                    color: "hsl(var(--muted-foreground))",
                                                }}
                                            />

                                            {/* Free */}
                                            <Area
                                                type="monotone"
                                                dataKey="free"
                                                name="Free"
                                                stroke="hsl(var(--muted-foreground))"
                                                fill="url(#gFree)"
                                                strokeWidth={isDark ? 2.2 : 2}
                                                dot={false}
                                            />

                                            {/* Paid */}
                                            <Area
                                                type="monotone"
                                                dataKey="paid"
                                                name="Pro"
                                                stroke="hsl(var(--primary))"
                                                fill="url(#gPaid)"
                                                strokeWidth={isDark ? 3 : 2.5}
                                                dot={false}
                                                style={{
                                                    filter: isDark ? "drop-shadow(0 0 6px hsl(var(--primary)))" : "none"
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Panel>
                        )}

                        {/* Right column */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <Panel>
                                <PanelHeader title="Service status" />
                                {[
                                    { name: 'Twilio API', ok: true },
                                    { name: 'Meta Cloud API', ok: true },
                                    { name: 'Cron Jobs', ok: true },
                                    { name: 'Gemini / Grok', ok: true },
                                ].map(svc => (
                                    <div key={svc.name} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0">
                                        <span className="text-[13px] text-muted-foreground">{svc.name}</span>
                                        <Badge variant={svc.ok ? 'green' : 'red'}>{svc.ok ? 'Operational' : 'Down'}</Badge>
                                    </div>
                                ))}
                            </Panel>

                            <Panel>
                                <PanelHeader title="WhatsApp gateway" />
                                <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                                    <div>
                                        <p className="text-[13px] text-foreground">Global messaging</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {isGlobalEnabled ? 'Reminders sending normally' : 'All reminders suspended'}
                                        </p>
                                    </div>
                                    <Switch checked={isGlobalEnabled} onCheckedChange={handleToggle} disabled={isSaving} />
                                </div>
                                <div className="px-4 py-3 flex flex-col gap-2">
                                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Provider</p>
                                    <PillGroup
                                        options={PROVIDERS}
                                        value={subConfig.whatsapp_provider}
                                        onChange={v => setSubConfig({ ...subConfig, whatsapp_provider: v })}
                                    />
                                </div>
                            </Panel>
                        </div>
                    </div>

                    {/* Pricing & feature limits */}
                    <Panel>
                        <PanelHeader title="Pricing & Feature limits" right={<Badge variant="accent">Pro tier</Badge>} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border-b border-border">
                            <FieldInput label="Monthly USD" value={subConfig.pro_monthly_price_usd} onChange={e => setSubConfig({ ...subConfig, pro_monthly_price_usd: e.target.value })} />
                            <FieldInput label="Monthly INR" value={subConfig.pro_monthly_price_inr} onChange={e => setSubConfig({ ...subConfig, pro_monthly_price_inr: e.target.value })} />
                            <FieldInput label="Yearly USD" value={subConfig.pro_yearly_price_usd} onChange={e => setSubConfig({ ...subConfig, pro_yearly_price_usd: e.target.value })} />
                            <FieldInput label="Yearly INR" value={subConfig.pro_yearly_price_inr} onChange={e => setSubConfig({ ...subConfig, pro_yearly_price_inr: e.target.value })} />
                            <FieldInput label="Agent unlock INR" value={subConfig.agent_price_inr || '49'} onChange={e => setSubConfig({ ...subConfig, agent_price_inr: e.target.value })} />
                            <FieldInput label="Free habit limit" value={subConfig.free_habit_limit} onChange={e => setSubConfig({ ...subConfig, free_habit_limit: e.target.value })} />
                            <FieldInput label="Blueprint limit" value={subConfig.free_blueprint_limit} onChange={e => setSubConfig({ ...subConfig, free_blueprint_limit: e.target.value })} />
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Gateway</p>
                                <PillGroup
                                    options={GATEWAYS}
                                    value={subConfig.active_payment_gateway}
                                    onChange={v => setSubConfig({ ...subConfig, active_payment_gateway: v })}
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Feature gates</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {FEATURES.map(feat => (
                                    <div key={feat.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border">
                                        <span className="text-[13px] text-muted-foreground">{feat.label}</span>
                                        <Switch
                                            checked={subConfig[feat.id] === 'true'}
                                            onCheckedChange={checked => setSubConfig({ ...subConfig, [feat.id]: String(checked) })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground italic mt-3">
                                Disabling a feature hides it from the sidebar for all users.
                            </p>
                        </div>

                        <div className="flex justify-end px-4 pb-4">
                            <ActionButton onClick={handleConfigSave} disabled={isSavingConfig}>
                                {isSavingConfig ? 'Saving…' : 'Save configuration'}
                            </ActionButton>
                        </div>
                    </Panel>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
          GAMIFICATION TAB
      ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'gamification' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Panel>
                        <PanelHeader
                            title="XP level thresholds"
                            right={<Badge variant="amber">Affects all users immediately</Badge>}
                        />
                        <div className="p-4">
                            <p className="text-[12px] text-muted-foreground mb-4">
                                Lifetime XP required to reach each level. Level 1 is always 0 XP.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {levelThresholds.map((threshold, index) => {
                                    const pct = Math.min(100, Math.round((threshold.xp / maxXp) * 100))
                                    return (
                                        <div key={threshold.level} className="bg-muted/40 border border-border rounded-lg p-3">
                                            <p className="text-[10px] font-mono text-muted-foreground mb-1.5">LVL {threshold.level}</p>
                                            <input
                                                type="number"
                                                disabled={threshold.level === 1}
                                                value={threshold.xp}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value)
                                                    if (isNaN(val)) return
                                                    const copy = [...levelThresholds]
                                                    copy[index] = { ...copy[index], xp: val }
                                                    setLevelThresholds(copy)
                                                }}
                                                className="w-full bg-transparent font-mono text-[15px] font-medium text-foreground focus:outline-none disabled:text-muted-foreground"
                                            />
                                            <div className="mt-2 h-[2px] rounded-full bg-border">
                                                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(4, pct)}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex justify-end px-4 pb-4">
                            <ActionButton onClick={handleGamificationSave} disabled={isSavingGamification}>
                                {isSavingGamification ? 'Saving…' : 'Save thresholds'}
                            </ActionButton>
                        </div>
                    </Panel>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
          SECURITY TAB
      ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'security' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Panel>
                        <PanelHeader
                            title="Force password reset"
                            right={<Badge variant="red">Destructive action</Badge>}
                        />
                        <form onSubmit={handleForcePasswordChange} className="p-4 max-w-sm space-y-3">
                            <p className="text-[12px] text-muted-foreground mb-4">
                                Override any user's password if they've lost access to their account.
                            </p>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                                    Target user email
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@example.com"
                                    value={targetEmail}
                                    onChange={e => setTargetEmail(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                                    New password
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className={cn(inputCls, 'focus:border-red-400/50 focus:ring-red-400/20')}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSavingPassword}
                                className={cn(
                                    'w-full flex items-center justify-center gap-2 mt-2',
                                    'bg-red-500/10 hover:bg-red-500/15 border border-red-400/25',
                                    'text-red-700 dark:text-red-400 text-[13px] font-medium',
                                    'px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
                                )}
                            >
                                <AlertTriangle size={13} />
                                {isSavingPassword ? 'Authorizing…' : 'Force reset password'}
                            </button>
                        </form>
                    </Panel>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
          NOTIFICATIONS TAB
      ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'notifications' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Panel>
                        <PanelHeader
                            title="Broadcast push notification"
                            right={<Badge variant="accent">All users</Badge>}
                        />
                        <div className="p-4 max-w-lg space-y-3">
                            <p className="text-[12px] text-muted-foreground mb-4">
                                Send a push notification to all subscribed users.
                            </p>
                            <input
                                type="text"
                                placeholder="Notification title"
                                value={notifTitle}
                                onChange={e => setNotifTitle(e.target.value)}
                                className={inputCls}
                            />
                            <textarea
                                placeholder="Message body…"
                                value={notifBody}
                                onChange={e => setNotifBody(e.target.value)}
                                rows={3}
                                className={cn(
                                    'w-full rounded-md border border-border bg-background px-3 py-2',
                                    'text-[13px] text-foreground placeholder:text-muted-foreground',
                                    'focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50',
                                    'transition-colors resize-none',
                                )}
                            />
                            <input
                                type="text"
                                placeholder="Redirect URL (e.g. /todos)"
                                value={notifUrl}
                                onChange={e => setNotifUrl(e.target.value)}
                                className={cn(inputCls, 'font-mono')}
                            />
                            <ActionButton onClick={handleSendNotification} disabled={isSendingNotif} className="mt-1">
                                <Bell size={13} />
                                {isSendingNotif ? 'Sending…' : 'Send to all users'}
                            </ActionButton>
                        </div>
                    </Panel>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard