"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function HeroButtons() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [active, setActive] = useState<string | null>(null);

    const go = (href: string) => {
        setActive(href);
        startTransition(() => router.push(href));
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={() => go("/dashboard")}
                disabled={isPending}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 hover:cursor-pointer flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
                {isPending && active === "/dashboard" ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <ArrowRight size={18} />
                )}
                Start Today
            </button>

            <button
                onClick={() => go("/journey")}
                disabled={isPending}
                className="px-10 py-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all hover:cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
                {isPending && active === "/journey" && (
                    <Loader2 size={18} className="animate-spin" />
                )}
                View Progress
            </button>
        </div>
    );
}