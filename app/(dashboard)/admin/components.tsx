import React from 'react'
import { cn } from '@/lib/utils'

export function Badge({
    children,
    variant = 'accent',
}: {
    children: React.ReactNode
    variant?: 'accent' | 'green' | 'amber' | 'red'
}) {
    const cls: Record<string, string> = {
        accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-400/30',
        green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/30',
        amber: 'bg-amber-500/10  text-amber-700  dark:text-amber-400  border-amber-400/30',
        red: 'bg-red-500/10    text-red-700    dark:text-red-400    border-red-400/30',
    }
    return (
        <span className={cn(
            'inline-flex items-center border rounded px-2 py-0.5',
            'text-[10px] font-semibold tracking-wide font-mono',
            cls[variant],
        )}>
            {children}
        </span>
    )
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
            {children}
        </div>
    )
}

export function PanelHeader({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {title}
            </span>
            {right}
        </div>
    )
}

export function StatCard({
    label, value, delta, accent,
}: {
    label: string; value: string | number; delta?: string; accent?: boolean
}) {
    return (
        <div className={cn(
            'rounded-xl border p-4',
            accent
                ? 'bg-indigo-500/[0.06] border-indigo-400/20'
                : 'bg-card border-border',
        )}>
            <p className={cn(
                'text-[10px] font-semibold tracking-widest uppercase mb-1.5',
                accent ? 'text-indigo-500/80' : 'text-muted-foreground',
            )}>
                {label}
            </p>
            <p className={cn(
                'text-2xl font-semibold tracking-tight font-mono',
                accent
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-foreground',
            )}>
                {value}
            </p>
            {delta && (
                <p className={cn(
                    'text-[11px] mt-1',
                    accent
                        ? 'text-indigo-500 dark:text-indigo-400'
                        : 'text-emerald-600 dark:text-emerald-400',
                )}>
                    {delta}
                </p>
            )}
        </div>
    )
}

export function FieldInput({
    label, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                {label}
            </label>
            <input
                className={cn(
                    'h-9 rounded-md border border-border bg-background',
                    'px-3 text-[13px] text-foreground font-mono',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50',
                    'transition-colors disabled:opacity-40',
                )}
                {...props}
            />
        </div>
    )
}

export function PillGroup<T extends string>({
    options, value, onChange,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {options.map(o => (
                <button
                    key={o.id}
                    type="button"
                    onClick={() => onChange(o.id)}
                    className={cn(
                        'text-[11px] font-mono px-2.5 py-1 rounded border transition-all',
                        value === o.id
                            ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-600 dark:text-indigo-300'
                            : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    )
}

export function ActionButton({
    children, onClick, disabled, className,
}: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex items-center justify-center gap-2',
                'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700',
                'disabled:opacity-50 text-white text-[13px] font-medium',
                'px-4 py-2 rounded-lg transition-colors',
                className,
            )}
        >
            {children}
        </button>
    )
}
