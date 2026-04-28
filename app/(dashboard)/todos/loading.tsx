
export default function TodosLoading() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 pt-6">

            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-3 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-2" />
                <div className="h-3 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse mb-6" />

                <div className="flex items-end justify-between mb-6">
                    <div className="space-y-2">
                        <div className="h-8 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-6 w-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                    </div>
                    <div className="flex gap-2.5">
                        <div className="h-11 w-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-11 w-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-11 w-28 rounded-2xl bg-indigo-200 dark:bg-indigo-900/40 animate-pulse" />
                    </div>
                </div>

                {/* Progress card skeleton */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-3 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    <div className="flex gap-3 mt-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Forest skeleton */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-800" />
                </div>
                <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 flex items-end justify-center gap-10 h-24">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <div
                                className="rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                                style={{ width: 28 + i * 4, height: 28 + i * 6 }}
                            />
                            <div className="h-2 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Section skeletons */}
            {[...Array(2)].map((_, si) => (
                <div key={si} className="mb-4">
                    <div className="flex items-center gap-2.5 mt-8 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-3 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="h-4 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 mb-5">
                            <div className="w-12 shrink-0 hidden lg:block" />
                            <div className="flex flex-col items-center pt-1.5">
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                                {i < 2 && <div className="w-px flex-1 mt-1.5 bg-zinc-100 dark:bg-zinc-800 min-h-[40px]" />}
                            </div>
                            <div className="flex-1 pb-5">
                                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2.5">
                                    <div className="h-4 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                                    <div className="h-3 w-1/3 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                                    <div className="flex gap-2 mt-1">
                                        <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                                        <div className="h-5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}