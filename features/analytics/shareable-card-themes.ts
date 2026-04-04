export type DurKey = "1d" | "1w" | "1m" | "1y";

export interface CardStats {
    isPro: boolean;
    xpEarned: number;
    userTotalXp: number;
    userName: string;
    userLevel: number;     // numeric XP level (1–99)
    roleLevel: number;     // game role level
    roleTitle: string;     // game role title string
    streak: number;
    longestStreak: number;
    shields: number;
    xpPct: number;         // 0–1, progress to next numeric level
    sparkData: number[];   // 7 data points
    tasksCompleted: number;
    treesGrown: number;
    mostWorkedCategory: string;
    memberSince: string;
    avatarUrl?: string;
}

export interface Visibility {
    header: boolean;
    periodTabs: boolean;
    graph: boolean;
    levelBlock: boolean;
    heroXp: boolean;
    streakShield: boolean;
    treesTodo: boolean;
    categories: boolean;
    footer: boolean;
}

export interface CardTheme {
    id: string;
    name: string;
    tier: "free" | "pro";
    swatch: string;
    bg: string;
    accentBar: string;
    main: string;
    mainAlt: string;
    dim: string;
    dimmer: string;
    border: string;
    shadow: string;
    heroColor: string;
    statBg: string;
    blockBg: string;
}

