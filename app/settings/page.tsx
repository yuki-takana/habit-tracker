"use client";

import { Smartphone, User, Bell, Shield, Trash2, Save, Send, Github, Code2, ExternalLink, InfoIcon } from 'lucide-react';
import PhoneVerification from '@/components/PhoneVerification';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { updateUserProfile, sendTestWhatsapp, toggleWhatsapp, saveUserApiKeys, fetchUserSubscriptionTier } from '@/app/action';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    }
  }, [session]);

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntegrationsLoading(true);
    try {
      await saveUserApiKeys({
        wakatimeApiKey: wakatimeKey,
        githubApiKey: githubKey,
        linkedinApiKey: linkedinKey,
        twitterApiKey: twitterKey,
      });
      await update({
        wakatimeApiKey: wakatimeKey,
        githubApiKey: githubKey,
        linkedinApiKey: linkedinKey,
        twitterApiKey: twitterKey,
      });
      toast.success("Integrations updated successfully!");
    } catch (error) {
      toast.error("Failed to update integrations.");
      console.error(error);
    } finally {
      setIntegrationsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      await updateUserProfile({
        name,
        email,
        currentPassword,
        newPassword
      });
      await update({ name, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and notification preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-indigo-600 font-medium text-sm hover:underline"
                >
                  {showPasswordSection ? "Cancel Password Change" : "Change Password"}
                </button>

                {showPasswordSection && (
                  <div className="mt-4 space-y-4">

                    {/* Current Password */}
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2.5 rounded-xl border"
                      />
                      <span
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-2.5 cursor-pointer"
                      >
                        {showCurrent ? "🙈" : "👁️"}
                      </span>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2.5 rounded-xl border"
                      />
                      <span
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-2.5 cursor-pointer"
                      >
                        {showNew ? "🙈" : "👁️"}
                      </span>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2.5 rounded-xl border"
                      />
                      <span
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2.5 cursor-pointer"
                      >
                        {showConfirm ? "🙈" : "👁️"}
                      </span>
                    </div>

                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Gamification Progress */}
          <div className="mt-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/30 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">Gamification Progress</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Complete tasks to earn XP and level up!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-500">{xp} XP</div>
              <div className="text-[10px] font-black tracking-widest uppercase text-amber-700/60 dark:text-amber-400/60">
                Level {Math.floor(xp / 100) + 1}
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Tier Banner */}
        {isPro !== null && (
          <section className={`border rounded-2xl p-6 shadow-sm overflow-hidden relative ${isPro ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/30' : 'bg-gradient-to-r from-slate-900 to-indigo-900 border-slate-800 dark:border-zinc-800'}`}>
            {isPro ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pro Member</h2>
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase">Active</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">You have unlocked all premium features and the AI Agent Army.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-white">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">Free Tier</h2>
                    <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase">Basic</span>
                  </div>
                  <p className="text-slate-300 text-sm max-w-sm">Upgrade to Pro to unlock unlimited habit tracking, all AI Blueprints, and global WhatsApp reminders.</p>
                </div>
                <Link href="/billing" className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                  Upgrade Option
                </Link>
              </div>
            )}
            {!isPro && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl -mr-20 -mt-20 rounded-full z-0" />}
          </section>
        )}

        {/* WhatsApp & Notifications Section */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">WhatsApp Notifications</h2>
            </div>
            <button
              onClick={handleSendTest}
              disabled={testLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all font-medium text-sm disabled:opacity-50 active:scale-95"
            >
              {testLoading ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Test WhatsApp
            </button>
          </div>

          <div className="max-w-md">
            {/* @ts-ignore */}
            <PhoneVerification initialValue={session?.user?.phone} isEnabled={session?.user?.whatsappEnabled} />
          </div>
        </section>

        {/* Integrations Section */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">External Integrations</h2>
            </div>
            <Link
              href="/docs/api-keys-guide.md"
              target="_blank"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-sm"
            >
              How to get API Keys? <ExternalLink size={14} />
            </Link>
          </div>

          <form onSubmit={handleUpdateIntegrations} className="space-y-8">
            {/* WakaTime */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">WakaTime API Key</span>
                </div>
                <a
                  href="https://wakatime.com/settings/api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  Get your key <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                value={wakatimeKey}
                onChange={(e) => setWakatimeKey(e.target.value)}
                className="block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all text-slate-900 dark:text-white"
                placeholder="waka_..."
              />
              <p className="text-[10px] text-slate-500">
                Used to sync your coding activity. Your key is stored securely and only used for your personal statistics.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-zinc-800 pt-6"></div>

            {/* GitHub */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Personal Access Token</span>
                </div>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  Create token <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                value={githubKey}
                onChange={(e) => setGithubKey(e.target.value)}
                className="block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all text-slate-900 dark:text-white"
                placeholder="ghp_..."
              />
              <p className="text-[10px] text-slate-500">
                Used to sync your GitHub activity. Your token is stored securely.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-zinc-800 pt-6"></div>

            {/* LinkedIn */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn API Key</span>
                </div>
                <a
                  href="https://www.linkedin.com/developers/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  Create App <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                value={linkedinKey}
                onChange={(e) => setLinkedinKey(e.target.value)}
                className="block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all text-slate-900 dark:text-white"
                placeholder="linkedin_..."
              />
            </div>

            <div className="border-t border-slate-100 dark:border-zinc-800 pt-6"></div>

            {/* Twitter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Twitter API Key</span>
                </div>
                <a
                  href="https://developer.twitter.com/en/portal/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  Developer Portal <ExternalLink size={10} />
                </a>
              </div>
              <input
                type="password"
                value={twitterKey}
                onChange={(e) => setTwitterKey(e.target.value)}
                className="block w-full rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 transition-all text-slate-900 dark:text-white"
                placeholder="twitter_..."
              />
            </div>

            {/* Documentation Alert Moved to Top */}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={integrationsLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {integrationsLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Integrations
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4 text-red-700 dark:text-red-400">
            <Shield className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Danger Zone</h2>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-600/20 active:scale-95">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
