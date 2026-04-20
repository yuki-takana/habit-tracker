"use client";

import React, { useEffect, useState } from 'react';
import { getJourneyData, getJourneyBentoData } from '@/app/actions/journey';
import { Flame, CheckCircle, Target, Calendar, TrendingUp, Zap, Activity } from 'lucide-react';
import { UflLoaderInline } from '@/components/ui/ufl-loader';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

/* ─────────────────── types ─────────────────── */
interface BentoData {
  completionRate: number;
  overallPerformance: string;
  totalTodos: number;
  completedTodos: number;
  failedTodos: number;
  consistencyData: number[];   // 30 days
  weeklyXp: number[];          // 7 days
  weeklyCompleted: number[];
  weeklyFailed: number[];
}

interface JourneyEvent {
  id: string;
  date: Date;
  type: string;
  title: string;
  description?: string;
  icon: string;
}

/* ─────────────────── tiny sub-components ─────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function BarChart({ xp }: { xp: number[] }) {
  const max = Math.max(...xp, 1);
  return (
    <div className="mt-3">
      <div className="flex items-end gap-1.5 h-16">
        {xp.map((v, i) => {
          const pct = Math.round((v / max) * 100);
          const isHigh = pct >= 70;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className={`w-full rounded-t-md transition-all ${isHigh ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                style={{ height: `${pct}%` }}
                title={`${v} XP`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {DAYS.map(d => (
          <div key={d} className="flex-1 text-center text-[9px] text-zinc-600">{d}</div>
        ))}
      </div>
    </div>
  );
}

const DOT_SHADES = [
  'bg-zinc-800 dark:bg-zinc-800',
  'bg-lime-200 dark:bg-lime-900',
  'bg-lime-400 dark:bg-lime-700',
  'bg-lime-500 dark:bg-lime-500',
  'bg-lime-600 dark:bg-lime-300',
];
function ConsistencyGrid({ data }: { data: number[] }) {
  return (
    <div className="grid gap-1 mt-3" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
      {data.map((v, i) => (
        <div
          key={i}
          className={`aspect-square rounded-sm ${DOT_SHADES[Math.min(v, 4)]}`}
          title={`${v} completions`}
        />
      ))}
    </div>
  );
}

function PerfRing({ pct }: { pct: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#c9ff47" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-white"
        style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
        {pct}%
      </div>
    </div>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame className="text-orange-400" size={16} />,
  CheckCircle: <CheckCircle className="text-emerald-400" size={16} />,
  Target: <Target className="text-violet-400" size={16} />,
};

const iconBg: Record<string, string> = {
  Flame: 'bg-orange-950/60',
  CheckCircle: 'bg-emerald-950/60',
  Target: 'bg-violet-950/60',
};

/* ─────────────────── card wrapper ─────────────────── */
function Card({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  noPad = false,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  noPad?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        bg-background/50 border border-zinc-600 rounded-2xl overflow-hidden
        hover:border-zinc-700 transition-colors
        ${noPad ? '' : 'p-5'}
        ${className}
      `}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[1.8px] text-zinc-600 font-medium mb-2">{children}</p>
);

const BigNum = ({ children }: { children: React.ReactNode }) => (
  <p className="text-4xl font-black text-forground leading-none" style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
    {children}
  </p>
);

/* ─────────────────── empty state ─────────────────── */
function EmptyState() {
  return (
    <div className="max-w-lg mx-auto py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
        <Calendar className="text-zinc-600" size={36} />
      </div>
      <h2 className="text-2xl font-black text-forground mb-3" style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
        Your journey starts now
      </h2>
      <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Complete habits, finish todos, and close tasks to see your story unfold here.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {[
          { icon: <Flame className="text-orange-400 mx-auto mb-1.5" size={22} />, label: 'Complete habits' },
          { icon: <CheckCircle className="text-emerald-400 mx-auto mb-1.5" size={22} />, label: 'Finish todos' },
          { icon: <Target className="text-violet-400 mx-auto mb-1.5" size={22} />, label: 'Close tasks' },
        ].map(({ icon, label }) => (
          <div key={label} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 text-center">
            {icon}
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── main page ─────────────────── */
export default function JourneyPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [bento, setBento] = useState<BentoData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [evts, bentoData] = await Promise.all([getJourneyData(), getJourneyBentoData()]);
        setEvents(evts);
        setBento(bentoData);
      } catch (err) {
        console.error('Journey load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <UflLoaderInline style="flip" text="Loading your journey..." />
      </div>
    );
  }

  if (events.length === 0 || !bento) return <EmptyState />;

  const recentEvents = events.slice(0, 5);
  const pendingTodos = bento.totalTodos - bento.completedTodos - bento.failedTodos;
  const totalXp = bento.weeklyXp.reduce((a, b) => a + b, 0);

  const perfColor =
    bento.completionRate >= 80 ? 'text-[#c9ff47]'
      : bento.completionRate >= 50 ? 'text-amber-400'
        : 'text-red-400';

  const perfBadgeBg =
    bento.completionRate >= 80 ? 'bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20'
      : bento.completionRate >= 50 ? 'bg-amber-950/60 text-amber-400'
        : 'bg-red-950/60 text-red-400';

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-4xl font-black tracking-tight text-forground"
          style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
        >
          Your Journey
        </h1>
        <p className="text-zinc-500 mt-1">A living record of your wins, streaks & growth.</p>
      </motion.header>

      {/* bento grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* ── HERO: streak + XP ── */}
        <Card
          colSpan={2}
          rowSpan={2}
          noPad
          className="bg-[#c9ff47]! border-transparent! flex flex-col justify-end p-6 min-h-60"
        >
          <div
            className="text-7xl font-black text-black leading-none mb-2"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            {totalXp}
          </div>
          <div className="text-[10px] uppercase tracking-[2px] text-black/50 font-medium mb-4">
            XP this week
          </div>
          <h2
            className="text-2xl font-black text-black mb-1"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            🔥 Keep the streak
          </h2>
          <p className="text-sm text-black/60">
            You've logged activity every day this week.
          </p>
        </Card>

        {/* ── Todos done ── */}
        <Card>
          <Label>Todos done</Label>
          <BigNum>{bento.completedTodos}</BigNum>
          <p className="text-xs text-zinc-500 mt-1">of {bento.totalTodos} total</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400font-medium">
            +{bento.weeklyCompleted.reduce((a, b) => a + b, 0)} this week
          </span>
        </Card>

        {/* ── Completion rate ── */}
        <Card>
          <Label>Completion rate</Label>
          <div className="flex items-baseline gap-1">
            <BigNum>{bento.completionRate}</BigNum>
            <span className="text-lg text-zinc-500">%</span>
          </div>
          <span className={`inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full font-medium ${perfBadgeBg}`}>
            {bento.overallPerformance}
          </span>
        </Card>

        {/* ── Failed ── */}
        <Card>
          <Label>Failed todos</Label>
          <BigNum>{bento.failedTodos}</BigNum>
          <p className="text-xs text-zinc-500 mt-1">missed deadline</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-medium">
            {bento.weeklyFailed.reduce((a, b) => a + b, 0)} this week
          </span>
        </Card>

        {/* ── Pending ── */}
        <Card>
          <Label>Pending</Label>
          <BigNum>{pendingTodos}</BigNum>
          <p className="text-xs text-zinc-500 mt-1">still in progress</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
            Not overdue
          </span>
        </Card>

        {/* ── Weekly XP bar chart ── */}
        <Card colSpan={2}>
          <Label>Weekly XP breakdown</Label>
          <BarChart xp={bento.weeklyXp} />
        </Card>

        {/* ── 30-day consistency dots ── */}
        <Card colSpan={2}>
          <Label>30-day consistency</Label>
          <ConsistencyGrid data={bento.consistencyData} />
          <div className="flex items-center gap-2 mt-3">
            {['None', 'Low', 'Mid', 'High', 'Peak'].map((l, i) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${DOT_SHADES[i]}`} />
                <span className="text-[9px] text-zinc-600">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Recent activity timeline ── */}
        <Card colSpan={2} rowSpan={2}>
          <Label>Recent activity</Label>
          <div className="mt-2 space-y-1">
            {recentEvents.map((ev, i) => (
              <React.Fragment key={ev.id + i}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 py-3 group"
                >
                  {/* icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 
            ${iconBg[ev.icon] ?? 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    {iconMap[ev.icon] ?? (
                      <CheckCircle size={16} className="text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
                        {formatDistanceToNow(new Date(ev.date), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate mt-0.5 
              group-hover:text-black dark:group-hover:text-white transition-colors">
                      {ev.title}
                    </p>
                  </div>
                </motion.div>

                {i < recentEvents.length - 1 && (
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* ── Performance ring ── */}
        <Card colSpan={2}>
          <Label>Overall performance</Label>

          <div className="flex items-center gap-5 mt-3">
            <PerfRing pct={bento.completionRate} />

            <div>
              <p
                className={`text-xl font-black 
        ${bento.completionRate >= 80
                    ? "text-lime-700 dark:text-lime-400"
                    : bento.completionRate >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
              >
                {bento.overallPerformance}
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed max-w-[180px]">
                {bento.completionRate >= 80
                  ? "You're crushing it. Maintain the momentum!"
                  : bento.completionRate >= 50
                    ? `Close ${Math.ceil(bento.totalTodos * 0.8) - bento.completedTodos} more todos to reach Excellent.`
                    : 'Pick the top 3 todos and focus on them today.'}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Stats mini row ── */}
        <Card colSpan={2}>
          <Label>Quick stats</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              {
                label: 'Completed',
                value: bento.completedTodos,
                color: 'text-lime-700 dark:text-lime-400',
              },
              {
                label: 'Failed',
                value: bento.failedTodos,
                color: 'text-red-600 dark:text-red-400',
              },
              {
                label: 'Pending',
                value: pendingTodos,
                color: 'text-amber-600 dark:text-amber-400',
              }
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-background border rounded-xl p-3">
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">{label}</p>
                <p className={`text-2xl font-black mt-1 ${color}`} style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}