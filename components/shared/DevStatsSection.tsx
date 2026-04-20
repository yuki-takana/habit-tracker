"use client";

/**
 * DevStatsSection.tsx
 * Drop-in replacement for the WakaTime "Discipline Architect: Dev Stats" block.
 *
 * Usage in CodingPage:
 *   import { DevStatsSection } from "@/components/coding/DevStatsSection";
 *   ...
 *   {!loadingStats && <DevStatsSection stats={stats} />}
 */

import { Clock, Code2, Layers, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

/* ─────────────────── palette ─────────────────── */
const CHART_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
  "#38bdf8",
];

/* ─────────────────── helpers ─────────────────── */
function toMinutes(seconds: number): number {
  return Math.round((seconds ?? 0) / 60);
}

function fmtMin(v: number | string): string {
  const m = Number(v);
  if (m >= 60) return `${(m / 60).toFixed(1)}h`;
  return `${m}m`;
}

/* ─────────────────── custom tooltip ─────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      {label && (
        <p className="text-slate-500 dark:text-zinc-400 mb-1 font-medium">{label}</p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.color || entry.fill }}
          />
          <span className="text-slate-700 dark:text-zinc-200 font-semibold">
            {entry.name}: {fmtMin(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────── StatsCard ─────────────────── */
const StatsCard = ({
  children,
  className = "",
  colSpan = 1,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) => (
  <div
    className={`
      rounded-3xl border border-slate-200 dark:border-zinc-800
      bg-white dark:bg-zinc-900/60
      hover:border-indigo-500/40 dark:hover:border-indigo-500/30
      hover:shadow-xl hover:shadow-indigo-500/5
      transition-all duration-300 p-5 overflow-hidden
      ${colSpan === 2 ? "md:col-span-2" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

/* ─────────────────── SectionLabel ─────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-zinc-600 font-semibold mb-1">
    {children}
  </p>
);

/* ─────────────────── StatPill ─────────────────── */
type Accent = "indigo" | "cyan" | "amber" | "emerald";

const ACCENT_CLASSES: Record<Accent, string> = {
  indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  cyan:   "bg-cyan-50   dark:bg-cyan-900/20   text-cyan-600   dark:text-cyan-400",
  amber:  "bg-amber-50  dark:bg-amber-900/20  text-amber-600  dark:text-amber-400",
  emerald:"bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
};

const StatPill = ({
  icon,
  label,
  value,
  accent = "indigo",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: Accent;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_CLASSES[accent]}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</p>
      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  </div>
);

/* ─────────────────── types ─────────────────── */
interface WakaEntry {
  name: string;
  total_seconds: number;
}

export interface DevStatsSectionProps {
  stats: {
    projects?: WakaEntry[] | null;
    languages?: WakaEntry[] | null;
    editors?: WakaEntry[] | null;
    grand_total?: { total_seconds?: number; human_readable_total?: string };
  } | null | undefined;
}

/* ─────────────────── MAIN EXPORT ─────────────────── */
export function DevStatsSection({ stats }: DevStatsSectionProps) {
  // ── hard guard: nothing to render ──
  if (!stats) return null;

  // ── safe arrays — the root fix for .reduce on undefined ──
  const projects: WakaEntry[] = Array.isArray(stats.projects) ? stats.projects : [];
  const languages: WakaEntry[] = Array.isArray(stats.languages) ? stats.languages : [];
  const editors: WakaEntry[] = Array.isArray(stats.editors) ? stats.editors : [];

  // ── multi-series area data (single data-point arrays) ──
  const projectChartData = [
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.name] = toMinutes(p.total_seconds);
      return acc;
    }, {}),
  ];

  const languageChartData = [
    languages.reduce<Record<string, number>>((acc, l) => {
      acc[l.name] = toMinutes(l.total_seconds);
      return acc;
    }, {}),
  ];

  // ── bar / area ──
  const projectBars = projects.slice(0, 8).map((p) => ({
    name: p.name.slice(0, 16),
    minutes: toMinutes(p.total_seconds),
  }));

  const languageBars = languages.slice(0, 8).map((l) => ({
    name: l.name,
    minutes: toMinutes(l.total_seconds),
  }));

  // ── donut ──
  const langPie = languages.slice(0, 6).map((l, i) => ({
    name: l.name,
    value: toMinutes(l.total_seconds),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // ── radar ──
  const editorRadar = editors.slice(0, 6).map((e) => ({
    subject: e.name,
    minutes: toMinutes(e.total_seconds),
  }));

  // ── summary ──
  const totalCodingMin = projects.reduce((s, p) => s + toMinutes(p.total_seconds), 0);
  const topProject = projects[0]?.name ?? "—";
  const topLang = languages[0]?.name ?? "—";
  const projectCount = projects.length;

  // ── empty state ──
  if (projectCount === 0 && languages.length === 0) {
    return (
      <div className="mt-2 py-16 text-center text-slate-400 dark:text-zinc-600">
        <p className="text-sm font-medium">No WakaTime data available yet for today.</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* ── header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Discipline Architect<span className="text-indigo-500">.</span>
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 text-sm mt-0.5">
            Dev stats — today's coding activity from WakaTime
          </p>
        </div>
        <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
          Live
        </span>
      </div>

      {/* ── summary pills ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatPill icon={<Clock size={16} />}     label="Total today"      value={fmtMin(totalCodingMin)} accent="indigo"  />
        <StatPill icon={<Layers size={16} />}    label="Projects active"  value={String(projectCount)}   accent="cyan"    />
        <StatPill icon={<TrendingUp size={16} />} label="Top project"     value={topProject}             accent="amber"   />
        <StatPill icon={<Code2 size={16} />}     label="Top language"     value={topLang}                accent="emerald" />
      </div>

      {/* ── charts grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 1 — multi-series area: projects */}
        {projects.length > 0 && (
          <StatsCard>
            <SectionLabel>Projects · multi-series area</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Projects — Time Spent
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectChartData}>
                  <defs>
                    {projects.map((p, i) => (
                      <linearGradient key={`gP${i}`} id={`gP${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis hide />
                  <YAxis tickFormatter={fmtMin} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  {projects.map((p, i) => (
                    <Area
                      key={p.name}
                      type="monotone"
                      dataKey={p.name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      fill={`url(#gP${i})`}
                      dot={false}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

        {/* 2 — multi-series area: languages */}
        {languages.length > 0 && (
          <StatsCard>
            <SectionLabel>Languages · multi-series area</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Languages — Time Spent
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={languageChartData}>
                  <defs>
                    {languages.map((l, i) => (
                      <linearGradient key={`gL${i}`} id={`gL${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis hide />
                  <YAxis tickFormatter={fmtMin} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  {languages.map((l, i) => (
                    <Area
                      key={l.name}
                      type="monotone"
                      dataKey={l.name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      fill={`url(#gL${i})`}
                      dot={false}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

        {/* 3 — horizontal bar: project ranking */}
        {projectBars.length > 0 && (
          <StatsCard>
            <SectionLabel>Projects · bar ranking</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Project Time Ranking
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectBars} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <XAxis type="number" tickFormatter={fmtMin} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <Bar dataKey="minutes" radius={[0, 6, 6, 0]} maxBarSize={16}>
                    {projectBars.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

        {/* 4 — donut: language distribution */}
        {langPie.length > 0 && (
          <StatsCard>
            <SectionLabel>Languages · distribution</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Language Share
            </h3>
            <div className="h-52 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={langPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {langPie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 pl-2 space-y-1.5 overflow-y-auto max-h-48">
                {langPie.map((l) => (
                  <div key={l.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.fill }} />
                      <span className="text-xs text-slate-600 dark:text-zinc-300 truncate">{l.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                      {fmtMin(l.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </StatsCard>
        )}

        {/* 5 — single area: project depth */}
        {projectBars.length > 0 && (
          <StatsCard>
            <SectionLabel>Projects · depth view</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Project Depth View
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectBars}>
                  <defs>
                    <linearGradient id="gradDepth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}  />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={40} />
                  <YAxis tickFormatter={fmtMin} tick={{ fontSize: 10 }} width={36} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#gradDepth)"
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

        {/* 6 — single area: language flow */}
        {languageBars.length > 0 && (
          <StatsCard>
            <SectionLabel>Languages · flow view</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Language Usage Flow
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={languageBars}>
                  <defs>
                    <linearGradient id="gradLangFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3}  />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={40} />
                  <YAxis tickFormatter={fmtMin} tick={{ fontSize: 10 }} width={36} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    fill="url(#gradLangFlow)"
                    dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#22d3ee" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

        {/* 7 — radar: editors (only if WakaTime returns editor data) */}
        {editorRadar.length > 0 && (
          <StatsCard colSpan={2}>
            <SectionLabel>Editors · radar</SectionLabel>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Editor Usage Radar
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={editorRadar}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar
                    dataKey="minutes"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>
        )}

      </div>
    </div>
  );
}