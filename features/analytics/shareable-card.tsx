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

// Unused previous UI components removed to save space

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

interface ProgressCardProps {
    stats: CardStats;
    durKey: DurKey;
    vis: Visibility;
    theme: CardTheme;
    cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function ProgressCard({ stats, durKey, vis, theme: t, cardRef }: ProgressCardProps) {
    const safeData = stats.sparkData?.length >= 7 
        ? stats.sparkData.slice(0, 7) 
        : [2, 4, 3, 5, 4, 3, Math.max(1, stats.tasksCompleted % 10)];
        
    const maxVal = Math.max(...safeData, 1);
    
    // Bottom progress bar segment percentages
    const total = Math.max(1, stats.tasksCompleted + stats.treesGrown + stats.userLevel);
    const focusPct = Math.min(100, (stats.tasksCompleted / total) * 100).toFixed(0);
    const breakPct = Math.min(100, (stats.userLevel / total) * 100).toFixed(0);
    const otherPct = Math.min(100, (stats.treesGrown / total) * 100).toFixed(0);

    return (
        <div ref={cardRef} style={{
            width: 360, borderRadius: 32, padding: "32px",
            background: "#18181b", // zinc-900 / dark grey almost black like the image
            color: "white",
            fontFamily: "system-ui, -apple-system, sans-serif",
            flexShrink: 0,
            boxShadow: `0 32px 64px -16px rgba(0,0,0,0.5)`,
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>Activity</div>
                <a 
                    href={BASE_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform active:scale-95"
                    style={{ 
                        width: 36, height: 36, borderRadius: "50%", background: "#27272a", // zinc-800
                        display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>

            {/* Top Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, paddingRight: 8 }}>
                <div>
                    <div style={{ color: t.main, fontSize: 26, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, letterSpacing: "-0.5px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="16 12 12 8 8 12"></polyline>
                            <line x1="12" y1="16" x2="12" y2="8"></line>
                        </svg>
                        {stats.streak} <span style={{ fontSize: 16 }}>Days</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>Current Streak</div>
                </div>
                <div>
                    <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.5px" }}>
                        {(stats.userTotalXp || 0).toLocaleString()} <span style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 400 }}>XP</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>Total Earned</div>
                </div>
                <div>
                    <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.5px" }}>
                        {stats.treesGrown} <span style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 400 }}>🌳</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>Trees Grown</div>
                </div>
            </div>

            {/* Bar Chart */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 120, marginBottom: 40 }}>
                {safeData.map((val, i) => {
                    const pct = Math.max(15, (val / maxVal) * 100);
                    // Approximate daily XP using standard UFL ratio where 1 todo is approx 15xp plus base multiplier
                    const dailyXp = val > 0 ? (val * 15) + 12 : 0; 
                    
                    return (
                        <div key={i} className="group relative" style={{ width: 14, height: "100%", background: "#27272a", borderRadius: 12 }}>
                            {/* Hover Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-10 flex flex-col items-center">
                                <div style={{ background: "#27272a", padding: "6px 8px", borderRadius: 8, border: "1px solid #3f3f46", textAlign: "center", minWidth: 70, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}>
                                    <div style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{val} Todos</div>
                                    <div style={{ color: t.main, fontSize: 10, fontWeight: 500 }}>{dailyXp} XP</div>
                                </div>
                            </div>
                            
                            <div style={{ 
                                position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, 
                                background: t.main, borderRadius: 12, transition: "height 0.4s ease-out"
                            }} />
                        </div>
                    );
                })}
            </div>

            {/* Compound Progress Bar */}
            <div style={{ width: "100%", height: 14, background: "#27272a", borderRadius: 12, display: "flex", overflow: "hidden", marginBottom: 32 }}>
                <div style={{ width: `${focusPct}%`, background: t.main, borderRadius: "12px 0 0 12px" }} />
                <div style={{ width: `${breakPct}%`, background: t.mainAlt }} />
                <div style={{ width: `${otherPct}%`, background: t.heroColor, borderRadius: "0 12px 12px 0" }} />
            </div>

            {/* Bottom Stats Overview */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 6 }}>
                        {stats.tasksCompleted} <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 400 }}>Done</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.main }} />
                        Todos · {focusPct}%
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 6 }}>
                        {stats.userLevel} <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 400 }}>LVL</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.mainAlt }} />
                        Rank · {breakPct}%
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px", marginBottom: 6 }}>
                        {stats.shields} <span style={{ fontSize: 13, color: "#a1a1aa", fontWeight: 400 }}>🛡️</span>
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.heroColor }} />
                        Shields · {otherPct}%
                    </div>
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