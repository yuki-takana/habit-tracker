import Link from 'next/link'
import HabitImpactGraph from '../HabitImpactGraph'
import AnimatedGradient from '../AnimatedGradient'
import { Sparkles, MessageSquare, Terminal, ArrowRight } from 'lucide-react'
import { AvatarGroupCountIconExample } from './avatarGroup'
import { prisma } from "@/lib/prisma";

const HeroSection = async () => {
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            image: true,
        },
    });
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 px-6 pt-32 pb-40">
            {/* Premium Animated Background */}
            <AnimatedGradient />

            {/* Radial overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(99,102,241,0.04) 50%, transparent 75%)",
                }}
            />

            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(to right,#6366f1 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="absolute top-40 -left-10 md:left-20 animate-bounce duration-[3s] opacity-20 md:opacity-100 italic">
                <div className="z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-indigo-500/10">
                    <MessageSquare size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold font-mono">Logged: 2h Coding</span>
                </div>
            </div>

            <div className="z-20 absolute bottom-40 -right-10 md:right-20 animate-pulse opacity-20 md:opacity-100 italic">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-indigo-500/10 transform rotate-6">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-xs font-bold font-mono">Leveling Up...</span>
                </div>
            </div>

            <div className="text-center max-w-4xl relative z-10">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 capitalize leading-[0.9]">
                    Turn daily habits into <span className="text-indigo-600 dark:text-indigo-400">your biggest flex<span className="text-slate-400 dark:text-zinc-800">.</span></span>
                </h1>

                <div className="flex flex-col items-center gap-6 mb-12 text-center px-4">
                    {/* Killer Feature Badge */}
                    <div className='border border-emerald-300 rounded-full p-1'>
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/5 ">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            WhatsApp Sync Active
                        </div>
                    </div>

                    <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                        {/* The <span className="text-slate-900 dark:text-white font-bold">90-day reset</span> protocol for builders.
                        <br />
                        Automate your habits, track your code, and architect your physical & financial transformation in one premium dashboard. */}
                        The gamified habit tracker built for developers and builders. Log via WhatsApp, and watch your life level up — one habit at a time.
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/dashboard"
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 hover:cursor-pointer flex items-center gap-2"
                    >
                        Start Today
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/journey"
                        className="px-10 py-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all hover:cursor-pointer shadow-lg"
                    >
                        View Progress
                    </Link>
                </div>
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 pt-5">

                    <div className="flex items-center justify-center">
                        <AvatarGroupCountIconExample users={users} />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                        <div className="flex text-yellow-400 text-sm sm:text-base">
                            {"★★★★★"}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">
                            Loved by <span className="font-semibold text-foreground">{users.length}+</span> builders
                        </p>

                    </div>

                </div>

                <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 opacity-50">
                    Track code • Gym • Finance • Mindset
                </p>
            </div>

            {/* App Preview Frame */}
            {/* <div className="mt-24 w-full max-w-5xl rounded-[3rem] border-8 border-slate-100/50 dark:border-zinc-900/50 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-md shadow-[0_40px_100px_-20px_rgba(99,102,241,0.2)]">
                <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-zinc-800">
                    <HabitImpactGraph />
                </div>
            </div> */}
        </div>
    )
}

export default HeroSection
