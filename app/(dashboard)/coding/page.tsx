"use client";

import { useEffect, useState } from "react";
import { Github, ExternalLink, Star, GitFork, FolderCode, CircleDot, GitCommit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";
import { Heatmap } from "@/components/github/Hitmap";
import { DevStatsSection } from "@/components/shared/DevStatsSection";

export default function CodingPage() {
    const [repos, setRepos] = useState<any[]>([]);
    const [advancedStats, setAdvancedStats] = useState<any>({ contributions: null, commits: [] });
    const [stats, setStats] = useState<any>(null);
    const [loadingAdvanced, setLoadingAdvanced] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchRepos = async () => {
        try {
            const res = await fetch("/api/github/repos");
            const data = await res.json();
            console.log("data for repos is ", data)
            setRepos(data.repos || []);
        } catch (error) {
            console.error("Failed to fetch repos:", error);
        }
    };

    const fetchAdvancedStats = async () => {
        try {
            const res = await fetch("/api/github/advanced");
            const data = await res.json();
            setAdvancedStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAdvanced(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await fetch("/api/wakatime");
            const data = await res.json();
            console.log("lkasdfjaksfj ", data)
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchRepos();
        fetchAdvancedStats();
        loadStats();
    }, []);

    function toMinutes(seconds: number) {
        return Math.round(seconds / 60);
    }

    const projectChartData = [
        stats?.projects?.reduce((acc: any, p: any) => {
            acc[p.name] = toMinutes(p.total_seconds);
            return acc;
        }, {})
    ];

    const languageChartData = [
        stats?.languages?.reduce((acc: any, l: any) => {
            acc[l.name] = toMinutes(l.total_seconds);
            return acc;
        }, {})
    ];

    const RecentCommits = ({ commits }: { commits: any[] }) => {
        if (!commits || commits.length === 0) return null;

        return (
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 h-full overflow-hidden flex flex-col hover:border-indigo-500/30 transition-all">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GitCommit size={22} className="text-indigo-500" />
                        Commit History
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        Latest
                    </span>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 max-h-150 scrollbar-hide">
                    {commits.map((commit, i) => (
                        <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all border border-transparent hover:border-indigo-500/10">
                            <div className="mt-1 h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                <GitCommit size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                                        {commit.message}
                                    </h3>
                                    <time className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap ml-4">
                                        {new Date(commit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-mono">
                                        {commit.repo.split('/')[1] || commit.repo}
                                    </span>
                                    <span className="text-[10px] text-slate-400">•</span>
                                    <span className="text-[10px] text-slate-400 truncate font-mono">
                                        {commit.sha.substring(0, 7)}
                                    </span>
                                </div>
                            </div>
                            <a href={commit.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-indigo-500">
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 italic uppercase">
                        Project Terminal<span className="text-indigo-500 not-italic">.</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-full wrap-break-word">
                        Your development ecosystem, synced in real-time.
                    </p>
                </div>

                {/* Active projects */}
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {repos.slice(0, 3).map((r, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold"
                            >
                                {r.name[0].toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {repos.length} active projects
                    </span>
                </div>
            </div>

            <div className="space-y-12 ">
                {/* Heatmap Section */}
                <section className="w-full flex justify-center">
                    {loadingAdvanced ? (
                        <Card className="w-full max-w-6xl p-12 flex flex-col items-center justify-center border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-3xl gap-4">
                            <UflLoaderInline style="flip" />
                            <p className="text-sm text-slate-500 font-medium">
                                Analyzing contribution pattern...
                            </p>
                        </Card>
                    ) : (
                        <div className="w-auto max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-0">
                            <Heatmap calendar={advancedStats.contributions} />
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Main Assets / Repositories Section */}
                    <div className="lg:col-span-3">
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Main Assets</h2>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-zinc-800 mx-6"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {repos.length > 0 ? (
                                    repos.map((repo) => (
                                        <Card key={repo.id} className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <FolderCode size={24} />
                                                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink size={18} className="hover:text-slate-900 dark:hover:text-white transition-colors" />
                                                    </a>
                                                </div>
                                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                                    {repo.name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                                    {repo.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-4 text-xs mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                        <Star size={14} className="text-amber-500" />
                                                        <span>{repo.stars} stars</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                        <GitFork size={14} className="text-blue-500" />
                                                        <span>{repo.forks} forks</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                        <CircleDot size={14} className="text-red-500" />
                                                        <span>{repo.openIssues} issues</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                        <GitCommit size={14} className="text-emerald-500" />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <span>{repo.weeklyCommits} wkly</span>
                                                                {repo.commitTrend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                                                                {repo.commitTrend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                                                                {repo.commitTrend === 'stable' && <Minus size={12} className="text-slate-400" />}
                                                            </div>
                                                            <span className="text-[9px] opacity-70">{repo.totalCommits} total</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                        {repo.language}
                                                    </span>
                                                    {repo.isPrivate && (
                                                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                                                            Private
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/10">
                                        <Github className="h-10 w-10 text-slate-300 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No GitHub Repositories Found</h3>
                                        <p className="text-sm text-slate-500 text-center max-w-xs mt-1">
                                            Add your GitHub Personal Access Token in <a href="/settings" className="text-indigo-500 font-bold hover:underline">Settings</a> to see your live projects.
                                        </p>
                                    </div>
                                )}

                                {/* Add Project CTA */}
                                <button className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20 hover:border-indigo-500 group transition-all min-h-[250px]">
                                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Github className="text-slate-400 group-hover:text-indigo-500" size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Source More Repos</h3>
                                    <p className="text-xs text-slate-500 text-center">Sync another organization</p>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* 3. Recent Activity Section (Sidebar) */}
                    <div className="lg:col-span-1">
                        {loadingAdvanced ? (
                            <Card className="p-12 flex flex-col items-center justify-center border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-3xl gap-4 h-full">
                                <UflLoaderInline style="flip" />
                                <p className="text-sm text-slate-500 font-medium">Syncing commits...</p>
                            </Card>
                        ) : (
                            <RecentCommits commits={advancedStats.commits} />
                        )}
                    </div>
                </div>
            </div>

            <Separator className="my-10 bg-red-600" />
            <div >
                {loadingStats ? (
                    <div className="flex justify-center py-20">
                        <UflLoaderInline style="flip" />
                    </div>
                ) : (
                    <DevStatsSection stats={stats} />
                )}
            </div>
        </div>
    );
}
