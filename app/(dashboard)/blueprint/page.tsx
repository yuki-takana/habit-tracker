"use client"

import { Card, CardContent } from "@/components/ui/card";
import { AgentCard } from "@/components/ui/AgentCard";
import { ActiveBlueprintCard } from "@/components/ui/ActiveBlueprintCard";
import {
    ArrowRight,
    Bot,
    BriefcaseBusiness,
    Code,
    Dumbbell,
    Sparkles,
    TrendingUp,
    Wallet,
    PlusCircle,
    CalendarDays,
    Users,
    Heart,
    Brain,
    GraduationCap,
    Zap,
    Scale,
    LifeBuoy,
    Lock,
} from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { activePaymentGateways } from "@/lib/payments/client";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const agents = [
    {
        title: "Project Architect",
        agentId: "project",
        description: "Turn your app idea into a technical roadmap. Get daily coding tasks to build your MVP flawlessly.",
        icon: <Code className="w-8 h-8" />,
        href: "/blueprint/project/new",
        color: "#8b5cf6",
        badge: "New",
    },
    {
        title: "Career Mentor",
        agentId: "career",
        description: "Navigate your career transition from your current role to your dream job with step-by-step milestones.",
        icon: <BriefcaseBusiness className="w-8 h-8" />,
        href: "/blueprint/career/new",
        color: "#f59e0b",
        badge: "New",
    },
    {
        title: "Business Architect",
        agentId: "business",
        description: "Turn your startup idea into a validated business model with a 30-day execution roadmap.",
        icon: <BriefcaseBusiness className="w-8 h-8" />,
        href: "/blueprint/business/new",
        color: "#475569",
        badge: "New",
    },
    {
        title: "Senior Gym Trainer",
        agentId: "gym",
        description: "Expert 7-day programming based on your physiology and experience. Build your ultimate physique.",
        icon: <Dumbbell className="w-8 h-8" />,
        href: "/blueprint/gym/new",
        color: "#06b6d4",
        badge: "Active",
    },
    {
        title: "Financial Strategist",
        agentId: "income",
        description: "Generate a bulletproof 30-day plan to hit your income targets through freelance, business, or career growth.",
        icon: <Wallet className="w-8 h-8" />,
        href: "/blueprint/income/new",
        color: "#10b981",
        badge: "New",
    },
    {
        title: "Networking Strategist",
        agentId: "networking",
        description: "Build a high-value professional network. Get a weekly outreach plan to connect with the right people.",
        icon: <Users className="w-8 h-8" />,
        href: "/blueprint/networking/new",
        color: "#2563eb",
        badge: "New",
    },
    {
        title: "Health Coach",
        agentId: "health",
        description: "Optimize your nutrition, sleep, and stress management with a personalized wellness protocol.",
        icon: <Heart className="w-8 h-8" />,
        href: "/blueprint/health/new",
        color: "#f43f5e",
        badge: "New",
    },
    {
        title: "Learning Mentor",
        agentId: "learning",
        description: "Master any new skill with a structured curriculum, curated resources, and weekly checkpoints.",
        icon: <GraduationCap className="w-8 h-8" />,
        href: "/blueprint/learning/new",
        color: "#ea580c",
        badge: "New",
    },
    {
        title: "Mindset Coach",
        agentId: "mindset",
        description: "Rebuild your psychology. Overcome limiting beliefs and build unstoppable mental resilience.",
        icon: <Brain className="w-8 h-8" />,
        href: "/blueprint/mindset/new",
        color: "#db2777",
        badge: "New",
    },
    {
        title: "Productivity Expert",
        agentId: "productivity",
        description: "Design your ultimate daily routine and task system to achieve 10x more in less time.",
        icon: <Zap className="w-8 h-8" />,
        href: "/blueprint/productivity/new",
        color: "#d97706",
        badge: "New",
    },
    {
        title: "Life Architect",
        agentId: "life",
        description: "A holistic 360-degree plan covering all domains of your life for total transformation.",
        icon: <LifeBuoy className="w-8 h-8" />,
        href: "/blueprint/life/new",
        color: "#4f46e5",
        badge: "New",
    },
    {
        title: "Relationship Specialist",
        agentId: "relationships",
        description: "Improve your social life, communication, and emotional intelligence with actionable exercises.",
        icon: <Scale className="w-8 h-8" />,
        href: "/blueprint/relationships/new",
        color: "#0d9488",
        badge: "New",
    },
];

