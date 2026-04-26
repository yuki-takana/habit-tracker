import React from 'react';
import { MessageSquare, Github, Dumbbell, Wallet, Terminal, Zap } from 'lucide-react';
import { WaitlistSection } from './waitlist-section';
import { prisma } from '@/lib/prisma';
import { AIAgentShowcase } from './ai-agent-showcase';
import { DataFlowVisualization } from './data-flow-visualization';
import { TestimonialSection } from './testimonial-section';
import HabitPlayground from './habitPlayGround';
import { Badge } from '../ui/badge';
import WhatsappPlayground from './whatsappPlayground';

const LandingPageContent = async () => {
    const users = await prisma.waitlist.findMany({
        orderBy: { email: "desc" },
    });
    return (
        <div className="w-full bg-white dark:bg-zinc-950 flex flex-col items-center">
            <HabitPlayground />

            {/* --- 1. THE BENTO GRID FEATURES --- */}
            <section className="w-full max-w-6xl px-6 py-24">
                <div className="flex justify-center mb-4">
                    <Badge
                        variant="outline"
                        className="gap-2 px-3 py-1 text-[10px] font-bold tracking-widest capitalize border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                        features in action
                    </Badge>
                </div>

                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white camelcase tracking-tight">
                        Everything you care about. <span className="text-indigo-600 dark:text-indigo-400">Zero friction.</span><span className="text-indigo-600 dark:text-indigo-400">Maximum signal</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Context switching is the enemy of progress. UFL unifies your technical, physical, and financial life.
                    </p>
                </div>
                <WhatsappPlayground />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1: WhatsApp (Spans 2 columns) */}
                    <div className="md:col-span-2 group rounded-[2.5rem] border border-emerald-200/60 dark:border-zinc-800 
bg-emerald-50/30 dark:bg-zinc-900/40 p-10 flex flex-col justify-between
transition-all duration-300 ease-out hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5">
                        <div>
                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <MessageSquare className="text-emerald-600 dark:text-emerald-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Log via WhatsApp</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                                No app to install. Just reply to your daily automated text with your gym stats or financial updates. The system parses your message and updates your dashboard instantly.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: GitHub Automation */}
                    <div className="group rounded-[2.5rem] border border-indigo-200/60 dark:border-zinc-800 
bg-indigo-50/30 dark:bg-zinc-900/40 p-10
transition-all duration-300 ease-out hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5">
                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                            <Github className="text-indigo-600 dark:text-indigo-400" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Auto-Sync Code</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Connect your GitHub. Your commits, PRs, and freelance pushes are tracked automatically. Proof of work, visualized.
                        </p>
                    </div>

                    {/* Feature 3: Gym & Health */}
                    <div className="group rounded-[2.5rem] border border-orange-200/60 dark:border-zinc-800 
bg-orange-50/30 dark:bg-zinc-900/40 p-10
transition-all duration-300 ease-out hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/5">
                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-950 border border-orange-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                            <Dumbbell className="text-orange-600 dark:text-orange-400" size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Iron & Energy</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Track intensity, volume, and daily energy. See exactly how your physical health correlates with your code output.
                        </p>
                    </div>

                    {/* Feature 4: Finance (Spans 2 columns) */}
                    <div className="md:col-span-2 group rounded-[2.5rem] border border-blue-200/60 dark:border-zinc-800 
bg-blue-50/30 dark:bg-zinc-900/40 p-10 flex flex-col justify-between
transition-all duration-300 ease-out hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5">
                        <div>
                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <Wallet className="text-blue-600 dark:text-blue-400" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Financial Growth</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                                Watch your revenue scale alongside your skills. Track freelance payments, salary bumps, and monetary milestones over the 90-day reset.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Data Flow */}
            <DataFlowVisualization />

            {/* AI Agent Showcase */}
            <AIAgentShowcase />

            {/* --- 2. THE ANTI-SPREADSHEET MANIFESTO --- */}
            <div className='px-6 w-full max-w-6xl'>
                <section className="w-full bg-slate-900 dark:bg-zinc-900 py-32 px-10 my-24 relative overflow-hidden rounded-[4rem] border border-slate-800">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)]" />
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <Terminal className="text-indigo-500 mx-auto mb-10 animate-pulse" size={48} />
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter camelcase leading-none">
                            Spreadsheets are where <span className="text-indigo-400 italic">habits go to die.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
                            Manual data entry is a chore. UFL is opinionated: automate what you can (code), and make the rest as easy as sending a text. If it's not automated, it's not sustainable.
                        </p>
                    </div>
                </section>
            </div>

            {/* Testimonials */}
            <TestimonialSection />

            {/* --- 3. HOW IT WORKS --- */}
            <section className="w-full max-w-6xl px-6 py-24">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white camelcase tracking-tight">How the system works</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto italic">From day 0 to day 90.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center group">
                        <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-2xl font-black text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 shadow-sm group-hover:border-indigo-500 transition-colors">
                            1
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Connect the APIs</h4>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Link your GitHub and authorize the WhatsApp bot. The foundation is set in minutes.</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-6 text-2xl font-black text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 shadow-sm group-hover:border-indigo-500 transition-colors">
                            2
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Do the Work</h4>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Focus on the output. Push your code, hit the gym, and execute your AI-generated roadmap.</p>
                    </div>
                    <div className="flex flex-col items-center group">
                        <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center mb-6 text-2xl font-black text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Review & Pivot</h4>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Watch the data converge. Let the AI agents adjust your plan based on real-world performance.</p>
                    </div>
                </div>
            </section>

            {/* --- 4. WAITLIST CTA --- */}
            <div className="w-full bg-slate-50 dark:bg-zinc-950/50 border-t border-slate-200/60 dark:border-zinc-800/60">
                <WaitlistSection users={users} />
            </div>
        </div>
    );
};

export default LandingPageContent;