"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const agents = [
    {
        title: "Senior Gym Trainer",
        description: "Expert 7-day programming based on your physiology and experience. Build your ultimate physique.",
        icon: Dumbbell,
        href: "/blueprint/gym/new",
        color: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-cyan-500",
        badge: "Active",
    },
    {
        title: "Financial Strategist",
        description: "Generate a bulletproof 30-day plan to hit your income targets through freelance, business, or career growth.",
        icon: Wallet,
        href: "/blueprint/income/new",
        color: "from-emerald-500/20 to-green-500/20",
        iconColor: "text-emerald-500",
        badge: "New",
    },
    {
        title: "Project Architect",
        description: "Turn your app idea into a technical roadmap. Get daily coding tasks to build your MVP flawlessly.",
        icon: Code,
        href: "/blueprint/project/new",
        color: "from-violet-500/20 to-purple-500/20",
        iconColor: "text-violet-500",
        badge: "New",
    },
    {
        title: "Career Mentor",
        description: "Navigate your career transition from your current role to your dream job with step-by-step milestones.",
        icon: BriefcaseBusiness,
        href: "/blueprint/career/new",
        color: "from-orange-500/20 to-amber-500/20",
        iconColor: "text-amber-500",
        badge: "New",
    },
    {
        title: "Networking Strategist",
        description: "Build a high-value professional network. Get a weekly outreach plan to connect with the right people.",
        icon: Users,
        href: "/blueprint/networking/new",
        color: "from-blue-600/20 to-indigo-600/20",
        iconColor: "text-blue-600",
        badge: "New",
    },
    {
        title: "Business Architect",
        description: "Turn your startup idea into a validated business model with a 30-day execution roadmap.",
        icon: BriefcaseBusiness,
        href: "/blueprint/business/new",
        color: "from-slate-700/20 to-slate-900/20",
        iconColor: "text-slate-800",
        badge: "New",
    },
    {
        title: "Health Coach",
        description: "Optimize your nutrition, sleep, and stress management with a personalized wellness protocol.",
        icon: Heart,
        href: "/blueprint/health/new",
        color: "from-red-500/20 to-rose-500/20",
        iconColor: "text-rose-500",
        badge: "New",
    },
    {
        title: "Learning Mentor",
        description: "Master any new skill with a structured curriculum, curated resources, and weekly checkpoints.",
        icon: GraduationCap,
        href: "/blueprint/learning/new",
        color: "from-yellow-500/20 to-orange-500/20",
        iconColor: "text-orange-600",
        badge: "New",
    },
    {
        title: "Mindset Coach",
        description: "Rebuild your psychology. Overcome limiting beliefs and build unstoppable mental resilience.",
        icon: Brain,
        href: "/blueprint/mindset/new",
        color: "from-pink-500/20 to-purple-500/20",
        iconColor: "text-pink-600",
        badge: "New",
    },
    {
        title: "Productivity Expert",
        description: "Design your ultimate daily routine and task system to achieve 10x more in less time.",
        icon: Zap,
        href: "/blueprint/productivity/new",
        color: "from-yellow-400/20 to-amber-400/20",
        iconColor: "text-amber-600",
        badge: "New",
    },
    {
        title: "Relationship Specialist",
        description: "Improve your social life, communication, and emotional intelligence with actionable exercises.",
        icon: Scale,
        href: "/blueprint/relationships/new",
        color: "from-teal-500/20 to-emerald-500/20",
        iconColor: "text-teal-600",
        badge: "New",
    },
    {
        title: "Life Architect",
        description: "A holistic 360-degree plan covering all domains of your life for total transformation.",
        icon: LifeBuoy,
        href: "/blueprint/life/new",
        color: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-600",
        badge: "New",
    },
];

