"use client";

import { AddTodoModal } from "@/features/todos/add-todo-modal";
import {
    Plus, ClipboardList, Smartphone, Loader2,
    Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { AiGoalAssistant } from "@/features/ai-goals/ai-goal-assistant";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toggleWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TodoItem } from "@/features/todos/todo-item";

// ─── Category → tree config ───────────────────────────────────────────────────

const CATEGORY_TREES: Record<string, {
    label: string;
    leafColor: string[];
    trunkColor: string;
    glowColor: string;
    accentColor: string;   // Tailwind text/bg
    stageName: string[];
}> = {
    fitness: {
        label: "Fitness",
        leafColor: ["#f97316", "#ea580c", "#fb923c"],
        trunkColor: "#92400e",
        glowColor: "#f97316",
        accentColor: "orange",
        stageName: ["Seedling", "Sprout", "Sapling", "Strong", "Mighty", "Peak", "Legend"],
    },
    health: {
        label: "Health",
        leafColor: ["#f43f5e", "#e11d48", "#fb7185"],
        trunkColor: "#881337",
        glowColor: "#f43f5e",
        accentColor: "rose",
        stageName: ["Seedling", "Tender", "Growing", "Healthy", "Vibrant", "Radiant", "Immortal"],
    },
    work: {
        label: "Work",
        leafColor: ["#6366f1", "#4f46e5", "#818cf8"],
        trunkColor: "#312e81",
        glowColor: "#6366f1",
        accentColor: "indigo",
        stageName: ["Seedling", "Intern", "Junior", "Senior", "Lead", "Director", "Legend"],
    },
    finance: {
        label: "Finance",
        leafColor: ["#10b981", "#059669", "#34d399"],
        trunkColor: "#065f46",
        glowColor: "#10b981",
        accentColor: "emerald",
        stageName: ["Seedling", "Saver", "Investor", "Wealthy", "Rich", "Affluent", "Legend"],
    },
    learning: {
        label: "Learning",
        leafColor: ["#f59e0b", "#d97706", "#fbbf24"],
        trunkColor: "#78350f",
        glowColor: "#f59e0b",
        accentColor: "amber",
        stageName: ["Seedling", "Student", "Scholar", "Expert", "Master", "Sage", "Oracle"],
    },
    mindset: {
        label: "Mindset",
        leafColor: ["#a855f7", "#9333ea", "#c084fc"],
        trunkColor: "#581c87",
        glowColor: "#a855f7",
        accentColor: "purple",
        stageName: ["Seedling", "Aware", "Focused", "Centered", "Enlightened", "Transcendent", "Buddha"],
    },
    general: {
        label: "General",
        leafColor: ["#0ea5e9", "#0284c7", "#38bdf8"],
        trunkColor: "#0c4a6e",
        glowColor: "#0ea5e9",
        accentColor: "sky",
        stageName: ["Seedling", "Sprout", "Sapling", "Tree", "Elder", "Ancient", "Cosmos"],
    },
};

function getTreeConfig(category: string) {
    return CATEGORY_TREES[category?.toLowerCase()] ?? CATEGORY_TREES["general"];
}

