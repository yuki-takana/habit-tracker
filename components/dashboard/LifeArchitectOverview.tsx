"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Sparkles, Trophy, TreeDeciduous, Zap } from 'lucide-react'
import { getTreeEmojiString, calculateTreeScale } from '@/lib/utils/forest'

function TreeMini({ category, index, treeTaskCount, totalIndex }: any) {
    const emoji = getTreeEmojiString(category, index);
    const scale = calculateTreeScale(treeTaskCount);
    
    // Swaying animation variables
    const animationDelay = (totalIndex % 5) * 0.4;
    
    // Forest layout scattering
    // Even items sit further back, odd items are lower and in front
    const isForeground = totalIndex % 2 !== 0;
    const yOffset = isForeground ? 8 : 0; 
    const zIndex = isForeground ? 30 : 20;

    return (
        <motion.div
            animate={{ y: [yOffset, yOffset - 3, yOffset] }}
            transition={{ repeat: Infinity, duration: 3.5, delay: animationDelay, ease: "easeInOut" }}
            className="relative flex items-end justify-center -ml-3 sm:-ml-4 group hover:z-50 cursor-pointer"
            style={{ zIndex }}
            title={`${category.toUpperCase()} (${treeTaskCount}/5 Tasks)`}
        >
            <div 
                className="text-4xl sm:text-5xl leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] origin-bottom transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-hover:brightness-110" 
                style={{ transform: `scale(${scale})` }}
            >
                {emoji}
            </div>
        </motion.div>
    );
}

function getRoleTheme(roleTitle: string) {
    const title = (roleTitle || '').toLowerCase();
    if (title.includes('develop') || title.includes('engineer') || title.includes('program')) {
        return "from-blue-900 to-indigo-950 shadow-blue-500/20 text-blue-100";
    }
    if (title.includes('design') || title.includes('art') || title.includes('creat')) {
        return "from-fuchsia-900 to-pink-950 shadow-pink-500/20 text-fuchsia-100";
    }
    if (title.includes('found') || title.includes('entrepreneur') || title.includes('ceo') || title.includes('leader')) {
        return "from-amber-900 to-orange-950 shadow-amber-500/20 text-amber-100";
    }
    if (title.includes('data') || title.includes('analy')) {
        return "from-teal-900 to-emerald-950 shadow-teal-500/20 text-teal-100";
    }
    if (title.includes('market') || title.includes('growth')) {
        return "from-rose-900 to-red-950 shadow-rose-500/20 text-rose-100";
    }
    return "from-indigo-950 to-violet-950 shadow-indigo-500/20 text-indigo-100";
}

interface LifeArchitectOverviewProps {
    data: {
        roleTitle: string;
        roleLevel: number;
        streakShields: number;
        streakShieldContinuity: number;
        forestGrowth: number;
        totalStreakDays: number;
        forestCategories?: any[];
    }
}

export const LifeArchitectOverview = ({ data }: LifeArchitectOverviewProps) => {
    const roleTheme = getRoleTheme(data.roleTitle);

    // Flatten forest categories into a single mixed forest layout
    const allTrees = (data.forestCategories || []).flatMap((catData: any) => {
        const numTrees = Math.max(1, Math.ceil(catData.completed / 5));
        return Array.from({ length: numTrees }).map((_, i) => ({
            category: catData.category,
            index: i,
            treeTaskCount: (i === numTrees - 1 && catData.completed > 0 && catData.completed % 5 !== 0)
                ? catData.completed % 5
                : catData.completed === 0 ? 0 : 5
        }));
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Role Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className={`rounded-2xl p-6 bg-linear-to-br ${roleTheme.split(' ').slice(0, 2).join(' ')} text-white shadow-xl ${roleTheme.split(' ')[2]} relative overflow-hidden`}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className={`text-xs font-black uppercase tracking-widest ${roleTheme.split(' ')[3]}`}>Current Role</p>
                            <h3 className="text-2xl font-black tracking-tight">{data.roleTitle || "Beginner"}</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                            <span>Level {data.roleLevel} Progression</span>
                            <span>{data.totalStreakDays % 5}/5 Days</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((data.totalStreakDays % 5) / 5) * 100}%` }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Streak Shield Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-1">Streak Shields</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2">
                            {data.streakShields} <Shield className="text-indigo-500 fill-indigo-500/20" size={28} />
                        </h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900">
                        <Zap className="text-yellow-500" size={24} />
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shield Continuity Progress</p>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-2 flex-1 rounded-full ${step <= data.streakShieldContinuity
                                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        : "bg-slate-100 dark:bg-zinc-800"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic">Complete 60% of daily todos to protect your streak.</p>
                </div>
            </motion.div>

            {/* Forest Growth Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-1">Soul Forest</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Level {Math.floor(data.forestGrowth / 20) + 1}</h3>
                    </div>
                    <TreeDeciduous className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                </div>

                <div className="h-28 w-full flex items-end justify-center relative pt-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-2xl pointer-events-none" />
                    <div className="absolute bottom-2 w-3/4 h-6 bg-emerald-900/10 dark:bg-emerald-500/10 blur-xl rounded-[100%] pointer-events-none" />
                    
                    {allTrees.length > 0 ? (
                        <div className="flex items-end justify-center mb-6 pl-4 relative z-10 w-full">
                            {allTrees.slice(0, 14).map((tree, i) => (
                                <TreeMini
                                    key={`${tree.category}-${tree.index}-${i}`}
                                    {...tree}
                                    totalIndex={i}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40 pb-4 z-10">
                            <Sparkles size={20} className="text-slate-300" />
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Planting soon...</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
