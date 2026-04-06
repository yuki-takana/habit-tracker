"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Dumbbell, Wallet, Code, BriefcaseBusiness, TrendingUp } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ActiveBlueprintCard } from '../ui/ActiveBlueprintCard'

const iconMap: Record<string, any> = {
    Dumbbell: Dumbbell,
    Wallet: Wallet,
    Code: Code,
    BriefcaseBusiness: BriefcaseBusiness
}

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
            <Card className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 flex flex-col items-center justify-center min-h-[300px]">
                <UflLoaderInline style="flip" />
                <p className="text-sm font-medium text-slate-500 mt-6 animate-pulse uppercase tracking-[0.2em]">Syncing Blueprints...</p>
            </Card>
        )
    }

    if (blueprints.length === 0) {
        return (
            <Card className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
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
        <Card className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
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
                    const Icon = iconMap[bp.icon] || Sparkles;
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
                                    badgeColor={bp.badgeColor}
                                />
                            </Link>
                        </motion.div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
