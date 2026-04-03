"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Github, Database, Cpu, LayoutDashboard, ArrowRight, Zap } from 'lucide-react';

const FlowItem = ({ icon: Icon, label, desc, color }: { icon: any, label: string, desc: string, color: string }) => (
    <div className="flex flex-col items-center p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 group hover:border-indigo-500/30 transition-all duration-500">
        <div className={`w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-zinc-800 shadow-sm group-hover:scale-110 transition-transform ${color}`}>
            <Icon size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{label}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[160px]">
            {desc}
        </p>
    </div>
);

const Connector = () => (
    <div className="hidden lg:flex items-center justify-center p-4">
        <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-indigo-500/40"
        >
            <ArrowRight size={24} strokeWidth={3} />
        </motion.div>
    </div>
);

export function DataFlowVisualization() {
    return (
        <section className="w-full max-w-7xl px-6 py-24 mx-auto overflow-hidden">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white camelcase">
                    The <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-8">Data Loop.</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    UFL doesn't wait for you to open a dashboard. It meets you where you already spend your time—writing code and sending texts.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 relative">
                {/* Step 1 & 2 Inputs */}
                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <FlowItem
                            icon={Github}
                            label="GitHub API"
                            desc="Automatic commit & PR tracking from your repositories."
                            color="text-slate-900 dark:text-white"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <FlowItem
                            icon={MessageSquare}
                            label="WhatsApp"
                            desc="Evening prompts to log gym stats & finance updates via text."
                            color="text-emerald-500"
                        />
                    </motion.div>
                </div>

                <Connector />

                {/* Step 3: AI Engine */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative px-12 py-10 rounded-[3rem] bg-indigo-600 shadow-2xl shadow-indigo-500/30 flex flex-col items-center gap-4 z-20 group"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] rounded-[3rem]" />
                    <div className="w-20 h-20 rounded-3xl bg-white/10 dark:bg-zinc-950/20 flex items-center justify-center border border-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                        <Cpu className="text-white" size={40} />
                    </div>
                    <div className="text-center">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">AI Orchestrator</h4>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Real-time processing</p>
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg transform rotate-12">
                        <Zap className="text-amber-900" size={24} fill="currentColor" />
                    </div>
                </motion.div>

                <Connector />

                {/* Step 4: Dashboard */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <FlowItem
                        icon={LayoutDashboard}
                        label="Unified Growth"
                        desc="One premium dashboard for your 90-day transformation."
                        color="text-indigo-500"
                    />
                </motion.div>
            </div>

            <div className="mt-20 flex justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer group">
                    Architect Your 90-Day Reset
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </section>
    );
}