const blueprintTypeConfig: Record<string, { icon: any; color: string; badgeColor: string; label: string }> = {
    Income: { icon: Wallet, color: "text-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Financial" },
    Project: { icon: Code, color: "text-violet-500", badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Project" },
    Career: { icon: BriefcaseBusiness, color: "text-amber-500", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Career" },
    Gym: { icon: Dumbbell, color: "text-cyan-500", badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", label: "Fitness" },
    Networking: { icon: Users, color: "text-blue-600", badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Networking" },
    Business: { icon: BriefcaseBusiness, color: "text-blue-800", badgeColor: "bg-blue-500/10 text-blue-800 border-blue-500/20", label: "Business" },
    Health: { icon: Heart, color: "text-rose-500", badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20", label: "Health" },
    Learning: { icon: GraduationCap, color: "text-orange-600", badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20", label: "Learning" },
    Mindset: { icon: Brain, color: "text-pink-600", badgeColor: "bg-pink-500/10 text-pink-600 border-pink-500/20", label: "Mindset" },
    Productivity: { icon: Zap, color: "text-amber-600", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Efficiency" },
    Life: { icon: LifeBuoy, color: "text-indigo-600", badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", label: "Holistic" },
    Relationships: { icon: Scale, color: "text-teal-600", badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20", label: "Social" },
};

export default function BlueprintHubPage() {
    const router = useRouter()
    const [activeBlueprints, setActiveBlueprints] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [limits, setLimits] = useState<any>(null)
    const [agentLimits, setAgentLimits] = useState<any>({})
    const [isPro, setIsPro] = useState(false)
    const [checkoutType, setCheckoutType] = useState<'stripe' | 'razorpay'>('razorpay');
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ config, setConfig ] = useState<any>(null)

    useEffect(() => {
        // Simple logic to detect Gateway based on user env var, defaulting to Razorpay.
        // We let the user dynamically choose between Stripe and Razorpay using constants
        // but for now we'll prefer Stripe if explicitly set, else Razorpay.
        let gateway;
        const fetchGateway = async () => {
            gateway = await activePaymentGateways();
            setCheckoutType(gateway[0] as any);
            setConfig(gateway[1] || null);
        };
        fetchGateway();

        const fetch_ = async () => {
            try {
                const [bpRes, limRes, agentLimitRes] = await Promise.all([
                    fetch('/api/dashboard/active-blueprints'),
                    fetch('/api/subscription/limits'),
                    fetch('/api/agents/limits')
                ])
                const bpData = await bpRes.json()
                const limData = await limRes.json()
                const agentLimitsData = await agentLimitRes.json()

                if (bpData.success) setActiveBlueprints(bpData.blueprints)
                if (limRes.ok) setLimits(limData)
                if (agentLimitRes.ok) {
                    setAgentLimits(agentLimitsData.records || {})
                    setIsPro(agentLimitsData.isPro || false)
                }
            } catch (err) {
                console.error("Failed to fetch data:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetch_()
    }, [config])

    const handleUnlock = async (agentId: string) => {
        try {
            const endpoint = checkoutType === 'stripe' ? '/api/checkout/stripe-agent' : '/api/checkout/agent';
            const agentDetails = agents.find(a => a.agentId === agentId);

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agentId: agentId,
                    agentName: agentDetails?.title
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Checkout failed");

            if (checkoutType === 'stripe') {
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                // Razorpay Flow
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                    amount: data.amount,
                    currency: data.currency || "INR",
                    name: "UFL",
                    description: `Unlock ${agentDetails?.title} Agent`,
                    order_id: data.orderId || data.order_id,
                    handler: async function (response: any) {
                        try {
                            if (response.razorpay_payment_id) {
                                // Assume optimistic update or call verify endpoint
                                setAgentLimits((prev: any) => ({
                                    ...prev,
                                    [agentId]: { ...prev[agentId], isPurchased: true },
                                }));
                                setIsModalOpen(false);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    },
                    prefill: {
                        name: "User",
                        email: "user@example.com",
                    },
                    theme: {
                        color: agentDetails?.color || "#4f46e5",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }

        } catch (err) {
            console.error(err);
            alert("Failed to initiate agent purchase.");
        }
    };

    return (
        <div className="space-y-12 pb-16">

            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                    <Bot className="w-12 h-12 text-primary animate-pulse" />
                    The AI Blueprint Hub
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Delegate your goals to specialized AI agents. Select a coach below to architect a highly-personalized, step-by-step master plan.
                </p>
            </div>

            {/* Grid of Agents Using AgentCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents.map((agent) => {
                    // isFreeAgent denotes agents that don't need Pro unlocks historically. 
                    // However, we now have prompts limits for all agents via AgentCard natively.
                    const isFreeAgent = ['career', 'project', 'business'].includes(agent.agentId);
                    const defaultLimit = isFreeAgent ? 1 : 0;
                    const record = agentLimits[agent.agentId] || { promptsUsed: 0, promptLimit: defaultLimit, isPurchased: false };

                    return (
                        <div key={agent.agentId} className="h-full">
                            <AgentCard
                                id={agent.agentId}
                                label={agent.title}
                                icon={agent.icon}
                                color={agent.color}
                                description={agent.description}
                                isActive={false}
                                isPro={isPro}
                                config={config}
                                isPurchased={record.isPurchased}
                                promptsUsed={record.promptsUsed}
                                promptLimit={record.promptLimit}
                                onSelect={() => {
                                    if (!isPro && !record.isPurchased && record.promptsUsed >= record.promptLimit) {
                                        setSelectedAgent(agent);
                                        setIsModalOpen(true);
                                    } else {
                                        router.push(agent.href);
                                    }
                                }}
                                onPurchase={() => {
                                    setSelectedAgent(agent);
                                    setIsModalOpen(true);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Modal for Locked Agents */}
            {isModalOpen && selectedAgent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-2xl border" style={{ color: selectedAgent.color, borderColor: `${selectedAgent.color}33`, backgroundColor: `${selectedAgent.color}15` }}>
                                {selectedAgent.icon}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-foreground tracking-tight">
                            Unlock {selectedAgent.title}
                        </h2>

                        <p className="text-sm text-muted-foreground mb-6">
                            Get infinite access to this premium AI agent and supercharge your workflow.
                        </p>

                        <div className="text-4xl font-black text-primary mb-6">
                            ₹{config || 0} <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">/ lifetime</span>
                        </div>

                        <button
                            onClick={() => handleUnlock(selectedAgent.agentId)}
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition shadow-md"
                        >
                            Unlock Now
                        </button>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Active Blueprints Section */}
            <div className="pt-12 border-t border-border/50">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    Your Active Blueprints
                </h3>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <UflLoaderInline style="flip" />
                    </div>
                ) : activeBlueprints.length === 0 ? (
                    <div className="text-center p-12 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                        <p className="text-muted-foreground">You don't have any active blueprints yet. Generate one above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeBlueprints.map((bp, i) => {
                            const config = blueprintTypeConfig[bp.type] || blueprintTypeConfig["Gym"];
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={bp.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Link href={bp.link}>
                                        <ActiveBlueprintCard
                                            title={bp.title}
                                            badgeLabel={bp.type}
                                            icon={<Icon className="w-5 h-5" />}
                                            badgeColor={config.badgeColor}
                                        />
                                    </Link>
                                </motion.div>
                            )
                        })}

                        {/* Add new blueprint button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: activeBlueprints.length * 0.08 }}
                        >
                            <Link href="#agents">
                                <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-dashed border-border h-full bg-card">
                                    <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px] gap-3 text-muted-foreground">
                                        <PlusCircle className="w-6 h-6 group-hover:text-primary transition-colors" />
                                        <p className="text-xs font-medium text-center group-hover:text-primary transition-colors">New Blueprint</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
