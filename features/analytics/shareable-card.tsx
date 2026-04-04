"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Loader2, Share2, Settings2, Palette, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { DurKey, CardStats, Visibility, CardTheme, THEMES } from "./shareable-card-themes";

const FREE_THEMES = THEMES.filter((t) => t.tier === "free");
const PRO_THEMES = THEMES.filter((t) => t.tier === "pro");

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const DUR_LABELS: Record<DurKey, string> = {
    "1d": "Today", "1w": "This Week", "1m": "This Month", "1y": "This Year",
};
const DUR_TAB: Record<DurKey, string> = {
    "1d": "Day", "1w": "Week", "1m": "Month", "1y": "Year",
};

const SECTION_META: { key: keyof Visibility; icon: string; label: string }[] = [
    { key: "header", icon: "👤", label: "Profile header" },
    { key: "periodTabs", icon: "📅", label: "Period tabs" },
    { key: "graph", icon: "📈", label: "XP graph" },
    { key: "levelBlock", icon: "⚡", label: "Level / Role" },
    { key: "heroXp", icon: "✨", label: "Hero XP number" },
    { key: "streakShield", icon: "🔥", label: "Streak & Shields" },
    { key: "treesTodo", icon: "🌳", label: "Trees & Todos" },
    { key: "categories", icon: "🏷️", label: "Top habits" },
    { key: "footer", icon: "🔗", label: "Footer / CTA" },
];

