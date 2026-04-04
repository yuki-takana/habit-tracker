import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Settings2, Code2 } from "lucide-react";
import Link from "next/link";

export default async function CodingLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });
    
    if (!user) redirect("/");

    const hasKeys = !!(user.wakatimeApiKey || user.githubApiKey);

    if (!hasKeys) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-10 flex flex-col items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-2xl text-center">
                    <div className="h-20 w-20 bg-slate-900 dark:bg-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl">
                        <Code2 className="h-10 w-10 text-white dark:text-zinc-900" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-3">
                        Coding Studio Locked
                    </h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        To unlock your engineering and freelance dashboards, you must connect WakaTime or GitHub integrations.
                    </p>
                    <Link href="/settings" className="w-full">
                        <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 uppercase text-xs flex items-center justify-center gap-2">
                            <Settings2 size={16} />
                            Connect Integrations
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
