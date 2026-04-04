import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function WorkoutsLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/");

    const sub = await prisma.subscription.findFirst({
        where: { userId: session.user.id, status: "active" }
    });
    
    const isPro = !!sub;

    if (!isPro) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-10 flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-2xl text-center">
                    <div className="h-20 w-20 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center mb-6">
                        <Lock className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-3 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">
                        Workouts Locked
                    </h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        AI-architected workout plans and bio-rhythm integration are exclusive to Habit Architect Pro members.
                    </p>
                    <Link href="/billing" className="w-full">
                        <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 uppercase text-xs flex items-center justify-center gap-2">
                            <Sparkles size={16} />
                            Upgrade to Pro
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
