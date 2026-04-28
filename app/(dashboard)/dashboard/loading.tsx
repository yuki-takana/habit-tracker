
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 pt-24">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-zinc-800/60 animate-pulse" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse mt-4" />
      </div>
    </div>
  )
}