const blueprintTypeConfig: Record<string, { icon: any; color: string; badgeColor: string; label: string }> = {
    Income: { icon: Wallet, color: "text-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Financial" },
    Project: { icon: Code, color: "text-violet-500", badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Project" },
    Career: { icon: BriefcaseBusiness, color: "text-amber-500", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Career" },
    Gym: { icon: Dumbbell, color: "text-cyan-500", badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", label: "Fitness" },
    Networking: { icon: Users, color: "text-blue-600", badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Networking" },
    Business: { icon: BriefcaseBusiness, color: "text-slate-800", badgeColor: "bg-slate-500/10 text-slate-800 border-slate-500/20", label: "Business" },
    Health: { icon: Heart, color: "text-rose-500", badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20", label: "Health" },
    Learning: { icon: GraduationCap, color: "text-orange-600", badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20", label: "Learning" },
    Mindset: { icon: Brain, color: "text-pink-600", badgeColor: "bg-pink-500/10 text-pink-600 border-pink-500/20", label: "Mindset" },
    Productivity: { icon: Zap, color: "text-amber-600", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Efficiency" },
    Relationships: { icon: Scale, color: "text-teal-600", badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20", label: "Social" },
    Life: { icon: LifeBuoy, color: "text-indigo-600", badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", label: "Holistic" },
};

export default function BlueprintHubPage() {
    const router = useRouter()
    const [activeBlueprints, setActiveBlueprints] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [limits, setLimits] = useState<any>(null)
    const [selectedAgent, setSelectedAgent] = React.useState<any>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const [bpRes, limRes] = await Promise.all([
                    fetch('/api/dashboard/active-blueprints'),
                    fetch('/api/subscription/limits')
                ])
                const bpData = await bpRes.json()
                const limData = await limRes.json()

                if (bpData.success) setActiveBlueprints(bpData.blueprints)
                if (limRes.ok) setLimits(limData)
            } catch (err) {
                console.error("Failed to fetch active blueprints:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetch_()
    }, [])

    const handleUnlock = async () => {
        try {
            // call backend to create order
            const res = await fetch("/api/payment/create-agent-order", {
                method: "POST",
                body: JSON.stringify({
                    agent: selectedAgent.title
                })
            });

            const data = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: data.amount,
                order_id: data.order_id,
                handler: async function (response: any) {
                    await fetch("/api/payment/verify-agent-payment", {
                        method: "POST",
                        body: JSON.stringify({
                            ...response,
                            agent: selectedAgent.title
                        })
                    });

                    setIsModalOpen(false);
                    // refresh UI or unlock locally
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-12">
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

            {/* Grid of Agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agents.map((agent) => {
                    const Icon = agent.icon;
                    const isFreeAgent = agent.title === "Project Architect" || agent.title === "Career Mentor";
                    const isPremiumLocked = limits && !limits.isPro && !isFreeAgent;
                    const isLocked = isPremiumLocked || limits?.blueprints?.hasReachedLimit;

                    const lockedMessage = isPremiumLocked ? "Upgrade to Pro to unlock" : "Weekly free limit reached";

                    return (
                        <div
                            key={agent.title}
                            onClick={() => {
                                if (isLocked) {
                                    setSelectedAgent(agent)
                                    setIsModalOpen(true)
                                } else {
                                    router.push(agent.href)
                                }
                            }}
                            className="h-full"
                        >
                            <Card className={`group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card cursor-pointer h-full ${isLocked ? 'opacity-70 grayscale-[0.2]' : ''}`}>
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-linear-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <CardContent className="p-8 relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-4 rounded-2xl bg-background shadow-sm border ${agent.iconColor}`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLocked && (
                                                <Badge variant="destructive" className="shadow-sm gap-1">
                                                    <Lock className="w-3 h-3" /> Locked
                                                </Badge>
                                            )}
                                            {agent.badge && !isLocked && (
                                                <Badge variant={agent.badge === "New" ? "default" : "secondary"} className="shadow-sm">
                                                    {agent.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold font-heading tracking-tight group-hover:text-primary transition-colors">
                                            {agent.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {agent.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
                                        {isLocked ? (
                                            <>
                                                <Lock className="w-4 h-4 mr-2 text-rose-500" />
                                                <span className="text-rose-500">{lockedMessage}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Start generating
                                                <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* /// Modal for Locked Agents */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-800 text-center">

                        <h2 className="text-2xl font-bold mb-2">
                            Unlock {selectedAgent?.title}
                        </h2>

                        <p className="text-sm text-muted-foreground mb-6">
                            Get full access to this AI agent and boost your productivity.
                        </p>

                        <div className="text-4xl font-black text-indigo-600 mb-6">
                            ₹49
                        </div>

                        <button
                            onClick={handleUnlock}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                        >
                            Unlock Now
                        </button>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 text-sm text-muted-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Active Blueprints Section */}
            <div className="pt-8 border-t border-border/50">
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
                                        <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-border/50 h-full">
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className={`p-2 rounded-xl border ${config.badgeColor}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <Badge variant="outline" className={`text-[10px] border ${config.badgeColor}`}>
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-tight line-clamp-2">{bp.title}</p>
                                                </div>
                                                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        View plan
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </CardContent>
                                        </Card>
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
                                <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-dashed border-border h-full">
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
