"use client";
import { usePathname } from "next/navigation";

export const KNOWN_ROUTES = ["/", "/coding", "/blueprint", "/dashboard", "/settings", "/signin", "/signup", "/habits", "/todos", "/insights", "/daily-goals", "/routines", "/challenges", "/admin", "/plans", "/leaderboard", "/privacy", "/terms"];

const DashboardFooter = () => {
    const pathname = usePathname();
    const isUsername = pathname.split("/").length === 2 && !KNOWN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) && !pathname.startsWith("/api");
    if (isUsername) return null;

    return (
        <div className="border-t border-slate-200 dark:border-zinc-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400 mb-16 md:mb-0">
            <p>© 2026 UFL. All rights reserved.</p>
        </div>
    );
};

export default DashboardFooter;
