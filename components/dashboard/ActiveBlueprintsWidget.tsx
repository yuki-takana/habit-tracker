"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Dumbbell, Wallet, Code, BriefcaseBusiness, TrendingUp } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ActiveBlueprintCard } from '../ui/ActiveBlueprintCard'
import {
    Heart,
    Brain,
    GraduationCap,
    Zap,
    Scale,
    LifeBuoy,
    Users
} from "lucide-react";

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
    Relationship: { icon: Scale, color: "text-teal-600", badgeColor: "bg-teal-500/10 text-teal-600 border-teal-500/20", label: "Social" },
};

export function ActiveBlueprintsWidget() {
    const [blueprints, setBlueprints] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                const res = await fetch('/api/dashboard/active-blueprints')
                const data = await res.json()
                if (data.success) {
                    setBlueprints(data.blueprints)
                }
            } catch (err) {
                console.error("Failed to load active blueprints", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBlueprints()
    }, [])

    if (isLoading) {
        return (
            <Card className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <UflLoaderInline style="pulse-dots" />
                <p className="text-sm font-medium text-slate-500 mt-6 animate-pulse uppercase tracking-[0.2em]">Syncing Blueprints...</p>
            </Card>
        )
    }

    if (blueprints.length === 0) {
        return (
            <Card className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        Active AI Blueprints
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">No specialized AI plans currently active.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 mt-6 flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-[2rem] border border-dashed border-border/50">
                    <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 max-w-xs font-medium uppercase tracking-tight">Delegate your life goals to an expert AI agent to get daily actionable steps.</p>
                    <Link href="/blueprint">
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 cursor-pointer rounded-xl font-bold shadow-lg shadow-indigo-500/20">
                            Initialize AI Agent
                        </Badge>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-8 space-y-0">
                <div className="space-y-1 block">
                    <CardTitle className="text-xl font-bold flex items-center gap-3 tracking-tight">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        Active AI Blueprints
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">Your current autonomous growth strategies.</CardDescription>
                </div>
                <Link href="/blueprint" className="hidden sm:flex items-center gap-1 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-all group">
                    View Blueprint Hub
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </CardHeader>
            <CardContent className="px-0 pb-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {blueprints.map((bp: any, i: number) => {
                    const config = blueprintTypeConfig[bp.type] || blueprintTypeConfig["Gym"]
                    const Icon = config.icon
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
            </CardContent>
        </Card>
    )
}

