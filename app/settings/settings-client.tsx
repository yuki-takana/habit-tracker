"use client";

import { Smartphone, User, Bell, Shield, Trash2, Save, Send, Github, Code2, ExternalLink, InfoIcon, ChevronDown, ChevronRight, Plus, Key, Check, X, Zap, Lock, Eye, EyeOff } from 'lucide-react';
import PhoneVerification from '@/components/PhoneVerification';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { updateUserProfile, sendTestWhatsapp, toggleWhatsapp, saveUserApiKeys, fetchUserSubscriptionTier, toggleDailyTodo } from '@/app/action';
import { toast } from 'sonner';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

// ─── Integration config ────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id: 'wakatime',
    label: 'WakaTime',
    icon: Code2,
    placeholder: 'waka_...',
    fieldKey: 'wakatimeApiKey',
    stateKey: 'wakatimeKey',
    desc: 'Sync coding activity & time tracking',
    docsUrl: 'https://wakatime.com/settings/api-key',
    docsLabel: 'Get API key',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: Github,
    placeholder: 'ghp_...',
    fieldKey: 'githubApiKey',
    stateKey: 'githubKey',
    desc: 'Sync GitHub activity & contributions',
    docsUrl: 'https://github.com/settings/tokens',
    docsLabel: 'Create token',
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: ExternalLink,
    placeholder: 'linkedin_...',
    fieldKey: 'linkedinApiKey',
    stateKey: 'linkedinKey',
    desc: 'Connect LinkedIn for career insights',
    docsUrl: 'https://www.linkedin.com/developers/apps',
    docsLabel: 'Create app',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: ExternalLink,
    placeholder: 'twitter_...',
    fieldKey: 'twitterApiKey',
    stateKey: 'twitterKey',
    desc: 'Track posting activity & analytics',
    docsUrl: 'https://developer.twitter.com/en/portal/dashboard',
    docsLabel: 'Developer portal',
    color: 'from-sky-400 to-indigo-600',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900/70 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: any; title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Integration Row ───────────────────────────────────────────────────────
