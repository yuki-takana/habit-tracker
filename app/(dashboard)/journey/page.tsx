"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, CheckCircle, Target, Trophy, Zap, Shield,
  TrendingUp, TrendingDown, Calendar, Star, TreePine,
  Activity, BookOpen, Briefcase,
  Heart, DollarSign, Brain, BarChart2, Users,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, Tooltip, Cell,
} from 'recharts';

import {
  getJourneyTimeline,
  getJourneyStats,
  type TimelineEvent,
  type JourneyStats,
  type HabitStats,
  type ChallengeStats,
  type ActivePlan,
  type FilterType,
} from '@/app/actions/journey';
import { UflLoaderInline } from '@/components/ui/ufl-loader';

const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PLAN_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Project: { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50  dark:bg-indigo-950/40' },
  Career: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  Business: { icon: BarChart2, color: 'text-amber-500', bg: 'bg-amber-50   dark:bg-amber-950/40' },
  Learning: { icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50     dark:bg-sky-950/40' },
  Health: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50    dark:bg-rose-950/40' },
  Income: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50   dark:bg-green-950/40' },
  Mindset: { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50  dark:bg-purple-950/40' },
  Productivity: { icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50  dark:bg-orange-950/40' },
  Relationship: { icon: Users, color: 'text-pink-500', bg: 'bg-pink-50    dark:bg-pink-950/40' },
};

const EVENT_META = {
  Flame: { bg: 'bg-orange-100 dark:bg-orange-950/50', icon: <Flame size={14} className="text-orange-500" /> },
  CheckCircle: { bg: 'bg-emerald-100 dark:bg-emerald-950/50', icon: <CheckCircle size={14} className="text-emerald-500" /> },
  Target: { bg: 'bg-indigo-100 dark:bg-indigo-950/50', icon: <Target size={14} className="text-indigo-500" /> },
  Trophy: { bg: 'bg-amber-100 dark:bg-amber-950/50', icon: <Trophy size={14} className="text-amber-500" /> },
  Zap: { bg: 'bg-violet-100 dark:bg-violet-950/50', icon: <Zap size={14} className="text-violet-500" /> },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[2px] font-semibold text-slate-400 dark:text-zinc-600 mb-2">
    {children}
  </p>
);

function Card({
  children, className = '', colSpan = 1, rowSpan = 1, noPad = false, delay = 0,
}: {
  children: React.ReactNode; className?: string;
  colSpan?: number; rowSpan?: number; noPad?: boolean; delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`
        relative bg-white dark:bg-zinc-900
        border border-slate-100 dark:border-zinc-800
        rounded-2xl overflow-hidden
        hover:border-indigo-200 dark:hover:border-indigo-900
        hover:shadow-xl hover:shadow-indigo-500/5
        transition-all duration-300
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

// ─── Spark Card ───────────────────────────────────────────────

function SparkCard({
  label, value, sub, trend, trendLabel, data,
  strokeColor, delay = 0, colSpan = 1,
}: {
  label: string; value: string | number; sub?: string;
  trend?: 'up' | 'down'; trendLabel?: string;
  data: number[]; strokeColor: string; delay?: number; colSpan?: number;
}) {
  const chartData = data.map((v, i) => ({ v, i }));
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendCls = trend === 'up' ? 'text-emerald-500' : 'text-red-400';

  return (
    <motion.div
      {...fadeUp(delay)}
      className="relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800
                 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-[10px] uppercase tracking-[1.8px] font-semibold text-slate-400 dark:text-zinc-500">
          {label}
        </span>
        {trend && trendLabel && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trendCls}`}>
            <TrendIcon size={9} /> {trendLabel}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between px-4 pb-4 pt-1 gap-3">
        <div className="z-10 shrink-0">
          <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {value}
          </p>
          {sub && (
            <p className="text-[11px] mt-1 font-medium" style={{ color: strokeColor }}>
              {sub}
            </p>
          )}
        </div>
        <div className="flex-1 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sp-${strokeColor.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="v"
                stroke={strokeColor} strokeWidth={1.5}
                fill={`url(#sp-${strokeColor.replace(/[^a-z0-9]/gi, '')})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Perf Ring ────────────────────────────────────────────────

function PerfRing({ pct, color }: { pct: number; color: string }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-[76px] h-[76px] shrink-0">
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="7"
          className="stroke-slate-100 dark:stroke-zinc-800" />
        <circle cx="38" cy="38" r={r} fill="none" strokeWidth="7"
          strokeLinecap="round" stroke={color}
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-slate-900 dark:text-white">
        {pct}%
      </div>
    </div>
  );
}

// ─── Habit Row ────────────────────────────────────────────────

function HabitRow({ habit, delay }: { habit: HabitStats; delay: number }) {
  const healthColor =
    habit.healthStatus === 'thriving' ? 'text-emerald-500'
      : habit.healthStatus === 'at-risk' ? 'text-amber-500'
        : 'text-red-400';

  return (
    <motion.div {...fadeUp(delay)} className="flex items-center gap-3 py-2.5 group">
      <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
        <Flame size={14} className="text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">{habit.name}</span>
          <span className={`text-[10px] font-bold ${healthColor} shrink-0`}>{habit.healthScore.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {habit.last7Days.map((done, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${done ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-zinc-800'}`} />
          ))}
          <span className="text-[9px] text-slate-400 dark:text-zinc-600 ml-1 shrink-0">{habit.streakCount}🔥</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Challenge Row ────────────────────────────────────────────

function ChallengeRow({ challenge, delay }: { challenge: ChallengeStats; delay: number }) {
  const statusCls =
    challenge.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
      : challenge.status === 'completed' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
        : 'bg-red-50 dark:bg-red-950/50 text-red-500';

  const daysLeft = Math.max(
    0,
    Math.floor((new Date(challenge.endDate).getTime() - Date.now()) / 86_400_000),
  );

  return (
    <motion.div {...fadeUp(delay)} className="py-2.5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
          <Trophy size={14} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">{challenge.title}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${statusCls}`}>{challenge.status}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${challenge.progressPct}%` }} />
            </div>
            <span className="text-[10px] font-bold text-amber-500 shrink-0">{challenge.progressPct.toFixed(0)}%</span>
            {challenge.status === 'active' && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-600 shrink-0">{daysLeft}d left</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────

function PlanBadge({ plan }: { plan: ActivePlan }) {
  const meta = PLAN_META[plan.type] ?? PLAN_META.Project;
  const Icon = meta.icon;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${meta.bg}`}>
      <Icon size={13} className={meta.color} />
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>{plan.type}</p>
        <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[140px]">{plan.userGoals}</p>
      </div>
    </div>
  );
}

// ─── Weekly XP Bars ───────────────────────────────────────────

function WeeklyXpBars({ xp }: { xp: number[] }) {
  const max = Math.max(...xp, 1);

  const data = xp.map((v, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (xp.length - 1 - i));

    const day = date.toLocaleDateString('en-US', { weekday: 'short' });

    return { day, xp: v };
  });

  return (
    <div className="h-28 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700
                               rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                  {payload[0].value} XP
                </div>
              ) : null
            }
          />
          <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                className={
                  entry.xp >= max * 0.7
                    ? 'fill-indigo-500 dark:fill-indigo-400'
                    : 'fill-slate-200 dark:fill-zinc-700'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
// ─── Consistency Grid ─────────────────────────────────────────

const DOT_SHADES = [
  'bg-slate-100 dark:bg-zinc-800',
  'bg-indigo-100 dark:bg-indigo-900/60',
  'bg-indigo-300 dark:bg-indigo-700',
  'bg-indigo-500',
  'bg-indigo-700 dark:bg-indigo-400',
];

function ConsistencyGrid({ data }: { data: number[] }) {
  return (
    <>
      <div className="grid gap-1 mt-3" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
        {data.map((v, i) => (
          <div key={i} className={`aspect-square rounded-sm ${DOT_SHADES[Math.min(v, 4)]}`} title={`${v} completions`} />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        {['None', 'Low', 'Mid', 'High', 'Peak'].map((l, i) => (
          <div key={l} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${DOT_SHADES[i]}`} />
            <span className="text-[9px] text-slate-400 dark:text-zinc-600">{l}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Timeline Row ─────────────────────────────────────────────

function TimelineRow({ event, i }: { event: TimelineEvent; i: number }) {
  const meta = EVENT_META[event.icon];
  return (
    <motion.div {...fadeUp(i * 0.06)} className="flex items-start gap-3 py-3 group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] uppercase tracking-widest font-semibold text-indigo-500 dark:text-indigo-400">
            {event.type}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-600 shrink-0">
            {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate mt-0.5
                       group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {event.title}
        </p>
        {event.xp ? <span className="text-[10px] text-amber-500 font-semibold">+{event.xp} XP</span> : null}
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="max-w-lg mx-auto py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800
                      flex items-center justify-center mx-auto mb-6">
        <Calendar className="text-slate-400 dark:text-zinc-600" size={36} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Your journey starts now</h2>
      <p className="text-slate-500 dark:text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
        Complete habits, finish todos, close tasks, and build challenges — your story will unfold here.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function JourneyPage() {
  const [filter, setFilter] = useState<FilterType>('7D');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<JourneyStats | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);   // full-page spinner only on first open
  const [fetching, setFetching] = useState(false);  // subtle indicator on filter switch

  // Cache: keeps every filter result we've already fetched this session
  const statsCache = React.useRef<Partial<Record<FilterType, JourneyStats>>>({});

  useEffect(() => {
    const load = async () => {
      // If we already have this filter cached, switch instantly — no spinner, no fetch
      if (statsCache.current[filter]) {
        setStats(statsCache.current[filter]!);
        return;
      }

      // First ever load → full-page spinner; subsequent → subtle pill only
      if (initialLoad) {
        setFetching(false);
      } else {
        setFetching(true);
      }

      try {
        // Timeline only needs to be fetched once — it doesn't change per filter
        const statsPromise = getJourneyStats(filter);
        const timelinePromise = timeline.length === 0 ? getJourneyTimeline() : Promise.resolve(null);

        const [st, tl] = await Promise.all([statsPromise, timelinePromise]);
        console.log("================================== fetching filtered todos data =======================>", st)
        statsCache.current[filter] = st;
        setStats(st);
        if (tl) setTimeline(tl);
      } catch (err) {
        console.error('Journey load error:', err);
      } finally {
        setInitialLoad(false);
        setFetching(false);
      }
    };
    load();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <UflLoaderInline style="pulse-dots" text="Loading your journey…" />
      </div>
    );
  }

  if (!stats || (timeline.length === 0 && stats.totalTodos === 0)) return <EmptyState />;

  const recentEvents = timeline.slice(0, 8);
  const perfColor = stats.completionRate >= 80 ? '#6366f1' : stats.completionRate >= 50 ? '#f59e0b' : '#ef4444';
  const perfTextCls = stats.completionRate >= 80 ? 'text-indigo-500' : stats.completionRate >= 50 ? 'text-amber-500' : 'text-red-400';

  const filterLabel =
    filter === 'Today' ? 'today'
      : filter === '7D' ? 'this week'
        : filter === 'Month' ? 'this month'
          : filter === 'Year' ? 'this year'
            : 'all time';

  // Server already computed the right chart arrays for this filter
  const { chartXp, chartCompleted, chartFailed, chartRate } = stats;
  const totalXp = chartXp.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto pb-28 px-4 sm:px-6">
      {fetching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur + dark overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Loader content */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <UflLoaderInline style="pulse-dots" text="Updating your journey..." />
          </div>
        </div>
      )}
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.header {...fadeUp()} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Your Journey 🎯
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 mt-1 text-sm">
              Every win, every streak, every step forward — all in one place.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 self-start border border-slate-200 dark:border-zinc-800 flex-wrap">
              {(['Today', '7D', 'Month', 'Year', 'All Time'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  disabled={fetching}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === f
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Bento Grid ─────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        {/* Hero XP card */}
        <Card colSpan={2} rowSpan={2} noPad delay={0}
          className="bg-gradient-to-br from-indigo-800 to-violet-900 dark:from-indigo-900 dark:to-violet-950 border-transparent! flex flex-col justify-end p-6 min-h-64">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartXp.map((v, i) => ({ v, i }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hero-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotoneX" dataKey="v" stroke="#fff" strokeWidth={1.5} fill="url(#hero-grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Star size={11} className="text-amber-300 fill-amber-300" />
            <span className="text-xs font-black text-white">LVL {stats.level}</span>
          </div>

          <div className="relative z-10">
            <p className="text-[60px] sm:text-[72px] font-black text-white leading-none mb-1 tabular-nums">
              {totalXp.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] uppercase tracking-[2px] text-indigo-200 font-semibold">
                XP · {filterLabel}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {stats.xp.toLocaleString()} total
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
                <Flame size={13} className="text-orange-300" />
                <span className="text-xs font-black text-white">{stats.totalStreakDays} day streak</span>
              </div>
              {stats.streakShields > 0 && (
                <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
                  <Shield size={13} className="text-sky-300" />
                  <span className="text-xs font-black text-white">{stats.streakShields} shields</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Todos Done */}
        <SparkCard
          label="Todos Done"
          value={stats.totalTodos}
          sub={`+${stats.completedTodos} ${filterLabel}`}
          trend="up"
          trendLabel={`${stats.completionRate}%`}
          data={chartCompleted}
          strokeColor="#10b981"
          delay={0.05}
        />

        {/* Completion Rate */}
        <SparkCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          sub={stats.overallPerformance}
          trend={stats.completionRate >= 50 ? 'up' : 'down'}
          trendLabel={`of ${stats.totalTodos} todos`}
          data={chartRate}
          strokeColor={perfColor}
          delay={0.1}
        />

        {/* Failed */}
        <SparkCard
          label="Failed Todos"
          value={stats.failedTodos}
          sub={`${stats.failedTodos} ${filterLabel}`}
          trend="down"
          trendLabel="missed"
          data={chartFailed}
          strokeColor="#ef4444"
          delay={0.15}
        />

        {/* Pending */}
        <SparkCard
          label="Pending"
          value={stats.pendingTodos}
          sub="still in progress"
          data={chartCompleted.map((v, i) => Math.max(0, stats.totalTodos - v - (chartFailed[i] ?? 0)))}
          strokeColor="#f59e0b"
          delay={0.2}
        />

        {/* Weekly XP bars — always 7-day, unaffected by filter */}
        <Card colSpan={2} delay={0.1}>
          <SectionLabel>Weekly XP breakdown</SectionLabel>
          <WeeklyXpBars xp={stats.weeklyXp} />
        </Card>

        {/* 30-day consistency — always 30-day, unaffected by filter */}
        <Card colSpan={2} delay={0.12}>
          <SectionLabel>30-day consistency</SectionLabel>
          <ConsistencyGrid data={stats.consistencyData} />
        </Card>

        {/* Merged: Activity + Habits + Plans */}
        <Card colSpan={2} rowSpan={2} delay={0.15}>
          <div className="flex flex-col gap-6">
            <div>
              <SectionLabel>Activity overview</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-100 dark:border-orange-900/50', icon: <Flame size={14} className="text-orange-500" />, val: stats.totalHabits, label: 'Habits', cls: 'text-orange-500' },
                  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-100 dark:border-indigo-900/50', icon: <Target size={14} className="text-indigo-500" />, val: stats.completedTasks, label: 'Tasks', cls: 'text-indigo-500' },
                  { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/50', icon: <Trophy size={14} className="text-amber-500" />, val: stats.activeChallenges, label: 'Challenges', cls: 'text-amber-500' },
                  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/50', icon: <TreePine size={14} className="text-emerald-500" />, val: stats.aliveTrees, label: 'Trees', cls: 'text-emerald-500' },
                ].map(({ bg, border, icon, val, label, cls }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center flex flex-col items-center justify-center border ${border}`}>
                    {icon}
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{val}</p>
                    <p className={`text-[9px] uppercase font-bold ${cls} mt-1`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {stats.habits.length > 0 && (
              <div>
                <SectionLabel>Active habits</SectionLabel>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {stats.habits.slice(0, 4).map((h, i) => <HabitRow key={h.id} habit={h} delay={i * 0.05} />)}
                </div>
                {stats.habits.length > 4 && (
                  <p className="text-xs text-slate-400 dark:text-zinc-600 mt-2 text-center">
                    +{stats.habits.length - 4} more habits
                  </p>
                )}
              </div>
            )}

            {stats.activePlans.length > 0 && (
              <div>
                <SectionLabel>Active plans</SectionLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stats.activePlans.slice(0, 4).map((plan, i) => <PlanBadge key={`${plan.type}-${i}`} plan={plan} />)}
                  {stats.activePlans.length > 4 && (
                    <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">+{stats.activePlans.length - 4} more</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Overall performance */}
        <Card colSpan={2} delay={0.18}>
          <SectionLabel>Overall performance</SectionLabel>
          <div className="flex items-center gap-5 mt-3">
            <PerfRing pct={stats.completionRate} color={perfColor} />
            <div>
              <p className={`text-xl font-black ${perfTextCls}`}>{stats.overallPerformance}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-[200px]">
                {stats.completionRate >= 80
                  ? "You're crushing it. Maintain the momentum!"
                  : stats.completionRate >= 50
                    ? `Close ${Math.ceil(stats.totalTodos * 0.8) - stats.completedTodos} more todos to reach Excellent.`
                    : 'Pick your top 3 todos and focus on them today.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick stats */}
        <Card colSpan={2} delay={0.2}>
          <SectionLabel>Quick stats</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: 'Completed', value: stats.completedTodos, cls: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Failed', value: stats.failedTodos, cls: 'text-red-500 dark:text-red-400' },
              { label: 'Pending', value: stats.pendingTodos, cls: 'text-amber-600 dark:text-amber-400' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 rounded-xl p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-600">{label}</p>
                <p className={`text-2xl font-black mt-1 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Challenges */}
        {stats.challenges.length > 0 && (
          <Card colSpan={2} delay={0.24}>
            <SectionLabel>Challenges</SectionLabel>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {stats.challenges.slice(0, 4).map((c, i) => <ChallengeRow key={c.id} challenge={c} delay={i * 0.05} />)}
            </div>
          </Card>
        )}

        {/* Recent timeline */}
        <Card colSpan={2} rowSpan={2} delay={0.28}>
          <SectionLabel>Recent activity</SectionLabel>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-600 mt-4 text-center py-8">
              No activity yet — get started!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {recentEvents.map((ev, i) => <TimelineRow key={`${ev.id}-${i}`} event={ev} i={i} />)}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}