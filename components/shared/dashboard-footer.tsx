"use client";
import { usePathname } from "next/navigation";
import { KNOWN_ROUTES, DASHBOARD_ROUTES } from "@/lib/constants";
const PROJECTS = [
    { name: "Vaadanuvaad", url: "https://vaadanuvaad.vercel.app/" },
    { name: "Brainwave", url: "https://brainwave-omega-sooty.vercel.app/" },
    { name: "E-commerce", url: null },
    { name: "Medical Booking", url: null },
    { name: "Invoicy", url: null },
    { name: "Lead-Gen SaaS", url: null },
];

const DashboardFooter = () => {
    const pathname = usePathname();
    const isUsername = pathname.split("/").length === 2 && !KNOWN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) && !pathname.startsWith("/api");
    const isDashboardRoute = DASHBOARD_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
    );
    if (isUsername) return null;

    return (
        <footer className="border-t border-slate-200 dark:border-zinc-800 py-10 text-sm text-slate-500 dark:text-zinc-400 mb-16 md:mb-0">

            <div
                className={`
    max-w-5xl mx-auto px-4 sm:px-6
    ${isDashboardRoute ? 'md:ml-64 lg:ml-72' : ''}
  `}
            >

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">

                    {/* LEFT: BRAND */}
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-2">
                            UFL
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed max-w-xs">
                            Building systems for consistency, growth, and personal evolution.
                        </p>
                    </div>

                    {/* CENTER: PROJECTS */}
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                            Projects
                        </h4>

                        <ul className="space-y-2">
                            {PROJECTS.map((p) =>
                                p.url ? (
                                    <li key={p.name}>
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative inline-block text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            {p.name}
                                            <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                                        </a>
                                    </li>
                                ) : (
                                    <li key={p.name}>
                                        <span className="text-sm text-slate-300 dark:text-zinc-700">
                                            {p.name}
                                        </span>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* RIGHT: CREDIT */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                            About
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-zinc-500 mb-3">
                            © 2026 UFL. All rights reserved.
                        </p>

                        <p className="text-xs text-slate-400 dark:text-zinc-600">
                            Crafted with{" "}
                            <span className="text-red-400">♥</span>{" "}
                            by{" "}
                            <a
                                href="https://hellocoders.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
                            >
                                Abhishek
                            </a>
                        </p>
                    </div>

                </div>

                {/* BOTTOM LINE */}
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-600">
                    Built for focus. Designed for growth.
                </div>

            </div>
        </footer>
    );
};

export default DashboardFooter;