const DEFAULT_VIS: Visibility = {
    header: true, periodTabs: false, graph: true, levelBlock: true,
    heroXp: true, streakShield: true, treesTodo: true, categories: true, footer: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildPaths(raw: number[], W = 320, H = 52, pad = 5) {
    const data = raw.length >= 2 ? raw : [0, ...raw, 0];
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const range = mx - mn || 1;
    const pts = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (W - pad * 2),
        y: H - pad - ((v - mn) / range) * (H - pad * 2),
    }));
    const line = pts.reduce((acc, p, i) => {
        if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        const prev = pts[i - 1];
        const cpx = (prev.x + p.x) / 2;
        return acc + ` C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }, "");
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H - pad} L${pts[0].x.toFixed(1)},${H - pad} Z`;
    return { line, area, last: pts[pts.length - 1] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, t, gradId }: { data: number[]; t: CardTheme; gradId: string }) {
    const { line, area, last } = buildPaths(data);
    return (
        <svg width="100%" height="52" viewBox="0 0 320 52" preserveAspectRatio="none" style={{ display: "block" }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.main} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={t.main} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradId})`} />
            <path d={line} fill="none" stroke={t.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last.x} cy={last.y} r={4} fill={t.mainAlt} opacity={0.45} />
            <circle cx={last.x} cy={last.y} r={2.5} fill={t.main} />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Level Arc
// ─────────────────────────────────────────────────────────────────────────────

function LevelArc({ pct, level, t }: { pct: number; level: number; t: CardTheme }) {
    const r = 26;
    const circ = 2 * Math.PI * r;
    const clamped = Math.min(Math.max(pct, 0), 1);
    const arcId = `arc-${t.id}`;
    return (
        <div style={{ position: "relative", flexShrink: 0, width: 64, height: 64 }}>
            <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
                <defs>
                    <linearGradient id={arcId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={t.main} />
                        <stop offset="100%" stopColor={t.mainAlt} />
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
                <circle cx="32" cy="32" r={r} fill="none" stroke={`url(#${arcId})`} strokeWidth={3}
                    strokeDasharray={`${circ * clamped} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: t.main, fontSize: 15, fontWeight: 900, lineHeight: 1 }}>{level}</span>
                <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 7, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>LVL</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCell
// ─────────────────────────────────────────────────────────────────────────────

function StatCell({ icon, value, label, t }: { icon: string; value: string; label: string; t: CardTheme }) {
    return (
        <div style={{
            background: t.statBg, borderRadius: 12, padding: "10px 6px 8px",
            border: `1px solid ${t.dim}`, textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
            <span style={{ color: "#ede9fe", fontSize: 16, fontWeight: 900, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle} style={{
            width: 34, height: 19, borderRadius: 10, border: "none", cursor: "pointer",
            background: on ? "rgba(74,222,154,0.28)" : "rgba(255,255,255,0.08)",
            position: "relative", flexShrink: 0, transition: "background .2s", padding: 0,
        }}>
            <div style={{
                position: "absolute", top: 2, left: on ? 17 : 2,
                width: 15, height: 15, borderRadius: "50%",
                background: on ? "#4ade9a" : "rgba(255,255,255,0.3)",
                transition: "left .2s, background .2s",
            }} />
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Picker
// ─────────────────────────────────────────────────────────────────────────────

function ThemeSwatch({
    theme, selected, locked, onSelect,
}: {
    theme: CardTheme; selected: boolean; locked: boolean; onSelect: (id: string) => void;
}) {
    return (
        <button
            onClick={() => { if (!locked) onSelect(theme.id); }}
            style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px",
                background: selected ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.03)",
                border: selected ? `1px solid ${theme.main}55` : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 11, cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.5 : 1, transition: "all .15s",
                width: "100%", textAlign: "left",
            }}
        >
            {/* Swatch */}
            <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: theme.swatch,
                border: selected ? `1.5px solid ${theme.main}` : "1.5px solid rgba(255,255,255,0.1)",
                position: "relative", overflow: "hidden",
            }}>
                {locked && (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.45)",
                    }}>
                        <Lock size={10} color="rgba(255,255,255,0.8)" />
                    </div>
                )}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{
                    color: selected ? theme.main : "rgba(255,255,255,0.65)",
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{theme.name}</div>
                {selected && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, marginTop: 2 }}>Active</div>}
            </div>
            {selected && (
                <div style={{ marginLeft: "auto", flexShrink: 0, width: 8, height: 8, borderRadius: "50%", background: theme.main }} />
            )}
        </button>
    );
}

function ThemePicker({
    isPro, selected, onSelect,
}: {
    isPro: boolean; selected: string; onSelect: (id: string) => void;
}) {
    return (
        <div>
            {/* Free row */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                    Free themes
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {FREE_THEMES.map((th) => (
                        <ThemeSwatch key={th.id} theme={th} selected={selected === th.id} locked={false} onSelect={onSelect} />
                    ))}
                </div>
            </div>

            {/* Pro row */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                        Pro themes
                    </div>
                    {!isPro && (
                        <div style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
                            color: "#f59e0b", background: "rgba(245,158,11,0.12)",
                            border: "1px solid rgba(245,158,11,0.2)",
                            padding: "2px 7px", borderRadius: 5,
                        }}>✦ PRO ONLY</div>
                    )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {(isPro ? PRO_THEMES : []).map((th) => (
                        <ThemeSwatch
                            key={th.id}
                            theme={th}
                            selected={selected === th.id}
                            locked={false}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
                {!isPro && (
                    <div style={{
                        marginTop: 10, padding: "10px 14px",
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.15)",
                        borderRadius: 11, textAlign: "center",
                    }}>
                        <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>Unlock 8 premium themes</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, marginTop: 3 }}>Upgrade to UFL Pro to access Aurora, Gold, Lava &amp; more</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls Panel
// ─────────────────────────────────────────────────────────────────────────────

function ControlsPanel({
    vis, setVis,
}: {
    vis: Visibility; setVis: React.Dispatch<React.SetStateAction<Visibility>>;
}) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 13, padding: "13px 13px 9px",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 11 }}>
                <Settings2 size={11} color="rgba(255,255,255,0.3)" />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Card sections
                </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SECTION_META.map(({ key, icon, label }) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: 13 }}>{icon}</span>
                            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 500 }}>{label}</span>
                        </div>
                        <Toggle on={vis[key]} onToggle={() => setVis((v) => ({ ...v, [key]: !v[key] }))} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// The Shareable Card
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressCardProps {
    stats: CardStats;
    durKey: DurKey;
    vis: Visibility;
    theme: CardTheme;
    cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function ProgressCard({ stats, durKey, vis, theme: t, cardRef }: ProgressCardProps) {
    const gradId = `sg-${t.id}-${durKey}`;
    const safeData = stats.sparkData?.length >= 2
        ? stats.sparkData
        : [0, 100, 80, 140, 110, 180, stats.xpEarned || 200];

    return (
        <div ref={cardRef} style={{
            width: 360, borderRadius: 22, padding: "0 0 18px",
            position: "relative", overflow: "hidden",
            border: `1px solid ${t.border}`,
            background: t.bg,
            boxShadow: `0 32px 72px -16px ${t.shadow}, 0 0 0 1px ${t.border}`,
            fontFamily: "'Syne','DM Sans',sans-serif",
            flexShrink: 0,
        }}>
            {/* Accent bar */}
            <div style={{ height: 2, background: t.accentBar, opacity: 0.75 }} />

            {/* Orbs */}
            <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle,${t.dimmer} 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", bottom: -50, left: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle,${t.dimmer} 0%,transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, padding: "0 18px" }}>

                {/* Header */}
                {vis.header && (
                    <div style={{ display: "flex", alignItems: "center", gap: 11, paddingTop: 17, paddingBottom: 13, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 13,
                                border: `1.5px solid ${t.border}`, background: t.dim,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 18, fontWeight: 900, color: t.main, overflow: "hidden",
                            }}>
                                {stats.avatarUrl
                                    ? <img src={stats.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : (stats.userName?.charAt(0).toUpperCase() ?? "U")}
                            </div>
                            <div style={{
                                position: "absolute", bottom: -4, right: -4, width: 18, height: 18,
                                borderRadius: 6, background: t.main, border: "2px solid #060910",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
                            }}>🌳</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "#ede9fe", fontSize: 14, fontWeight: 800, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {stats.userName}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
                                {DUR_LABELS[durKey]} · {new Date().getFullYear()}
                            </div>
                        </div>
                        <div style={{
                            padding: "4px 10px", borderRadius: 20, background: t.dim,
                            fontSize: 9, fontWeight: 800, color: t.main,
                            textTransform: "uppercase", letterSpacing: "0.12em",
                            border: `1px solid ${t.border}`, flexShrink: 0,
                        }}>
                            {stats.isPro ? "✦ PRO" : `Lv. ${stats.userLevel}`}
                        </div>
                    </div>
                )}

                {/* Period tabs */}
                {vis.periodTabs && (
                    <div style={{ display: "flex", gap: 3, paddingTop: 10, paddingBottom: 2 }}>
                        {(["1d", "1w", "1m", "1y"] as DurKey[]).map((d) => (
                            <div key={d} style={{
                                flex: 1, padding: "4px 0", borderRadius: 7, textAlign: "center",
                                background: durKey === d ? "rgba(255,255,255,0.09)" : "transparent",
                                border: durKey === d ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                                color: durKey === d ? "#ede9fe" : "rgba(255,255,255,0.22)",
                                fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                            }}>{DUR_TAB[d]}</div>
                        ))}
                    </div>
                )}

                {/* Hero XP */}
                {vis.heroXp && (
                    <div style={{ textAlign: "center", padding: "15px 0 4px" }}>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 5 }}>
                            {DUR_LABELS[durKey]}&apos;s XP Earned
                        </div>
                        <div style={{ color: t.heroColor, fontSize: 52, fontWeight: 900, letterSpacing: -3, lineHeight: 1, textShadow: `0 0 48px ${t.heroColor}44` }}>
                            {(stats.xpEarned || 0).toLocaleString()}
                        </div>
                    </div>
                )}

                {/* Graph */}
                {vis.graph && (
                    <div style={{ marginTop: 13, padding: "10px 12px 6px", background: t.blockBg, borderRadius: 14, border: `1px solid ${t.dim}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>7-Day Activity</span>
                            <span style={{ color: t.main, fontSize: 8, fontWeight: 800 }}>{(stats.userTotalXp || 0).toLocaleString()} XP total</span>
                        </div>
                        <Sparkline data={safeData} t={t} gradId={gradId} />
                    </div>
                )}

                {/* Level / Role block */}
                {vis.levelBlock && (
                    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 13px", background: t.blockBg, borderRadius: 15, border: `1px solid ${t.dim}`, marginTop: 11 }}>
                        <LevelArc pct={stats.xpPct ?? 0} level={stats.userLevel} t={t} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: t.main, fontSize: 17, fontWeight: 900, letterSpacing: "-0.4px", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {stats.roleTitle ?? "Seedling"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                                <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em" }}>Role Lv.</span>
                                <span style={{ color: t.mainAlt, fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{stats.roleLevel ?? 1}</span>
                            </div>
                            <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 4, marginTop: 9, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min((stats.xpPct ?? 0) * 100, 100)}%`, borderRadius: 4, background: `linear-gradient(90deg,${t.main},${t.mainAlt})` }} />
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.22)", fontSize: 8, fontWeight: 600, marginTop: 3 }}>{(stats.userTotalXp || 0).toLocaleString()} XP</div>
                        </div>
                    </div>
                )}

                {/* Streak & Shields */}
                {vis.streakShield && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginTop: 11 }}>
                        <StatCell icon="🔥" value={String(stats.streak ?? 0)} label="Streak" t={t} />
                        <StatCell icon="⚡" value={String(stats.longestStreak ?? 0)} label="Longest" t={t} />
                        <StatCell icon="🛡️" value={String(stats.shields ?? 0)} label="Shields" t={t} />
                    </div>
                )}

                {/* Trees & Todos */}
                {vis.treesTodo && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 7 }}>
                        <StatCell icon="🌳" value={String(stats.treesGrown ?? 0)} label="Trees" t={t} />
                        <StatCell icon="✅" value={String(stats.tasksCompleted ?? 0)} label="Todos Done" t={t} />
                    </div>
                )}

                {/* Top Category */}
                {vis.categories && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: t.blockBg, borderRadius: 11, border: `1px solid ${t.dim}`, marginTop: 7 }}>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Top Habit</span>
                        <span style={{ color: t.main, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stats.mostWorkedCategory || "General"}</span>
                    </div>
                )}

                {/* Footer */}
                {vis.footer && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Member since</div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, marginTop: 1 }}>{stats.memberSince ?? "2024"}</div>
                        </div>
                        <a href={`${BASE_URL}`} target="_blank" rel="noopener noreferrer" style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: t.main, color: "#060910",
                            fontSize: 9, fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase",
                            padding: "7px 13px", borderRadius: 9, textDecoration: "none",
                        }}>
                            JOIN UFL
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 8L8 2M8 2H4M8 2v4" />
                            </svg>
                        </a>
                    </div>
                )}

                {/* Watermark */}
                <div style={{ textAlign: "center", marginTop: 10 }}>
                    <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>habits.hellocoders.in</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Dialog Component
// ─────────────────────────────────────────────────────────────────────────────

type ActiveTab = "theme" | "sections";

export default function UFLProgressCard() {
    const [isOpen, setIsOpen] = useState(false);
    const [durKey, setDurKey] = useState<DurKey>("1d");
    const [stats, setStats] = useState<CardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [vis, setVis] = useState<Visibility>(DEFAULT_VIS);
    const [themeId, setThemeId] = useState<string>("forest");
    const [activeTab, setActiveTab] = useState<ActiveTab>("theme");
    const [showPanel, setShowPanel] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const selectedTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const endpoint = `/api/analytics/card?duration=${durKey}`;
        console.log("[UFLProgressCard] Fetching:", endpoint);
        setLoading(true);
        fetch(endpoint)
            .then(async (res) => {
                console.log("[UFLProgressCard] Response status:", res.status, res.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.url}`);
                const data = await res.json();
                console.log("[UFLProgressCard] Payload:", data);
                setStats(data as CardStats);
                // Auto-pick aurora for pro users on first open
                if (data.isPro && themeId === "forest") setThemeId("aurora");
            })
            .catch((err) => {
                console.error("[UFLProgressCard] Fetch error:", err);
                toast.error("Failed to load card data");
            })
            .finally(() => setLoading(false));
    }, [isOpen, durKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const shareUrl = `${BASE_URL}/${stats?.userName?.toLowerCase() ?? "user"}`;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(shareUrl).catch(() => { });
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    }, [shareUrl]);

    const handleShare = async () => {
        console.log("[UFLProgressCard] Sharing:", shareUrl);
        if (navigator.share) {
            try { await navigator.share({ title: "My UFL Progress", text: "Check out my habit progress!", url: shareUrl }); toast.success("Shared!"); }
            catch (err) { console.error("[UFLProgressCard] Share error:", err); }
        } else {
            handleCopy();
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        toast.loading("Generating image…", { id: "dl" });
        try {
            const url = await toPng(cardRef.current, {
                cacheBust: true, pixelRatio: 3,
                style: { transform: "scale(1)", transformOrigin: "top left" },
            });
            const a = document.createElement("a");
            a.download = `ufl-${stats?.userName?.toLowerCase() ?? "card"}-${themeId}-${durKey}.png`;
            a.href = url; a.click();
            console.log("[UFLProgressCard] PNG downloaded:", a.download);
            toast.success("Downloaded!", { id: "dl" });
        } catch (err) {
            console.error("[UFLProgressCard] toPng error:", err);
            toast.error("Failed to generate image", { id: "dl" });
        } finally {
            setDownloading(false);
        }
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: 1, padding: "7px 0", border: "none", cursor: "pointer",
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.35)",
        fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
        borderRadius: 8, transition: "all .15s",
    });

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold tracking-wide shadow-lg hover:shadow-indigo-500/25 transition-all text-sm">
                    <Share2 size={15} />
                    Share Progress
                </button>
            </DialogTrigger>

            <DialogContent
                className="max-w-[420px] max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-white/10 p-0 rounded-[2rem]"
                style={{ background: "#08080f", fontFamily: "'Syne','DM Sans',sans-serif" }}
            >
                {/* Modal header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
                    <div>
                        <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>Progress Card</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 500, marginTop: 2 }}>Your UFL journey, shareable</div>
                    </div>
                    <button onClick={() => setShowPanel((v) => !v)} style={{
                        width: 32, height: 32, borderRadius: 9, border: "none", cursor: "pointer",
                        background: showPanel ? "rgba(74,222,154,0.18)" : "rgba(255,255,255,0.07)",
                        color: showPanel ? "#4ade9a" : "rgba(255,255,255,0.45)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Palette size={14} />
                    </button>
                </div>

                {/* Duration tabs */}
                <div style={{ display: "flex", gap: 3, padding: "13px 20px 0" }}>
                    {(["1d", "1w", "1m", "1y"] as DurKey[]).map((d) => (
                        <button key={d} onClick={() => { console.log("[UFLProgressCard] Duration →", d); setDurKey(d); }} style={tabStyle(durKey === d)}>
                            {DUR_TAB[d]}
                        </button>
                    ))}
                </div>

                {/* Customise panel */}
                {showPanel && (
                    <div style={{ padding: "12px 20px 0" }}>
                        {/* Tab switcher */}
                        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 12 }}>
                            <button onClick={() => setActiveTab("theme")} style={tabStyle(activeTab === "theme")}>
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                    <Palette size={10} /> Theme
                                </span>
                            </button>
                            <button onClick={() => setActiveTab("sections")} style={tabStyle(activeTab === "sections")}>
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                    <Settings2 size={10} /> Sections
                                </span>
                            </button>
                        </div>

                        {activeTab === "theme" ? (
                            <ThemePicker
                                isPro={stats?.isPro ?? false}
                                selected={themeId}
                                onSelect={(id) => { console.log("[UFLProgressCard] Theme →", id); setThemeId(id); }}
                            />
                        ) : (
                            <ControlsPanel vis={vis} setVis={setVis} />
                        )}
                    </div>
                )}

                {/* Card preview */}
                <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "center" }}>
                    {loading || !stats ? (
                        <div style={{ width: 360, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                    ) : (
                        <ProgressCard stats={stats} durKey={durKey} vis={vis} theme={selectedTheme} cardRef={cardRef} />
                    )}
                </div>

                {/* Share link */}
                <div style={{ padding: "14px 20px 0" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 12, padding: "9px 12px",
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {shareUrl.replace(/^https?:\/\//, "")}
                        </span>
                        <button onClick={handleCopy} style={{
                            padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                            background: copied ? "rgba(74,222,154,0.18)" : "rgba(255,255,255,0.08)",
                            color: copied ? "#4ade9a" : "rgba(255,255,255,0.6)",
                            fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
                            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                        }}>
                            {copied ? "✓ Copied" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 20px 22px" }}>
                    <button onClick={handleDownload} disabled={downloading || !stats} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "12px 0", borderRadius: 13, background: "#fff", color: "#08080f",
                        fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                        border: "none", cursor: "pointer", opacity: (downloading || !stats) ? 0.6 : 1,
                    }}>
                        {downloading ? <Loader2 className="animate-spin" size={13} /> : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        )}
                        Download PNG
                    </button>
                    <button onClick={handleShare} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "12px 0", borderRadius: 13,
                        background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)",
                        fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                        border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}