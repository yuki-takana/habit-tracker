"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Wallet, Code, BriefcaseBusiness, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const agents = [
    {
        title: "Senior Gym Trainer",
        icon: <Dumbbell className="w-6 h-6" />,
        color: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-cyan-500",
        description: "Architects 7-day hypertrophy and strength programs based on your BMI and equipment.",
        perks: ["Custom Split Logic", "Form Cues", "Progressive Overload"]
    },
    {
        title: "Financial Strategist",
        icon: <Wallet className="w-6 h-6" />,
        color: "from-emerald-500/20 to-green-500/20",
        iconColor: "text-emerald-500",
        description: "Maps your path to financial freedom through skill-stacking and freelance growth.",
        perks: ["Income Milestones", "Skill Acquisition", "Tax Optimization"]
    },
    {
        title: "Project Architect",
        icon: <Code className="w-6 h-6" />,
        color: "from-violet-500/20 to-purple-500/20",
        iconColor: "text-violet-500",
        description: "Turns vague app ideas into daily PRs. The bridge between concept and MVP.",
        perks: ["Tech Stack Design", "Daily Coding Tasks", "Architecture Docs"]
    },
    {
        title: "Career Mentor",
        icon: <BriefcaseBusiness className="w-6 h-6" />,
        color: "from-orange-500/20 to-amber-500/20",
        iconColor: "text-amber-500",
        description: "Navigates the jump from current role to high-tier engineering or leadership.",
        perks: ["Resume Refinement", "Network Strategy", "Interview Roadmap"]
    },
    {
        title: "Life Strategist",
        icon: <Sparkles className="w-6 h-6" />,
        color: "from-pink-500/20 to-rose-500/20",
        iconColor: "text-rose-500",
        description: "Designs a balanced life blueprint across health, work, and personal goals.",
        perks: ["Goal Mapping", "Life Balance", "Priority Systems"]
    },
    {
        title: "Relationship Advisor",
        icon: <Sparkles className="w-6 h-6" />,
        color: "from-red-500/20 to-pink-500/20",
        iconColor: "text-pink-500",
        description: "Helps improve communication, emotional intelligence, and relationship dynamics.",
        perks: ["Communication Skills", "Conflict Resolution", "Trust Building"]
    },
    {
        title: "Health Optimizer",
        icon: <Sparkles className="w-6 h-6" />,
        color: "from-green-500/20 to-lime-500/20",
        iconColor: "text-lime-500",
        description: "Builds sustainable routines for nutrition, sleep, and long-term vitality.",
        perks: ["Nutrition Plans", "Sleep Optimization", "Energy Tracking"]
    },
    {
        title: "Business Builder",
        icon: <BriefcaseBusiness className="w-6 h-6" />,
        color: "from-yellow-500/20 to-orange-500/20",
        iconColor: "text-yellow-500",
        description: "Transforms ideas into scalable businesses with growth and monetization strategies.",
        perks: ["Market Validation", "Revenue Strategy", "Growth Loops"]
    },
    {
        title: "Learning Coach",
        icon: <Code className="w-6 h-6" />,
        color: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-500",
        description: "Accelerates skill acquisition through structured learning systems.",
        perks: ["Learning Paths", "Knowledge Retention", "Skill Tracking"]
    },
    {
        title: "Mindset Mentor",
        icon: <Sparkles className="w-6 h-6" />,
        color: "from-purple-500/20 to-fuchsia-500/20",
        iconColor: "text-fuchsia-500",
        description: "Builds resilience, discipline, and high-performance thinking habits.",
        perks: ["Mental Models", "Confidence Building", "Habit Reinforcement"]
    },
    {
        title: "Networking Strategist",
        icon: <BriefcaseBusiness className="w-6 h-6" />,
        color: "from-sky-500/20 to-blue-500/20",
        iconColor: "text-sky-500",
        description: "Expands your opportunities by designing powerful professional networks.",
        perks: ["Connection Mapping", "Cold Outreach", "Opportunity Funnels"]
    },
    {
        title: "Productivity Engineer",
        icon: <Code className="w-6 h-6" />,
        color: "from-gray-500/20 to-slate-500/20",
        iconColor: "text-slate-500",
        description: "Optimizes your workflow using systems, automation, and focus strategies.",
        perks: ["Deep Work Systems", "Automation Tools", "Focus Frameworks"]
    }
];
function AgentCard({ agent }: any) {
    return (
        <Card className="group relative overflow-hidden border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 w-65 h-70">
            <CardContent className="p-6 flex flex-col h-full">

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                        <span className={agent.iconColor}>{agent.icon}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {agent.title}
                    </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                    {agent.description}
                </p>

                <div className="space-y-1 mb-4">
                    {agent.perks.slice(0, 2).map((perk: string) => (
                        <div
                            key={perk}
                            className="flex items-center gap-2 text-[10px] text-slate-400"
                        >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            {perk}
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between text-xs font-semibold">
                    <span>Initialize</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>

            </CardContent>
        </Card>
    );
}

export function AIAgentShowcase() {
    return (
        <section className="w-full max-w-6xl px-6 py-24 mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white camelcase">
                    Meet Your <span className="text-indigo-500">Board of Directors.</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                    Specialized AI agents that don't just "chat"—they architect, track, and hold you accountable.
                </p>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {agents.map((agent, i) => (
                    <motion.div
                        key={agent.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="group relative h-full overflow-hidden border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-red-900/50 hover:border-indigo-500/50 transition-all duration-500 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.98]">
                            <div className={`absolute inset-0 bg-linear-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <CardContent className="p-8 relative z-10 flex flex-col h-full">
                                <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-zinc-800 ${agent.iconColor}`}>
                                    {agent.icon}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-500 transition-colors">
                                    {agent.title}
                                </h3>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed grow">
                                    {agent.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                    {agent.perks.map((perk) => (
                                        <div key={perk} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                            {perk}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between group-hover:border-indigo-500/20 transition-colors">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Agent</span>
                                    <ArrowRight className="w-4 h-4 text-slate-400 transform group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div> */}
            <Carousel
                opts={{
                    align: "center",
                }}
                plugins={[
                    Autoplay({
                        delay: 2500,
                        stopOnInteraction: true,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {agents.map((agent, i) => (
                        <CarouselItem
                            key={agent.title}
                            className="pl-4 basis-full md:basis-1/2 lg:basis-1/4 flex justify-center"
                        >
                            <AgentCard agent={agent} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
