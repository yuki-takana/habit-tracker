import HabitImpactGraph from '../HabitImpactGraph'
import AnimatedGradient from '../AnimatedGradient'
import { Sparkles, MessageSquare } from 'lucide-react'
import { AvatarGroupCountIconExample } from './avatarGroup'
import { prisma } from "@/lib/prisma";
import HeroButtons from './HeroButtons';

const HeroSection = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
        },
    });
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 px-6 pt-32 pb-40">
            <AnimatedGradient />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(99,102,241,0.04) 50%, transparent 75%)",
                }}
            />

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
                    Turn daily tiny habits into{" "}
                    <span className="text-indigo-600 dark:text-indigo-400">
                        your biggest flex
                        <span className="text-slate-400 dark:text-zinc-800">.</span>
                    </span>
                </h1>

                <div className="flex flex-col items-center gap-6 mb-12 text-center px-4">
                    <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
                        The gamified habit tracker built for developers and builders. Log via WhatsApp, and watch your life level up — one habit at a time.
                    </h2>
                </div>

                <HeroButtons />

                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 pt-5">
                    <div className="flex items-center justify-center">
                        <AvatarGroupCountIconExample users={users} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                        <div className="flex text-yellow-400 text-sm sm:text-base">
                            {"★★★★★"}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">
                            Loved by{" "}
                            <span className="font-semibold text-foreground">{users.length}+</span>{" "}
                            users
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 opacity-50">
                    Track code • Gym • Finance • Mindset
                </p>
            </div>
        </div>
    );
};

export default HeroSection;