export const THEMES: CardTheme[] = [
    // ── FREE ──────────────────────────────────────────────────────────────────
    {
        id: "forest",
        name: "Forest",
        tier: "free",
        swatch: "linear-gradient(135deg,#0a1a10,#4ade9a)",
        bg: "linear-gradient(150deg,#060d09 0%,#0b1811 55%,#060a07 100%)",
        accentBar: "linear-gradient(90deg,transparent,#4ade9a,#4ade9a,transparent)",
        main: "#4ade9a", mainAlt: "#22c55e",
        dim: "rgba(74,222,154,0.18)", dimmer: "rgba(74,222,154,0.06)",
        border: "rgba(74,222,154,0.22)", shadow: "rgba(74,222,154,0.14)",
        heroColor: "#4ade9a", statBg: "rgba(74,222,154,0.06)", blockBg: "rgba(74,222,154,0.05)",
    },
    {
        id: "ocean",
        name: "Ocean",
        tier: "free",
        swatch: "linear-gradient(135deg,#06101a,#38bdf8)",
        bg: "linear-gradient(150deg,#060d14 0%,#0a1828 55%,#060810 100%)",
        accentBar: "linear-gradient(90deg,transparent,#38bdf8,#38bdf8,transparent)",
        main: "#38bdf8", mainAlt: "#0ea5e9",
        dim: "rgba(56,189,248,0.18)", dimmer: "rgba(56,189,248,0.06)",
        border: "rgba(56,189,248,0.22)", shadow: "rgba(56,189,248,0.14)",
        heroColor: "#38bdf8", statBg: "rgba(56,189,248,0.06)", blockBg: "rgba(56,189,248,0.05)",
    },
    {
        id: "dusk",
        name: "Dusk",
        tier: "free",
        swatch: "linear-gradient(135deg,#110a18,#a78bfa)",
        bg: "linear-gradient(150deg,#0c0814 0%,#130f24 55%,#0c0810 100%)",
        accentBar: "linear-gradient(90deg,transparent,#a78bfa,#a78bfa,transparent)",
        main: "#a78bfa", mainAlt: "#818cf8",
        dim: "rgba(167,139,250,0.18)", dimmer: "rgba(167,139,250,0.06)",
        border: "rgba(167,139,250,0.22)", shadow: "rgba(167,139,250,0.14)",
        heroColor: "#a78bfa", statBg: "rgba(167,139,250,0.06)", blockBg: "rgba(167,139,250,0.05)",
    },
    {
        id: "ember",
        name: "Ember",
        tier: "free",
        swatch: "linear-gradient(135deg,#140a06,#fb923c)",
        bg: "linear-gradient(150deg,#110806 0%,#1e0f07 55%,#0f0705 100%)",
        accentBar: "linear-gradient(90deg,transparent,#fb923c,#f97316,transparent)",
        main: "#fb923c", mainAlt: "#f97316",
        dim: "rgba(251,146,60,0.18)", dimmer: "rgba(251,146,60,0.06)",
        border: "rgba(251,146,60,0.22)", shadow: "rgba(251,146,60,0.14)",
        heroColor: "#fb923c", statBg: "rgba(251,146,60,0.06)", blockBg: "rgba(251,146,60,0.05)",
    },

    // ── PRO ───────────────────────────────────────────────────────────────────
    {
        id: "aurora",
        name: "Aurora",
        tier: "pro",
        swatch: "linear-gradient(135deg,#050e18,#22d3ee,#a78bfa)",
        bg: "linear-gradient(150deg,#040c12 0%,#081422 40%,#0c0818 100%)",
        accentBar: "linear-gradient(90deg,transparent,#22d3ee,#a78bfa,transparent)",
        main: "#22d3ee", mainAlt: "#a78bfa",
        dim: "rgba(34,211,238,0.18)", dimmer: "rgba(34,211,238,0.05)",
        border: "rgba(34,211,238,0.2)", shadow: "rgba(34,211,238,0.18)",
        heroColor: "#22d3ee", statBg: "rgba(34,211,238,0.06)", blockBg: "rgba(34,211,238,0.04)",
    },
    {
        id: "rosegold",
        name: "Rose Gold",
        tier: "pro",
        swatch: "linear-gradient(135deg,#120a0d,#fb7185,#fbbf24)",
        bg: "linear-gradient(150deg,#100810 0%,#1a0c14 40%,#100808 100%)",
        accentBar: "linear-gradient(90deg,transparent,#fb7185,#fbbf24,transparent)",
        main: "#fb7185", mainAlt: "#fbbf24",
        dim: "rgba(251,113,133,0.18)", dimmer: "rgba(251,113,133,0.06)",
        border: "rgba(251,113,133,0.22)", shadow: "rgba(251,113,133,0.2)",
        heroColor: "#fbbf24", statBg: "rgba(251,113,133,0.06)", blockBg: "rgba(251,113,133,0.04)",
    },
    {
        id: "obsidian",
        name: "Obsidian",
        tier: "pro",
        swatch: "linear-gradient(135deg,#090909,#475569,#94a3b8)",
        bg: "linear-gradient(150deg,#070708 0%,#0f1014 50%,#080809 100%)",
        accentBar: "linear-gradient(90deg,transparent,#64748b,#94a3b8,transparent)",
        main: "#94a3b8", mainAlt: "#64748b",
        dim: "rgba(148,163,184,0.15)", dimmer: "rgba(148,163,184,0.05)",
        border: "rgba(148,163,184,0.18)", shadow: "rgba(148,163,184,0.12)",
        heroColor: "#e2e8f0", statBg: "rgba(148,163,184,0.06)", blockBg: "rgba(148,163,184,0.04)",
    },
    {
        id: "neon",
        name: "Neon",
        tier: "pro",
        swatch: "linear-gradient(135deg,#020a06,#00ff87,#60efff)",
        bg: "linear-gradient(150deg,#020806 0%,#041210 50%,#020608 100%)",
        accentBar: "linear-gradient(90deg,transparent,#00ff87,#60efff,transparent)",
        main: "#00ff87", mainAlt: "#60efff",
        dim: "rgba(0,255,135,0.15)", dimmer: "rgba(0,255,135,0.05)",
        border: "rgba(0,255,135,0.2)", shadow: "rgba(0,255,135,0.22)",
        heroColor: "#00ff87", statBg: "rgba(0,255,135,0.05)", blockBg: "rgba(0,255,135,0.04)",
    },
    {
        id: "midnight",
        name: "Midnight",
        tier: "pro",
        swatch: "linear-gradient(135deg,#05050f,#1e40af,#7c3aed)",
        bg: "linear-gradient(150deg,#04050e 0%,#080c20 45%,#0c0618 100%)",
        accentBar: "linear-gradient(90deg,transparent,#3b82f6,#7c3aed,transparent)",
        main: "#3b82f6", mainAlt: "#7c3aed",
        dim: "rgba(59,130,246,0.18)", dimmer: "rgba(59,130,246,0.06)",
        border: "rgba(59,130,246,0.22)", shadow: "rgba(59,130,246,0.2)",
        heroColor: "#60a5fa", statBg: "rgba(59,130,246,0.06)", blockBg: "rgba(59,130,246,0.04)",
    },
    {
        id: "gold",
        name: "Gold",
        tier: "pro",
        swatch: "linear-gradient(135deg,#0e0a02,#f59e0b,#fde68a)",
        bg: "linear-gradient(150deg,#0c0902 0%,#1a1204 50%,#0c0a02 100%)",
        accentBar: "linear-gradient(90deg,transparent,#f59e0b,#fde68a,transparent)",
        main: "#f59e0b", mainAlt: "#fde68a",
        dim: "rgba(245,158,11,0.18)", dimmer: "rgba(245,158,11,0.06)",
        border: "rgba(245,158,11,0.22)", shadow: "rgba(245,158,11,0.22)",
        heroColor: "#fde68a", statBg: "rgba(245,158,11,0.06)", blockBg: "rgba(245,158,11,0.04)",
    },
    {
        id: "sakura",
        name: "Sakura",
        tier: "pro",
        swatch: "linear-gradient(135deg,#100610,#f0abfc,#fb7185)",
        bg: "linear-gradient(150deg,#0e060e 0%,#1a0c1a 45%,#100810 100%)",
        accentBar: "linear-gradient(90deg,transparent,#f0abfc,#fb7185,transparent)",
        main: "#f0abfc", mainAlt: "#fb7185",
        dim: "rgba(240,171,252,0.18)", dimmer: "rgba(240,171,252,0.06)",
        border: "rgba(240,171,252,0.22)", shadow: "rgba(240,171,252,0.18)",
        heroColor: "#f0abfc", statBg: "rgba(240,171,252,0.06)", blockBg: "rgba(240,171,252,0.04)",
    },
    {
        id: "lava",
        name: "Lava",
        tier: "pro",
        swatch: "linear-gradient(135deg,#100404,#ef4444,#f97316)",
        bg: "linear-gradient(150deg,#0f0404 0%,#1e0808 45%,#100504 100%)",
        accentBar: "linear-gradient(90deg,transparent,#ef4444,#f97316,transparent)",
        main: "#ef4444", mainAlt: "#f97316",
        dim: "rgba(239,68,68,0.18)", dimmer: "rgba(239,68,68,0.06)",
        border: "rgba(239,68,68,0.22)", shadow: "rgba(239,68,68,0.22)",
        heroColor: "#fca5a5", statBg: "rgba(239,68,68,0.06)", blockBg: "rgba(239,68,68,0.04)",
    },
];