function drawCategoryTree(
    svgEl: SVGSVGElement,
    stage: number,
    config: typeof CATEGORY_TREES[string],
    animate: boolean
) {
    svgEl.innerHTML = "";
    const NS = "http://www.w3.org/2000/svg";
    const cx = 50, g = 96;
    const [L1, L2, L3] = config.leafColor;
    const T = config.trunkColor;

    function mk(tag: string, attrs: Record<string, string | number>) {
        const e = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
        svgEl.appendChild(e); return e;
    }
    function an(el: Element, attr: string, f: number, t: number, dur: number, del = 0) {
        const a = document.createElementNS(NS, "animate");
        a.setAttribute("attributeName", attr); a.setAttribute("from", String(f)); a.setAttribute("to", String(t));
        a.setAttribute("dur", dur + "s"); a.setAttribute("begin", del + "s"); a.setAttribute("fill", "freeze");
        el.appendChild(a);
    }
    function sw(el: Element, dur: number) {
        const a = document.createElementNS(NS, "animateTransform");
        a.setAttribute("attributeName", "transform"); a.setAttribute("type", "rotate");
        a.setAttribute("values", `0 ${cx} ${g};2 ${cx} ${g};-2 ${cx} ${g};0 ${cx} ${g}`);
        a.setAttribute("dur", dur + "s"); a.setAttribute("repeatCount", "indefinite");
        el.appendChild(a);
    }

    if (stage === 0) {
        mk("ellipse", { cx, cy: g - 6, rx: 5, ry: 7, fill: T });
        mk("line", { x1: cx, y1: g - 12, x2: cx + 2, y2: g - 16, stroke: L2, "stroke-width": 1.5, "stroke-linecap": "round" });
    } else if (stage === 1) {
        const h = 26;
        const tr = mk("rect", { x: cx - 2.5, y: g - h, width: 5, height: h, fill: T, rx: 2.5 });
        if (animate) { an(tr, "height", 0, h, 0.4, 0); an(tr, "y", g, g - h, 0.4, 0); }
        const c1 = mk("circle", { cx: cx - 7, cy: g - h + 2, r: 7, fill: L1 });
        const c2 = mk("circle", { cx: cx + 7, cy: g - h + 2, r: 7, fill: L2 });
        if (animate) { an(c1, "r", 0, 7, 0.3, 0.38); an(c2, "r", 0, 7, 0.3, 0.44); }
        sw(tr, 5);
    } else if (stage === 2) {
        const h = 40;
        const tr = mk("rect", { x: cx - 3, y: g - h, width: 6, height: h, fill: T, rx: 3 });
        [[cx, g - h - 8, 13, L1], [cx - 7, g - h - 2, 9, L2], [cx + 7, g - h - 2, 9, L3]].forEach(([lx, ly, r, f], i) => {
            const c = mk("circle", { cx: lx, cy: ly, r, fill: f as string });
            if (animate) an(c, "r", 0, r as number, 0.3, 0.4 + i * 0.07);
        });
        sw(tr, 5.5);
    } else if (stage === 3) {
        const h = 52;
        mk("path", { d: `M${cx - 3.5},${g}L${cx - 2.5},${g - h}L${cx + 2.5},${g - h}L${cx + 3.5},${g}Z`, fill: T });
        [[cx, g - h - 14, 18, L1], [cx - 10, g - h - 4, 13, L2], [cx + 10, g - h - 5, 12, L3], [cx - 4, g - h - 25, 11, L1]].forEach(([lx, ly, r, f], i) => {
            const c = mk("circle", { cx: lx, cy: ly, r, fill: f as string });
            if (animate) an(c, "r", 0, r as number, 0.3, 0.35 + i * 0.06);
        });
    } else if (stage === 4) {
        const h = 65;
        mk("path", { d: `M${cx - 4},${g}L${cx - 3},${g - h}L${cx + 3},${g - h}L${cx + 4},${g}Z`, fill: T });
        mk("line", { x1: cx, y1: g - h + 16, x2: cx - 18, y2: g - h + 8, stroke: T, "stroke-width": 2.5, "stroke-linecap": "round" });
        mk("line", { x1: cx, y1: g - h + 22, x2: cx + 18, y2: g - h + 14, stroke: T, "stroke-width": 2.5, "stroke-linecap": "round" });
        [[cx, g - h - 18, 22, L1], [cx - 13, g - h - 6, 15, L2], [cx + 13, g - h - 7, 14, L3], [cx - 6, g - h - 32, 15, L1], [cx + 6, g - h - 30, 13, L2], [cx - 18, g - h + 8, 11, L1], [cx + 18, g - h + 8, 10, L2]].forEach(([lx, ly, r, f], i) => {
            const c = mk("circle", { cx: lx, cy: ly, r, fill: f as string });
            if (animate) an(c, "r", 0, r as number, 0.3, 0.3 + i * 0.05);
        });
    } else if (stage === 5) {
        const h = 72;
        mk("path", { d: `M${cx - 5},${g}Q${cx - 4},${g - 35}${cx - 2.5},${g - h}L${cx + 2.5},${g - h}Q${cx + 4},${g - 35}${cx + 5},${g}Z`, fill: T });
        [[cx - 5, cx - 15, g, g + 2], [cx + 5, cx + 15, g, g + 2]].forEach(([x1, x2, y1, y2]) => {
            mk("path", { d: `M${x1},${y1}Q${(x1 as number + (x2 as number)) / 2},${(y1 as number) + 4}${x2},${y2}`, stroke: T, "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" });
        });
        [[cx, g - h - 19, 23, L1], [cx - 16, g - h - 8, 16, L2], [cx + 16, g - h - 9, 15, L3], [cx - 7, g - h - 34, 16, L1], [cx + 7, g - h - 33, 15, L2], [cx, g - h - 46, 13, L3], [cx - 23, g - h + 0, 13, L1], [cx + 23, g - h + 0, 12, L2]].forEach(([lx, ly, r, f], i) => {
            const c = mk("circle", { cx: lx, cy: ly, r, fill: f as string });
            if (animate) an(c, "r", 0, r as number, 0.3, 0.25 + i * 0.045);
        });
    } else {
        // Stage 6 — Legendary with glow rings
        const h = 75;
        mk("path", { d: `M${cx - 5},${g}Q${cx - 4},${g - 36}${cx - 2.5},${g - h}L${cx + 2.5},${g - h}Q${cx + 4},${g - 36}${cx + 5},${g}Z`, fill: T });
        [[cx, g - h - 20, 24], [cx - 16, g - h - 8, 16], [cx + 16, g - h - 9, 15], [cx - 7, g - h - 35, 16], [cx + 7, g - h - 34, 15], [cx, g - h - 47, 13], [cx - 23, g - h + 0, 13], [cx + 23, g - h + 0, 12]].forEach(([lx, ly, r], i) => {
            const cols = [L1, L2, L3];
            mk("circle", { cx: lx, cy: ly, r, fill: cols[i % 3] });
        });
        // Glow rings
        for (let i = 0; i < 2; i++) {
            const ring = mk("circle", { cx, cy: g - h - 20, r: 26 + i * 10, fill: "none", stroke: config.glowColor, "stroke-width": 0.8, opacity: 0.22 - i * 0.07 });
            const ar = document.createElementNS(NS, "animate");
            ar.setAttribute("attributeName", "opacity"); ar.setAttribute("values", ".22;.04;.22");
            ar.setAttribute("dur", (2 + i * 0.6) + "s"); ar.setAttribute("begin", (i * 0.4) + "s"); ar.setAttribute("repeatCount", "indefinite");
            ring.appendChild(ar);
        }
        // Sparkles
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            const r2 = 22 + Math.random() * 8;
            const sp = mk("circle", { cx: cx + Math.cos(a) * r2, cy: g - h - 20 + Math.sin(a) * r2, r: 1.5, fill: config.glowColor });
            const as2 = document.createElementNS(NS, "animate");
            as2.setAttribute("attributeName", "opacity"); as2.setAttribute("values", "0;1;0");
            as2.setAttribute("dur", (1.2 + i * 0.2) + "s"); as2.setAttribute("begin", (i * 0.22) + "s"); as2.setAttribute("repeatCount", "indefinite");
            sp.appendChild(as2);
        }
    }
}

