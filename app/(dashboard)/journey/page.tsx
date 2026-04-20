"use client";

import React, { useEffect, useState } from 'react';
import { getJourneyData, getJourneyBentoData } from '@/app/actions/journey';
import { Flame, CheckCircle, Target, Calendar } from 'lucide-react';
import { UflLoaderInline } from '@/components/ui/ufl-loader';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

/* ─────────────────── types ─────────────────── */
interface BentoData {
  completionRate: number;
  overallPerformance: string;
  totalTodos: number;
  completedTodos: number;
  failedTodos: number;
  consistencyData: number[];
  weeklyXp: number[];
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

/* ─────────────────── bar chart ─────────────────── */
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
                className={`w-full rounded-t-md transition-all ${
                  isHigh
                    ? 'bg-indigo-500 dark:bg-indigo-400'
                    : 'bg-slate-200 dark:bg-zinc-700'
                }`}
                style={{ height: `${pct}%` }}
                title={`${v} XP`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {DAYS.map(d => (
          <div key={d} className="flex-1 text-center text-[9px] text-slate-400 dark:text-zinc-600">{d}</div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── consistency dots ─────────────────── */
// Light mode: slate → indigo ramp. Dark mode: zinc → indigo ramp.
const DOT_SHADES = [
  'bg-slate-200 dark:bg-zinc-800',
  'bg-indigo-100 dark:bg-indigo-950',
  'bg-indigo-300 dark:bg-indigo-700',
  'bg-indigo-500 dark:bg-indigo-500',
  'bg-indigo-700 dark:bg-indigo-300',
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

/* ─────────────────── perf ring ─────────────────── */
function PerfRing({ pct, color }: { pct: number; color: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-zinc-800" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-900 dark:text-white"
        style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
      >
        {pct}%
      </div>
    </div>
  );
}

/* ─────────────────── icon maps ─────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  Flame:       <Flame       className="text-orange-500"  size={16} />,
  CheckCircle: <CheckCircle className="text-emerald-500" size={16} />,
  Target:      <Target      className="text-indigo-500"  size={16} />,
};
const iconBg: Record<string, string> = {
  Flame:       'bg-orange-100  dark:bg-orange-950/60',
  CheckCircle: 'bg-emerald-100 dark:bg-emerald-950/60',
  Target:      'bg-indigo-100  dark:bg-indigo-950/60',
};

/* ─────────────────── card ─────────────────── */
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
        bg-white dark:bg-zinc-900/60
        border border-slate-200 dark:border-zinc-800
        rounded-2xl overflow-hidden
        hover:border-indigo-300 dark:hover:border-indigo-800
        hover:shadow-lg hover:shadow-indigo-500/5
        transition-all duration-300
        ${noPad ? '' : 'p-5'}
        ${className}
      `}
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow:    rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[1.8px] text-slate-400 dark:text-zinc-600 font-medium mb-2">
    {children}
  </p>
);

const BigNum = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-4xl font-black text-slate-900 dark:text-white leading-none"
    style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
  >
    {children}
  </p>
);

/* ─────────────────── empty state ─────────────────── */
function EmptyState() {
  return (
    <div className="max-w-lg mx-auto py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6">
        <Calendar className="text-slate-400 dark:text-zinc-600" size={36} />
      </div>
      <h2
        className="text-2xl font-black text-slate-900 dark:text-white mb-3"
        style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
      >
        Your journey starts now
      </h2>
      <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Complete habits, finish todos, and close tasks to see your story unfold here.
      </p>
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {[
          { icon: <Flame       className="text-orange-500  mx-auto mb-1.5" size={22} />, label: 'Complete habits' },
          { icon: <CheckCircle className="text-emerald-500 mx-auto mb-1.5" size={22} />, label: 'Finish todos'    },
          { icon: <Target      className="text-indigo-500  mx-auto mb-1.5" size={22} />, label: 'Close tasks'     },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-center"
          >
            {icon}
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── helpers ─────────────────── */
function perfRingColor(rate: number) {
  if (rate >= 80) return '#6366f1'; // indigo-500
  if (rate >= 50) return '#f59e0b'; // amber-500
  return '#ef4444';                 // red-500
}

function perfTextColor(rate: number) {
  if (rate >= 80) return 'text-indigo-600 dark:text-indigo-400';
  if (rate >= 50) return 'text-amber-600  dark:text-amber-400';
  return                'text-red-600    dark:text-red-400';
}

function perfBadge(rate: number) {
  if (rate >= 80)
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
  if (rate >= 50)
    return 'bg-amber-50  dark:bg-amber-950/60  text-amber-700  dark:text-amber-300  border border-amber-200  dark:border-amber-800';
  return   'bg-red-50    dark:bg-red-950/60    text-red-700    dark:text-red-300    border border-red-200    dark:border-red-800';
}

/* ─────────────────── main page ─────────────────── */
export default function JourneyPage() {
  const [loading, setLoading] = useState(true);
  const [events,  setEvents]  = useState<JourneyEvent[]>([]);
  const [bento,   setBento]   = useState<BentoData | null>(null);

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

  const recentEvents  = events.slice(0, 5);
  const pendingTodos  = bento.totalTodos - bento.completedTodos - bento.failedTodos;
  const totalXp       = bento.weeklyXp.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">

      {/* ── header ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-4xl font-black tracking-tight text-slate-900 dark:text-white"
          style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
        >
          Your Journey
        </h1>
        <p className="text-slate-500 dark:text-zinc-500 mt-1">
          A living record of your wins, streaks &amp; growth.
        </p>
      </motion.header>

      {/* ── bento grid ── */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* HERO — deep indigo gradient instead of neon */}
        <Card
          colSpan={2} rowSpan={2} noPad
          className="
            !bg-gradient-to-br !from-indigo-600 !to-violet-700
            dark:!from-indigo-700 dark:!to-violet-900
            !border-transparent flex flex-col justify-end p-6 min-h-60
          "
        >
          <div
            className="text-7xl font-black text-white leading-none mb-2"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            {totalXp}
          </div>
          <div className="text-[10px] uppercase tracking-[2px] text-indigo-200 font-medium mb-4">
            XP this week
          </div>
          <h2
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            🔥 Keep the streak
          </h2>
          <p className="text-sm text-indigo-200">
            You've logged activity every day this week.
          </p>
        </Card>

        {/* Todos done */}
        <Card>
          <Label>Todos done</Label>
          <BigNum>{bento.completedTodos}</BigNum>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">of {bento.totalTodos} total</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
            +{bento.weeklyCompleted.reduce((a, b) => a + b, 0)} this week
          </span>
        </Card>

        {/* Completion rate */}
        <Card>
          <Label>Completion rate</Label>
          <div className="flex items-baseline gap-1">
            <BigNum>{bento.completionRate}</BigNum>
            <span className="text-lg text-slate-400 dark:text-zinc-500">%</span>
          </div>
          <span className={`inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full font-medium ${perfBadge(bento.completionRate)}`}>
            {bento.overallPerformance}
          </span>
        </Card>

        {/* Failed */}
        <Card>
          <Label>Failed todos</Label>
          <BigNum>{bento.failedTodos}</BigNum>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">missed deadline</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium">
            {bento.weeklyFailed.reduce((a, b) => a + b, 0)} this week
          </span>
        </Card>

        {/* Pending */}
        <Card>
          <Label>Pending</Label>
          <BigNum>{pendingTodos}</BigNum>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">still in progress</p>
          <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium">
            Not overdue
          </span>
        </Card>

        {/* Weekly XP bar chart */}
        <Card colSpan={2}>
          <Label>Weekly XP breakdown</Label>
          <BarChart xp={bento.weeklyXp} />
        </Card>

        {/* 30-day consistency */}
        <Card colSpan={2}>
          <Label>30-day consistency</Label>
          <ConsistencyGrid data={bento.consistencyData} />
          <div className="flex items-center gap-2 mt-3">
            {['None', 'Low', 'Mid', 'High', 'Peak'].map((l, i) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${DOT_SHADES[i]}`} />
                <span className="text-[9px] text-slate-400 dark:text-zinc-600">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
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
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg[ev.icon] ?? 'bg-slate-100 dark:bg-zinc-800'}`}>
                    {iconMap[ev.icon] ?? <CheckCircle size={16} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">
                        {formatDistanceToNow(new Date(ev.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {ev.title}
                    </p>
                  </div>
                </motion.div>
                {i < recentEvents.length - 1 && (
                  <div className="h-px bg-slate-100 dark:bg-zinc-800" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Performance ring */}
        <Card colSpan={2}>
          <Label>Overall performance</Label>
          <div className="flex items-center gap-5 mt-3">
            <PerfRing pct={bento.completionRate} color={perfRingColor(bento.completionRate)} />
            <div>
              <p
                className={`text-xl font-black ${perfTextColor(bento.completionRate)}`}
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
              >
                {bento.overallPerformance}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-[180px]">
                {bento.completionRate >= 80
                  ? "You're crushing it. Maintain the momentum!"
                  : bento.completionRate >= 50
                  ? `Close ${Math.ceil(bento.totalTodos * 0.8) - bento.completedTodos} more todos to reach Excellent.`
                  : 'Pick the top 3 todos and focus on them today.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick stats */}
        <Card colSpan={2}>
          <Label>Quick stats</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'Completed', value: bento.completedTodos, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Failed',    value: bento.failedTodos,    color: 'text-red-600    dark:text-red-400'    },
              { label: 'Pending',   value: pendingTodos,          color: 'text-amber-600  dark:text-amber-400'  },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3"
              >
                <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-600">{label}</p>
                <p
                  className={`text-2xl font-black mt-1 ${color}`}
                  style={{ fontFamily: 'var(--font-syne, sans-serif)' }}
                >
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