function IntegrationRow({
  integration,
  value,
  onChange,
}: {
  integration: typeof INTEGRATIONS[0];
  value: string;
  onChange: (val: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [show, setShow] = useState(false);
  const isConnected = value.length > 6;
  const Icon = integration.icon;

  return (
    <div className="border-b border-slate-100 dark:border-zinc-800 last:border-0">
      {/* Row header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{integration.label}</p>
            <p className="text-xs text-slate-400">{integration.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <Check className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
              <Plus className="w-3 h-3" /> Add key
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded input */}
      {expanded && (
        <div className="px-6 pb-5 pt-1 bg-slate-50/50 dark:bg-zinc-800/20">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">API Key</span>
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
            >
              {integration.docsLabel} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              placeholder={integration.placeholder}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {isConnected && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-2 flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 font-medium"
            >
              <X className="w-3 h-3" /> Remove key
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Password field ─────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [wakatimeKey, setWakatimeKey] = useState('');
  const [githubKey, setGithubKey] = useState('');
  const [linkedinKey, setLinkedinKey] = useState('');
  const [twitterKey, setTwitterKey] = useState('');
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [xp, setXp] = useState(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDailyTodoEnabled, setIsDailyTodoEnabled] = useState(true);
  const [wakeUpTime, setWakeUpTime] = useState('06:30');
  const [whatsappDeadlineEnabled, setWhatsappDeadlineEnabled] = useState(true);
  const [isWhatsappSaving, setIsWhatsappSaving] = useState(false);

  const keyStateMap: Record<string, [string, (v: string) => void]> = {
    wakatimeKey: [wakatimeKey, setWakatimeKey],
    githubKey: [githubKey, setGithubKey],
    linkedinKey: [linkedinKey, setLinkedinKey],
    twitterKey: [twitterKey, setTwitterKey],
  };

  useEffect(() => {
    const fetchSubStatus = async () => {
      if ((session?.user as any)?.id) {
        const limits = await fetchUserSubscriptionTier();
        setIsPro(limits.plan === 'pro');
        const { getUserXp } = await import('@/app/action');
        const xpData = await getUserXp();
        setXp(xpData.xp);
      }
    };
    fetchSubStatus();
  }, [(session?.user as any)?.id]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setWakatimeKey(session.user.wakatimeApiKey || '');
      setGithubKey(session.user.githubApiKey || '');
      setLinkedinKey((session.user as any).linkedinApiKey || '');
      setTwitterKey((session.user as any).twitterApiKey || '');
      setWakeUpTime((session.user as any).wakeUpTime || '06:30');
      setWhatsappDeadlineEnabled((session.user as any).whatsappDeadlineEnabled ?? true);
    }
  }, [session]);

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntegrationsLoading(true);
    try {
      await saveUserApiKeys({ wakatimeApiKey: wakatimeKey, githubApiKey: githubKey, linkedinApiKey: linkedinKey, twitterApiKey: twitterKey });
      await update({ wakatimeApiKey: wakatimeKey, githubApiKey: githubKey, linkedinApiKey: linkedinKey, twitterApiKey: twitterKey });
      toast.success("Integrations updated successfully!");
    } catch (error) {
      toast.error("Failed to update integrations.");
    } finally {
      setIntegrationsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newPassword && newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
      await updateUserProfile({ name, email, currentPassword, newPassword, dailyGoalsEnabled: isDailyTodoEnabled, wakeUpTime });
      await update({ name, email, wakeUpTime } as any);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setTestLoading(true);
    try {
      await sendTestWhatsapp();
      toast.success("Test WhatsApp message sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send test message.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setIsSaving(true);
    try {
      await toggleDailyTodo(checked);
      setIsDailyTodoEnabled(checked);
      toast.success(`Daily Todo is now ${checked ? 'ENABLED' : 'DISABLED'}`);
    } catch { toast.error("Failed to update status"); }
    finally { setIsSaving(false); }
  };

  const handleToggleDeadline = async (checked: boolean) => {
    setIsWhatsappSaving(true);
    try {
      await updateUserProfile({ whatsappDeadlineEnabled: checked });
      setWhatsappDeadlineEnabled(checked);
      await update({ whatsappDeadlineEnabled: checked } as any);
      toast.success(`Deadline notifications ${checked ? 'ENABLED' : 'DISABLED'}`);
    } catch { toast.error("Failed to update status"); }
    finally { setIsWhatsappSaving(false); }
  };

  const connectedCount = [wakatimeKey, githubKey, linkedinKey, twitterKey].filter(k => k.length > 6).length;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account, integrations and notifications.</p>
        </div>

        {/* ── Two-column grid: sidebar + main ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ════════════════════════════════════
              LEFT SIDEBAR — Profile card (sticky)
          ════════════════════════════════════ */}
          <div className="lg:sticky lg:top-6 space-y-4">

            {/* Avatar + identity card */}
            <SectionCard>
              <div className="p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{userInitials}</span>
                    )}
                  </div>
                  {isPro && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {session?.user?.name || 'Your Name'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full">
                  {session?.user?.email || 'your@email.com'}
                </p>
                {(session?.user as any)?.phone && (
                  <p className="text-[11px] text-indigo-500 font-medium mt-1">{(session?.user as any).phone}</p>
                )}

                {/* Plan badge */}
                {isPro !== null && (
                  <div className={`mt-4 w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    isPro
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {isPro ? 'Pro Member' : 'Free Tier'}
                  </div>
                )}
              </div>

              {/* XP Progress */}
              <div className="px-6 pb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Level {level}</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-500">{xp} XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-amber-600/60 dark:text-amber-400/50 mt-1.5 text-right">
                    {100 - xpProgress} XP to level {level + 1}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Subscription upgrade card (if free) */}
            {isPro === false && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl -mr-8 -mt-8 rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Upgrade to Pro</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    Unlimited habits, AI Blueprints, WhatsApp reminders & more.
                  </p>
                  <Link
                    href="/billing"
                    className="block w-full text-center px-4 py-2 bg-white text-indigo-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                  >
                    View Plans →
                  </Link>
                </div>
              </div>
            )}

            {isPro === true && (
              <SectionCard>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Pro Active</p>
                    <p className="text-[11px] text-slate-400">All features unlocked</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                    Active
                  </span>
                </div>
              </SectionCard>
            )}

            {/* Integrations status (sidebar quick view) */}
            <SectionCard>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Integrations</p>
                <div className="space-y-2">
                  {INTEGRATIONS.map((intg) => {
                    const [val] = keyStateMap[intg.stateKey];
                    const connected = val.length > 6;
                    const Icon = intg.icon;
                    return (
                      <div key={intg.id} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${intg.color} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 flex-1">{intg.label}</span>
                        {connected
                          ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                          : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-300 dark:border-zinc-600" />
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ════════════════════════════════════
              RIGHT MAIN — Settings panels
          ════════════════════════════════════ */}
          <div className="space-y-4">

            {/* ── Profile form ─────────────────────────────────── */}
            <SectionCard>
              <SectionHeader icon={User} title="Profile Information" subtitle="Update your name, email and preferences" />
              <form onSubmit={handleUpdateProfile}>
                <div className="px-6 py-5 space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Full Name</label>
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Wake-up Time</label>
                      <input
                        type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Daily Todo</p>
                        <p className="text-[11px] text-slate-400">Auto-generate tasks</p>
                      </div>
                      <Switch checked={isDailyTodoEnabled} onCheckedChange={handleToggle} disabled={isSaving} />
                    </div>
                  </div>

                  {/* Password section */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {showPasswordSection ? 'Cancel password change' : 'Change password'}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} />
                    </button>

                    {showPasswordSection && (
                      <div className="mt-4 grid grid-cols-1 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <PasswordField label="New password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
                          <PasswordField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-5 flex justify-end">
                  <button
                    type="submit" disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {loading
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </SectionCard>

            {/* ── WhatsApp ─────────────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={Smartphone}
                title="WhatsApp Notifications"
                subtitle="Manage reminders and alerts"
                action={
                  <button
                    onClick={handleSendTest}
                    disabled={testLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all text-xs font-medium disabled:opacity-50"
                  >
                    {testLoading
                      ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      : <Send className="w-3 h-3" />}
                    Send Test
                  </button>
                }
              />
              <div className="px-6 py-5 space-y-4">
                {/* @ts-ignore */}
                <PhoneVerification initialValue={session?.user?.phone} isEnabled={session?.user?.whatsappEnabled} />
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Deadline Alerts</p>
                    <p className="text-xs text-slate-400 mt-0.5">5–10 min before task deadlines</p>
                  </div>
                  <Switch checked={whatsappDeadlineEnabled} onCheckedChange={handleToggleDeadline} disabled={isWhatsappSaving} />
                </div>
              </div>
            </SectionCard>

            {/* ── Integrations ─────────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                icon={Key}
                title="Integrations"
                subtitle={`${connectedCount} of ${INTEGRATIONS.length} connected`}
                action={
                  <a
                    href="/docs/api-keys-guide.md"
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                  >
                    How to get keys <ExternalLink className="w-3 h-3" />
                  </a>
                }
              />
              <form onSubmit={handleUpdateIntegrations}>
                <div>
                  {INTEGRATIONS.map((integration) => {
                    const [val, setVal] = keyStateMap[integration.stateKey];
                    return (
                      <IntegrationRow
                        key={integration.id}
                        integration={integration}
                        value={val}
                        onChange={setVal}
                      />
                    );
                  })}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit" disabled={integrationsLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {integrationsLoading
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    Save Integrations
                  </button>
                </div>
              </form>
            </SectionCard>

            {/* ── Danger Zone ──────────────────────────────────── */}
            <SectionCard>
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                    <p className="text-xs text-slate-400">Irreversible actions</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-semibold shadow-lg shadow-red-600/20 active:scale-95">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            </SectionCard>

          </div>
          {/* end right column */}
        </div>
        {/* end grid */}
      </div>
    </div>
  );
}