// ─── Forest Tree Card ─────────────────────────────────────────────────────────

const STAGES = [0, 40, 100, 180, 290, 420, 570];
function getStage(xp: number): number {
    let s = 0;
    for (let i = STAGES.length - 1; i >= 0; i--) { if (xp >= STAGES[i]) { s = i; break; } }
    return s;
}

interface TreeCardProps {
    category: string;
    completedCount: number;
    totalCount: number;
}


function TreeMini({
    category,
    counts,
    xp,
    stage,
    config,
    activeTree,
    setActiveTree,
}: any) {
    const svgRef = useRef<SVGSVGElement>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (svgRef.current) {
            drawCategoryTree(svgRef.current, stage, config, false);
        }
    }, [stage, config]);

    const handleOpen = () => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        setActiveTree({
            category,
            counts,
            xp,
            stage,
            config,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    return (
        <div
            ref={ref}
            onMouseEnter={handleOpen}
            onMouseLeave={() => setActiveTree(null)}
            onClick={handleOpen}
            className="relative flex flex-col items-center cursor-pointer group h-30"
        >
            {/* Glow */}
            <div
                className={cn(
                    "absolute w-20 h-20 rounded-full blur-xl opacity-0 transition ",
                    activeTree?.category === category && "opacity-40"
                )}
                style={{ background: config.glowColor }}
            />

            {/* Tree */}
            <svg
                ref={svgRef}
                width="90"
                height="90"
                viewBox="0 0 100 100"
                className={cn(
                    "transition-all duration-300",
                    activeTree?.category === category
                        ? "scale-125"
                        : "group-hover:scale-110"
                )}
            />

            {/* tiny label */}
            <p className="text-[9px] mt-1 text-zinc-400 uppercase tracking-wide">
                {config.label}
            </p>
        </div>
    );
}

function TreeTooltip({ data }: any) {
    const { category, counts, xp, stage, config, x, y } = data;

    const stageName = config.stageName[stage];

    return (
        <div
            className="fixed z-50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md
                       bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800
                       animate-in fade-in zoom-in-95"
            style={{
                left: x,
                top: y - 10,
                transform: "translate(-50%, -100%)",
            }}
        >
            <p
                className="text-sm font-extrabold uppercase tracking-wide text-center"
                style={{ color: config.glowColor }}
            >
                {config.label}
            </p>

            <p className="text-xs text-zinc-500 text-center font-semibold">
                {stageName}
            </p>

            <div className="mt-2 text-center">
                <p className="text-lg font-black" style={{ color: config.glowColor }}>
                    {xp} XP
                </p>
                <p className="text-[11px] text-zinc-400">
                    {counts.completed}/{counts.total} tasks
                </p>
            </div>
        </div>
    );
}
// ─── Forest View ──────────────────────────────────────────────────────────────

interface ForestProps {
    tasks: any[];
}

function ForestView({ tasks }: { tasks: any[] }) {
    const [activeTree, setActiveTree] = useState<any>(null);

    const categories = useMemo(() => {
        const map: Record<string, {
            total: number;
            completed: number;
            xp: number;
        }> = {};

        tasks.forEach((t) => {
            const cat = (t.category || "general").toLowerCase();

            if (!map[cat]) {
                map[cat] = { total: 0, completed: 0, xp: 0 };
            }

            map[cat].total++;

            if (t.completed) {
                map[cat].completed++;
            }
            map[cat].xp += t.earnedXp || 0;
        });
        return Object.entries(map);
    }, [tasks]);

    if (!categories.length) return null;

    return (
        <div className="mb-12 relative ">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6 px-1">
                <p className="text-[10px] font-extrabold tracking-[.2em] uppercase text-zinc-400">
                    Your Forest
                </p>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-xs text-zinc-400">{categories.length}</span>
            </div>

            <Card>
                <div className="relative flex flex-wrap  justify-center py-6">

                    {categories.map(([cat, counts]) => {
                        const config = getTreeConfig(cat);
                        const xp = counts.xp;
                        const stage = getStage(xp);

                        return (
                            <TreeMini
                                key={cat}
                                category={cat}
                                counts={counts}
                                xp={xp}
                                stage={stage}
                                config={config}
                                activeTree={activeTree}
                                setActiveTree={setActiveTree}
                            />
                        );
                    })}
                </div>

            </Card>
            {/* Tooltip */}
            {activeTree && (
                <TreeTooltip data={activeTree} />
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TodosPage() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [visibleCounts, setVisibleCounts] = useState({ today: 10, timeUp: 10, completed: 10 });
    const [stats, setStats] = useState<any>({
        total: 0,
        completed: 0,
        today: 0,
        timeUps: 0,
    });
    const [pagination, setPagination] = useState<any>({
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [grouped, setGrouped] = useState<any>({
        today: [],
        timeUp: [],
        completed: [],
    });

    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            setIsWhatsappEnabled(session.user.whatsappEnabled || false);
        }
    }, [session]);

    const handleToggleComplete = useCallback((id: string, completed: boolean) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t));
    }, []);

    const handleToggleWhatsapp = async () => {
        setToggleLoading(true);
        try {
            const next = !isWhatsappEnabled;
            await toggleWhatsapp(next);
            setIsWhatsappEnabled(next);
            toast.success(next ? "WhatsApp reminders enabled!" : "WhatsApp reminders disabled.");
        } catch { toast.error("Failed to update WhatsApp settings."); }
        finally { setToggleLoading(false); }
    };

    const fetchTasks = async (page = 1) => {
        try {
            const res = await fetch(`/api/todos?page=${page}&limit=10`);

            if (res.ok) {
                const result = await res.json();

                setTasks(result.data);
                setStats(result.stats);
                setPagination(result.pagination);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    const fetchGroupedTasks = async () => {
        try {
            const res = await fetch(`/api/todos/dashboard`);

            if (res.ok) {
                const result = await res.json();
                setGrouped(result.grouped);
                setStats(result.stats);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchGroupedTasks();
    }, []);


    const handleLoadMore = (cat: "today" | "timeUp" | "completed") =>
        setVisibleCounts((p) => ({ ...p, [cat]: p[cat] + 10 }));

    function renderSection(
        title: string,
        icon: React.ReactNode,
        list: any[],
        cat: "today" | "timeUp" | "completed"
    ) {
        if (!list.length) return null;
        const visible = list.slice(0, visibleCounts[cat]);
        const hasMore = list.length > visibleCounts[cat];
        const accentMap = { today: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10", timeUp: "text-red-500 bg-red-50 dark:bg-red-500/10", completed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" };
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className={cn("p-2 rounded-xl", accentMap[cat])}>
                        {icon}
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-zinc-800 dark:text-zinc-100">
                        {title}
                    </h2>
                    <span className="text-xs font-extrabold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {list.length}
                    </span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="flex flex-col gap-3">
                    {visible.map((task) => (
                        <TodoItem
                            key={task.id}
                            id={task.id}
                            task={task.task}
                            startTime={task.startTime}
                            reminderTime={task.reminderTime ? new Date(task.reminderTime) : new Date()}
                            category={task.category || "General"}
                            status={task.status}
                            completed={task.completed}
                            onToggleComplete={handleToggleComplete}
                        />
                    ))}
                </div>
                {hasMore && (
                    <button
                        onClick={() => handleLoadMore(cat)}
                        className="mt-4 w-full py-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs font-extrabold tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all active:scale-[0.99]"
                    >
                        Load More
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <style>{`
        @keyframes header-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .page-header { animation: header-in .45s ease forwards; }
      `}</style>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="page-header flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pt-10">
                    <div>
                        <p className="text-[9px] font-extrabold tracking-[.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                            Daily Focus
                        </p>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none mb-1">
                            Build habits.<br />
                            <span className="text-indigo-600 dark:text-indigo-400">Watch them grow.</span>
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-2">
                            Synchronize your reality with your intentions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleToggleWhatsapp}
                            disabled={toggleLoading}
                            className={cn(
                                "h-11 w-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm",
                                isWhatsappEnabled
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            {toggleLoading ? <Loader2 size={20} className="animate-spin" /> : <Smartphone size={20} />}
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-11 px-5 rounded-2xl bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm font-extrabold tracking-wide"
                        >
                            <Plus size={18} />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* ── Forest ──────────────────────────────────────────────── */}
                {!loading && tasks.length > 0 && <ForestView tasks={tasks} />}

                {/* ── Todo sections ───────────────────────────────────────── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                        </div>
                        <p className="text-xs font-extrabold tracking-[.2em] uppercase text-zinc-400 animate-pulse">
                            Syncing consciousness...
                        </p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div>
                        {renderSection("Time Up", <AlertCircle size={18} />, grouped.timeUp, "timeUp")}
                        {renderSection("Today's Missions", <Clock size={18} />, grouped.today, "today")}
                        {renderSection("Completed", <CheckCircle2 size={18} />, grouped.completed, "completed")}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-8 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                        <div className="w-20 h-20 rounded-[1.8rem] bg-white dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                            <ClipboardList className="text-indigo-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                            Empty Workspace
                        </h3>
                        <p className="text-zinc-400 text-center max-w-xs mb-8 text-sm font-medium leading-relaxed">
                            The future is unwritten. Define your next victory and start the countdown.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-extrabold tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.97] text-sm"
                        >
                            Create First Task
                        </button>
                    </div>
                )}

                {/* Modals */}
                <AddTodoModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); fetchTasks(); }}
                />
                <AiGoalAssistant
                    isOpen={isAiModalOpen}
                    onClose={() => { setIsAiModalOpen(false); fetchTasks(); }}
                />
            </div>
        </>
    );
}