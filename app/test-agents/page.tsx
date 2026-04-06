"use client";
import { useState, useRef, useEffect } from "react";
import { AgentCard } from "@/components/ui/AgentCard";
import Script from "next/script";

// Add razorpay globally
declare global {
  interface Window {
    Razorpay: any;
  }
}

type DomainKey = "gym" | "income" | "career" | "project" | "accountability" | "orchestrator";

interface DomainConfig {
  icon: string;
  color: string;
  label: string;
  description: string;
}

interface LogEntry {
  msg: string;
  type: "info" | "success" | "error" | "warn" | "start" | "wait";
  time: string;
}

interface AgentResponse {
  success?: boolean;
  domain?: string;
  planId?: string;
  message?: string;
  requiresContext?: boolean;
  [key: string]: unknown;
}

const DOMAINS: Record<DomainKey, DomainConfig> = {
  gym: { icon: "⚡", color: "#00ff88", label: "Gym Agent", description: "Design a personalized workout and diet routine" },
  income: { icon: "💸", color: "#ffd700", label: "Income Agent", description: "Skyrocket your freelance and passive income" },
  career: { icon: "🎯", color: "#00bfff", label: "Career Agent", description: "Climb the ladder and achieve promotions fast" },
  project: { icon: "🛠️", color: "#ff6b35", label: "Project Agent", description: "Architect scalable MVPs and side projects" },
  accountability: { icon: "🔔", color: "#bf5fff", label: "Accountability Agent", description: "Keep your daily habits and goals in check" },
  orchestrator: { icon: "🧠", color: "#ff3366", label: "Orchestrator", description: "Master AI orchestrator for any open-ended goal" },
};

const CONTEXT_MAP: Record<DomainKey, Record<string, unknown>> = {
  gym: { weight: 75, height: 175, experience: "Intermediate" },
  income: { profession: "Graphic Designer", skills: ["Figma", "Illustrator", "Branding"] },
  career: { currentRole: "Frontend Developer", targetRole: "Product Manager", yearsOfExperience: 3 },
  project: { techStack: "Next.js", experience: "Intermediate", hoursPerDay: 4 },
  accountability: {},
  orchestrator: {},
};

export default function AgentTestPage() {
  const [activeAgent, setActiveAgent] = useState<DomainKey>("orchestrator");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsed, setElapsed] = useState<string>("0.0");
  const userId = "699dcea62f527ae04ef24336"; // Dummy logic, your backend has auth

  const [limits, setLimits] = useState<Record<string, any>>({});
  const [isPro, setIsPro] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const res = await fetch("/api/agents/limits");
      if (res.ok) {
        const data = await res.json();
        setIsPro(data.isPro);
        setLimits(data.records || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurchase = async (agentId: string) => {
    try {
      const res = await fetch("/api/checkout/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "UFL",
        description: `Unlock ${DOMAINS[agentId as DomainKey]?.label} Agent`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Immediately optimistic update
          setLimits((prev) => ({
            ...prev,
            [agentId]: { ...prev[agentId], isPurchased: true },
          }));
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: DOMAINS[agentId as DomainKey]?.color || "#ffffff",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Failed to initiate purchase: " + (error as any).message);
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (loading) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  const addLog = (msg: string, type: LogEntry["type"] = "info") => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const runAgent = async () => {
    if (!prompt.trim()) return;

    // Fast fail checkout limit block
    const limitRecord = limits[activeAgent] || { promptsUsed: 0, promptLimit: 5, isPurchased: false };
    if (!isPro && !limitRecord.isPurchased && limitRecord.promptsUsed >= limitRecord.promptLimit) {
      addLog(`❌ Limit Reached! Unlock agent to continue.`, "error");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);
    setLogs([]);
    setElapsed("0.0");

    addLog(`🚀 Firing ${DOMAINS[activeAgent].label}...`, "start");

    // Auto-update limit local state
    if (!isPro && !limitRecord.isPurchased) {
      setLimits(prev => ({
        ...prev,
        [activeAgent]: {
          ...limitRecord,
          promptsUsed: limitRecord.promptsUsed + 1
        }
      }));
    }

    try {
      const body = {
        userId,
        userGoal: prompt,
        goal: prompt,
        feedback: prompt,
        context: CONTEXT_MAP[activeAgent],
        ...CONTEXT_MAP[activeAgent],
      };

      const res = await fetch(`/api/agents/${activeAgent}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: AgentResponse = await res.json();
      if (!res.ok) throw new Error((data as { error?: string, message?: string }).message ?? `HTTP ${res.status}`);

      addLog(`✅ Agent responded in ${elapsed}s`, "success");
      setResponse(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error: ${msg}`, "error");
      setError(msg);
      // Revert limit decrement if errored out securely via limits refresh
      fetchLimits();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <div className="w-4 h-8 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            AI Nexus
          </h1>
          <p className="mt-3 text-slate-400">Select your specialized agent to begin designing your roadmap.</p>
        </header>

        {/* The Premium Agent Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(Object.entries(DOMAINS) as [DomainKey, DomainConfig][]).map(([key, d]) => {
            const limitInfo = limits[key] || { promptsUsed: 0, promptLimit: 5, isPurchased: false };
            return (
              <AgentCard
                key={key}
                id={key}
                isActive={activeAgent === key}
                label={d.label}
                description={d.description}
                icon={d.icon}
                color={d.color}
                isPro={isPro}
                config={49}
                isPurchased={limitInfo.isPurchased}
                promptsUsed={limitInfo.promptsUsed}
                promptLimit={limitInfo.promptLimit}
                onSelect={(id) => setActiveAgent(id as DomainKey)}
                onPurchase={handlePurchase}
              />
            );
          })}
        </div>

        {/* INTERACTION AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2" style={{ color: DOMAINS[activeAgent].color }}>
              <span className="text-xl">{DOMAINS[activeAgent].icon}</span>
              <h2 className="font-bold tracking-wider uppercase text-sm">Active: {DOMAINS[activeAgent].label}</h2>
            </div>

            <textarea
              className="w-full bg-black/50 border border-zinc-800 rounded-xl p-5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 resize-none transition-all"
              rows={4}
              placeholder={`E.g. ${CONTEXT_MAP[activeAgent] ? "Help me using my current context..." : "What is your goal?"}`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ padding: "16px" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) runAgent(); }}
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Press Cmd/Ctrl + Enter to run</span>
              <button
                onClick={runAgent}
                disabled={loading || !prompt.trim()}
                className="px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 text-zinc-950"
                style={{ background: DOMAINS[activeAgent].color, boxShadow: `0 4px 20px ${DOMAINS[activeAgent].color}40` }}
              >
                {loading ? "INITIALIZING..." : "EXECUTE"}
              </button>
            </div>

            {/* Error Area */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm">
                Error: {error}
              </div>
            )}

            {/* Logic area */}
            {response && (
              <div className="p-4 rounded-xl bg-black border border-zinc-800">
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col h-96 lg:h-auto">
            <h3 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Terminal Logs</h3>
            <div className="flex-1 overflow-auto rounded-xl bg-black p-4 font-mono text-xs">
              {logs.length === 0 ? (
                <span className="text-zinc-600">Waiting for commands... _</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((L, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-zinc-600 shrink-0">{L.time}</span>
                      <span className={
                        L.type === 'error' ? 'text-red-400' :
                          L.type === 'success' ? 'text-green-400' :
                            L.type === 'start' ? 'text-indigo-400' :
                              'text-zinc-400'
                      }>{L.msg}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}