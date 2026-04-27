"use client";

import React, { useEffect, useState } from 'react';
import { getJourneyData, getJourneyBentoData } from '@/app/actions/journey';
import { Flame, CheckCircle, Target, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { UflLoaderInline } from '@/components/ui/ufl-loader';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ResponsiveContainer, BarChart as ReBarChart,
  Bar, XAxis, Tooltip, Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { getFontSize } from '@/lib/utils/getFontSize';

/* ─────────────────── types ─────────────────── */
type FilterRange = 'Today' | '7D' | 'Month' | 'Year' | 'All';

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
  monthlyXp: number[];
  monthlyCompleted: number[];
  dailyRateTrend: number[];
}

interface JourneyEvent {
  id: string;
  date: Date;
  type: string;
  title: string;
  description?: string;
  icon: string;
}

/* ─────────────────── consistency dots ─────────────────── */
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
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-900 dark:text-white">
        {pct}%
      </div>
    </div>
  );
}

/* ─────────────────── icon maps ─────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame className="text-orange-500" size={16} />,
  CheckCircle: <CheckCircle className="text-emerald-500" size={16} />,
  Target: <Target className="text-indigo-500" size={16} />,
};
const iconBg: Record<string, string> = {
  Flame: 'bg-orange-100  dark:bg-orange-950/60',
  CheckCircle: 'bg-emerald-100 dark:bg-emerald-950/60',
  Target: 'bg-indigo-100  dark:bg-indigo-950/60',
};

/* ─────────────────── base card ─────────────────── */
function Card({
  children, className = '', colSpan = 1, rowSpan = 1, noPad = false,
}: {
  children: React.ReactNode; className?: string;
  colSpan?: number; rowSpan?: number; noPad?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        relative bg-white dark:bg-zinc-900/60
        border border-slate-200 dark:border-zinc-800
        rounded-2xl overflow-hidden
        hover:border-indigo-300 dark:hover:border-indigo-800
        hover:shadow-lg hover:shadow-indigo-500/5
        transition-all duration-300
        ${noPad ? '' : 'p-5'} ${className}
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

/* ─────────────────── split stat card (inspired by reference) ─────────────────── */
function StatCard({
  label, value, subLabel, trend, trendLabel, data, color, gradStart, gradEnd, colSpan = 1,
}: {
  label: string; value: number | string; subLabel?: string;
  trend?: 'up' | 'down'; trendLabel?: string;
  data: number[]; color: string; gradStart: string; gradEnd: string;
  colSpan?: number;
}) {
  const chartData = data.map((v, i) => ({ v, i }));
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 
                 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4">
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
          {label}
        </p>

        {trend && trendLabel && (
          <span className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${trendColor}`}>
            <TrendIcon size={10} className="sm:w-3 sm:h-3" />
            {trendLabel}
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between 
                      px-4 sm:px-5 pb-4 sm:pb-5 pt-2 sm:pt-3 gap-3 sm:gap-4">

        {/* number */}
        <div className="z-10">
          <p
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none">
            {value}
          </p>

          {subLabel && (
            <p
              className="text-[10px] sm:text-[11px] mt-1 sm:mt-1.5 font-medium"
              style={{ color }}
            >
              {subLabel}
            </p>
          )}
        </div>

        {/* chart */}
        <div className="w-full sm:flex-1 h-16 sm:h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradStart} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={gradEnd} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1}
                fill={`url(#sg-${color.replace('#', '')})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
/* ─────────────────── weekly xp bar chart ─────────────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeeklyXpBar({ xp }: { xp: number[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const data = xp.map((v, i) => ({ day: DAYS[i], xp: v }));
  const max = Math.max(...xp, 1);
  return (
    <div className="mt-3 h-28">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} barCategoryGap="30%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white shadow-sm">
                  {payload[0].value} XP
                </div>
              ) : null
            }
          />
          <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.xp >= max * 0.7
                  ? isDark
                    ? "#818cf8"   // highlight (dark)
                    : "#6366f1"   // highlight (light)
                  : isDark
                    ? "#3f3f46"   // base (dark)
                    : "#e5e7eb"   // base (light)
                }
              // className="dark:fill-red-400"
              />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────── helpers ─────────────────── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[1.8px] text-slate-400 dark:text-zinc-600 font-medium mb-2">
    {children}
  </p>
);

function perfRingColor(rate: number) {
  if (rate >= 80) return '#6366f1';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}

function perfTextColor(rate: number) {
  if (rate >= 80) return 'text-indigo-600 dark:text-indigo-400';
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function perfBadge(rate: number) {
  if (rate >= 80) return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
  if (rate >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800';
}

/* ─────────────────── empty state ─────────────────── */
function EmptyState() {
  return (
    <div className="max-w-lg mx-auto py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6">
        <Calendar className="text-slate-400 dark:text-zinc-600" size={36} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
        Your journey starts now
      </h2>
      <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Complete habits, finish todos, and close tasks to see your story unfold here.
      </p>
    </div>
  );
}

/* ─────────────────── main page ─────────────────── */
export default function JourneyPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [bento, setBento] = useState<BentoData | null>(null);
  const [filter, setFilter] = useState<FilterRange>('7D');

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
  const pendingTodos = Math.max(0, bento.totalTodos - bento.completedTodos - bento.failedTodos);

  // Filter-aware data — Today = last element of the 7-day arrays
  const todayVal = (arr: number[]) => {
    const v = arr[6] ?? 0;
    // Pad to 5 points so the area chart renders a rising curve
    return [0, Math.round(v * 0.2), Math.round(v * 0.5), Math.round(v * 0.8), v];
  };

  const activeXp = filter === 'Today' ? todayVal(bento.weeklyXp)
    : filter === 'Month' || filter === 'Year' ? bento.monthlyXp
      : bento.weeklyXp;
  const activeCompleted = filter === 'Today' ? todayVal(bento.weeklyCompleted)
    : filter === 'Month' || filter === 'Year' ? bento.monthlyCompleted
      : bento.weeklyCompleted;
  const activeFailed = filter === 'Today' ? todayVal(bento.weeklyFailed)
    : bento.weeklyFailed;
  const activePending = activeCompleted.map((v, i) =>
    Math.max(0, bento.totalTodos - v - (activeFailed[i] ?? 0))
  );
  const activeRate = activeCompleted.map((v, i) =>
    bento.totalTodos > 0 ? Math.round((v / bento.totalTodos) * 100) : 0
  );

  const totalXp = activeXp.reduce((a, b) => a + b, 0);
  const weekCompleted = activeCompleted.reduce((a, b) => a + b, 0);
  const weekFailed = activeFailed.reduce((a, b) => a + b, 0);
  const xpChartData = activeXp.map((v, i) => ({ v, i }));
  const filterLabel = filter === 'Today' ? 'today' : filter === '7D' ? 'this week' : filter === 'Month' ? 'this month' : filter === 'Year' ? 'this year' : 'all time';

  // When Today is selected: all stat card charts show XP graph
  // When other filters: each card shows its own data trend
  const todayXpCurve = todayVal(bento.weeklyXp);
  const cardChart = (ownData: number[]) =>
    filter === 'Today' ? todayXpCurve : ownData;

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">

      {/* header */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Your Journey 🎯
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 mt-1">
              A living record of your wins, streaks &amp; growth.
            </p>
          </div>
          {/* Filter pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 self-start mt-1">
            {(['Today', '7D', 'Month', 'Year', 'All'] as FilterRange[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* HERO — with background organic area chart */}
        <Card
          colSpan={2} rowSpan={2} noPad
          className="bg-linear-to-br! from-indigo-800! to-violet-800! dark:from-indigo-900! dark:to-violet-950! border-transparent! flex flex-col justify-end p-6 min-h-60"
        >
          {/* Background blob chart */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hero-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotoneX" dataKey="v" stroke="#ffffff" strokeWidth={1} fill="url(#hero-grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10">
            <div
              className="font-black text-white leading-none mb-1"
              style={{
                fontSize: getFontSize(totalXp),
              }}
            >
              {totalXp}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] uppercase tracking-[2px] text-indigo-200 font-medium">
                XP · {filter === 'Today' ? 'Today' : filter === '7D' ? 'This week' : filter === 'Month' ? 'This month' : filter === 'Year' ? 'This year' : 'All time'}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                +{weekCompleted} tasks
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              🔥 Keep the streak
            </h2>
            <p className="text-sm text-indigo-200">You've logged activity every day this week.</p>
          </div>
        </Card>
        {/* <div className="grid grid-cols-2  lg:grid-cols- gap-4"> */}
        {/* Todos done — split layout */}
        <StatCard
          label="Todos done"
          value={bento.completedTodos}
          subLabel={`+${weekCompleted} ${filterLabel}`}
          trend="up"
          trendLabel={`${bento.completionRate}%`}
          data={cardChart(activeCompleted)}
          color="#10b981"
          gradStart="#10b981"
          gradEnd="#d1fae5"
        />

        {/* Completion rate — with area chart */}
        <StatCard
          label="Completion rate"
          value={`${bento.completionRate}%`}
          subLabel={bento.overallPerformance}
          trend={bento.completionRate >= 50 ? 'up' : 'down'}
          trendLabel={`of ${bento.totalTodos} todos`}
          data={cardChart(activeRate.length > 0 ? activeRate : (bento.dailyRateTrend ?? bento.weeklyCompleted))}
          color={bento.completionRate >= 80 ? '#6366f1' : bento.completionRate >= 50 ? '#f59e0b' : '#ef4444'}
          gradStart={bento.completionRate >= 80 ? '#6366f1' : bento.completionRate >= 50 ? '#f59e0b' : '#ef4444'}
          gradEnd={bento.completionRate >= 80 ? '#ede9fe' : bento.completionRate >= 50 ? '#fef3c7' : '#fee2e2'}
        />

        {/* Failed — split layout */}
        <StatCard
          label="Failed todos"
          value={bento.failedTodos}
          subLabel={`${weekFailed} ${filterLabel}`}
          trend="down"
          trendLabel="missed"
          data={cardChart(activeFailed)}
          color="#ef4444"
          gradStart="#ef4444"
          gradEnd="#fee2e2"
        />

        {/* Pending — split layout */}
        <StatCard
          label="Pending"
          value={pendingTodos}
          subLabel="still in progress"
          data={cardChart(activePending)}
          color="#f59e0b"
          gradStart="#f59e0b"
          gradEnd="#fef3c7"
        />
        {/* </div> */}
        {/* Weekly XP bar chart — FIXED */}
        <Card colSpan={2}>
          <Label>Weekly XP breakdown</Label>
          <WeeklyXpBar xp={bento.weeklyXp} />
        </Card>

        {/* 30-day consistency — UNTOUCHED */}
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

        {/* Recent activity — UNTOUCHED */}
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

        {/* Overall performance — UNTOUCHED */}
        <Card colSpan={2}>
          <Label>Overall performance</Label>
          <div className="flex items-center gap-5 mt-3">
            <PerfRing pct={bento.completionRate} color={perfRingColor(bento.completionRate)} />
            <div>
              <p className={`text-xl font-black ${perfTextColor(bento.completionRate)}`}>
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

        {/* Quick stats — UNTOUCHED */}
        <Card colSpan={2}>
          <Label>Quick stats</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'Completed', value: bento.completedTodos, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Failed', value: bento.failedTodos, color: 'text-red-600 dark:text-red-400' },
              { label: 'Pending', value: pendingTodos, color: 'text-amber-600 dark:text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label}
                className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-600">{label}</p>
                <p className={`text-2xl font-black mt-1 ${color}`}>
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