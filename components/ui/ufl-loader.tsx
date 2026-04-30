"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

/* ─────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────── */
const CHARS = ["U", "F", "L"]

/* ─────────────────────────────────────────────────────
   1. BOUNCE — staggered bounce + gradient shimmer bar
───────────────────────────────────────────────────── */
export function BounceLoader({ text }: { text?: string }) {
    const colors = ["from-indigo-500 to-violet-500", "from-violet-500 to-pink-500", "from-pink-500 to-indigo-500"]
    return (
        <div className="flex flex-col items-center gap-5">
            <motion.div
                className="flex items-end gap-1"
                animate="animate"
                initial="initial"
                variants={{
                    animate: {
                        transition: { staggerChildren: 0.18, repeat: Infinity, repeatDelay: 0.6 }
                    }
                }}
            >
                {CHARS.map((c, i) => (
                    <motion.span
                        key={c}
                        variants={{
                            initial: { y: 0, scale: 1, opacity: 0.4 },
                            animate: { y: [-14, 0, -5, 0], scale: [1, 1.3, 1.05, 1], opacity: [0.4, 1, 1, 0.4], transition: { duration: 0.7, ease: "easeInOut" } }
                        }}
                        className={cn("text-5xl font-black tracking-tighter select-none bg-gradient-to-br bg-clip-text text-transparent", colors[i])}
                    >{c}</motion.span>
                ))}
                <motion.span
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl font-black text-indigo-500 leading-none mb-0.5 select-none"
                >.</motion.span>
            </motion.div>
            <div className="relative w-40 h-1 rounded-full bg-indigo-500/10 overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500"
                    animate={{ x: [-96, 160] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   2. TYPEWRITER — letters type in, cursor blinks, then reset
───────────────────────────────────────────────────── */
export function TypewriterLoader({ text }: { text?: string }) {
    const [visible, setVisible] = useState(0)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        let t: ReturnType<typeof setTimeout>
        if (!deleting && visible < CHARS.length) {
            t = setTimeout(() => setVisible(v => v + 1), 260)
        } else if (!deleting && visible === CHARS.length) {
            t = setTimeout(() => setDeleting(true), 900)
        } else if (deleting && visible > 0) {
            t = setTimeout(() => setVisible(v => v - 1), 160)
        } else if (deleting && visible === 0) {
            t = setTimeout(() => setDeleting(false), 400)
        }
        return () => clearTimeout(t)
    }, [visible, deleting])

    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-1 h-16">
                <AnimatePresence mode="popLayout">
                    {CHARS.slice(0, visible).map((c, i) => (
                        <motion.span
                            key={c + i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="text-5xl font-black tracking-tighter text-foreground select-none"
                        >{c}</motion.span>
                    ))}
                </AnimatePresence>
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="w-[3px] h-10 rounded-full bg-indigo-500 ml-0.5 shrink-0"
                />
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   3. GLITCH — cyberpunk RGB-split flicker
───────────────────────────────────────────────────── */
export function GlitchLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative select-none">
                {/* Red offset */}
                <motion.span
                    className="absolute inset-0 text-5xl font-black tracking-tighter text-red-500/70 pointer-events-none"
                    animate={{ x: [-3, 3, -2, 0, -3, 0], y: [1, -1, 2, 0, 0, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.5, 1] }}
                >UFL</motion.span>
                {/* Blue offset */}
                <motion.span
                    className="absolute inset-0 text-5xl font-black tracking-tighter text-blue-500/70 pointer-events-none"
                    animate={{ x: [3, -2, 3, 0, 2, 0], y: [-1, 2, -1, 0, 0, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.5, 1] }}
                >UFL</motion.span>
                {/* Main */}
                <motion.span
                    className="relative text-5xl font-black tracking-tighter text-foreground"
                    animate={{ opacity: [1, 0.85, 1, 0.9, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                >UFL</motion.span>

                {/* Scanline flicker */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
                />
            </div>
            {text && (
                <motion.p
                    animate={{ opacity: [0.3, 1, 0.3], x: [0, -1, 1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="text-xs font-mono text-green-500 tracking-widest uppercase"
                >{text}</motion.p>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   4. FLIP — departure board / scoreboard tile flip
───────────────────────────────────────────────────── */
const FLIP_SEQUENCE = ["U", "F", "L", "U", "F", "L"]

export function FlipLoader({ text, compact = false }: { text?: string; compact?: boolean }) {
    return (
        <div className={cn("flex flex-col items-center", compact ? "gap-0" : "gap-5")}>
            <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-2")}>
                {CHARS.map((finalChar, ci) => {
                    return (
                        <div
                            key={ci}
                            className={cn(
                                "relative rounded overflow-hidden bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 shadow flex items-center justify-center",
                                compact ? "w-4 h-5" : "w-14 h-16 rounded-lg shadow-lg border-zinc-700"
                            )}
                        >
                            <motion.div
                                className={cn("font-black text-white select-none", compact ? "text-[10px]" : "text-4xl")}
                                animate={{ opacity: [0, 1] }}
                                transition={{ delay: ci * 0.4, duration: 0.05, repeat: Infinity, repeatDelay: 3, repeatType: "loop" }}
                            >
                                <motion.span
                                    key={ci}
                                    animate={{ rotateX: [0, -90, 0] }}
                                    transition={{ delay: ci * 0.35, duration: 0.35, repeat: Infinity, repeatDelay: 2.8, ease: "easeIn" }}
                                    style={{ display: "block", transformOrigin: "center" }}
                                    className="inline-block"
                                >
                                    {finalChar}
                                </motion.span>
                            </motion.div>
                            {/* Fold line */}
                            <div className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
                        </div>
                    )
                })}
            </div>
            {text && !compact && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   5. GLOW PULSE — neon letters breathe with color rings
───────────────────────────────────────────────────── */
export function GlowLoader({ text }: { text?: string }) {
    const glowColors = [
        { text: "text-indigo-500", shadow: "0 0 20px rgba(99,102,241,0.8), 0 0 60px rgba(99,102,241,0.4)" },
        { text: "text-violet-500", shadow: "0 0 20px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.4)" },
        { text: "text-pink-500", shadow: "0 0 20px rgba(236,72,153,0.8), 0 0 60px rgba(236,72,153,0.4)" },
    ]
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-1">
                {CHARS.map((c, i) => (
                    <motion.span
                        key={c}
                        className={cn("text-5xl font-black tracking-tighter select-none", glowColors[i].text)}
                        animate={{
                            textShadow: [
                                "0 0 0px transparent",
                                glowColors[i].shadow,
                                "0 0 0px transparent",
                            ],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut",
                        }}
                    >{c}</motion.span>
                ))}
            </div>
            {/* Pulsing ring */}
            <div className="relative flex items-center justify-center">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-indigo-500/40"
                        animate={{ scale: [0.4, 2.2], opacity: [0.8, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                        style={{ width: 32, height: 32 }}
                    />
                ))}
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   6. ORBIT — dots rotating around the UFL text
───────────────────────────────────────────────────── */
export function OrbitLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center w-36 h-24">
                {/* Center text */}
                <span className="text-4xl font-black tracking-tighter text-foreground select-none z-10">UFL</span>

                {/* Orbiting dots */}
                {[0, 1, 2, 3].map((i) => {
                    const dotColors = ["bg-indigo-500", "bg-violet-500", "bg-pink-500", "bg-indigo-400"]
                    return (
                        <motion.div
                            key={i}
                            className="absolute"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: -i * 0.6 }}
                            style={{ width: "100%", height: "100%", top: 0, left: 0 }}
                        >
                            <div
                                className={cn("w-2.5 h-2.5 rounded-full absolute top-0", dotColors[i])}
                                style={{ left: "50%", transform: "translateX(-50%)" }}
                            />
                        </motion.div>
                    )
                })}

                {/* Ellipse track */}
                <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 dark:border-zinc-700 opacity-50" />
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   7. SPLIT — letters fly apart then slam back together
───────────────────────────────────────────────────── */
export function SplitLoader({ text }: { text?: string }) {
    const offsets = [-60, 0, 60]
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center h-16 w-48 overflow-visible">
                {CHARS.map((c, i) => (
                    <motion.span
                        key={c}
                        className="absolute text-5xl font-black tracking-tighter text-foreground select-none"
                        animate={{
                            x: [offsets[i], 0, offsets[i]],
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0,
                        }}
                    >{c}</motion.span>
                ))}
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   8. MINIMAL RING — sleek gradient spinner ring
───────────────────────────────────────────────────── */
export function MinimalRingLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <motion.div
                className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-zinc-800 border-t-indigo-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   9. PULSE DOTS — minimal fading dots
───────────────────────────────────────────────────── */
export function PulseDotsLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2 h-12">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-indigo-500"
                        animate={{ scale: [1, 0.5, 1], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    />
                ))}
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   10. AI CORE — futuristic AI pulsing core with spinning ring
───────────────────────────────────────────────────── */
export function AiCoreLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center w-16 h-16">
                {/* Core */}
                <motion.div
                    className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Spinning ring 1 */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                {/* Spinning ring 2 */}
                <motion.div
                    className="absolute inset-2 rounded-full border border-t-transparent border-violet-500"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   11. WAVE BARS — minimalist vertical bars
───────────────────────────────────────────────────── */
export function WaveBarsLoader({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-1.5 h-12">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 rounded-full bg-indigo-500"
                        animate={{ height: ["12px", "32px", "12px"] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                    />
                ))}
            </div>
            {text && <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase animate-pulse">{text}</p>}
        </div>
    )
}

/* ─────────────────────────────────────────────────────
   Master export — UflLoader with `style` prop
───────────────────────────────────────────────────── */
export type LoaderStyle = "bounce" | "typewriter" | "glitch" | "flip" | "glow" | "orbit" | "split" | "minimal-ring" | "pulse-dots" | "ai-core" | "wave-bars"

function LoaderInner({ style = "bounce", text, compact = false }: { style: LoaderStyle; text?: string; compact?: boolean }) {
    switch (style) {
        case "typewriter": return <TypewriterLoader text={text} />
        case "glitch": return <GlitchLoader text={text} />
        case "flip": return <FlipLoader text={text} compact={compact} />
        case "glow": return <GlowLoader text={text} />
        case "orbit": return <OrbitLoader text={text} />
        case "split": return <SplitLoader text={text} />
        case "minimal-ring": return <MinimalRingLoader text={text} />
        case "pulse-dots": return <PulseDotsLoader text={text} />
        case "ai-core": return <AiCoreLoader text={text} />
        case "wave-bars": return <WaveBarsLoader text={text} />
        default: return <BounceLoader text={text} />
    }
}

export type UflLoaderProps = {
    style?: LoaderStyle
    variant?: "full" | "inline"
    text?: string
    className?: string
    compact?: boolean
}

export function UflLoader({ style = "bounce", variant = "full", text, className, compact = false }: UflLoaderProps) {
    const inner = (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <LoaderInner style={style} text={text} compact={compact} />
        </div>
    )
    if (variant === "inline") return inner
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            {inner}
        </div>
    )
}

/** Inline convenience wrapper — use like <UflLoaderInline /> to replace Loader2 spinners */
export function UflLoaderInline({ style = "bounce", text, className, compact = false }: Omit<UflLoaderProps, "variant">) {
    if (compact) {
        return <Loader2 className={cn("animate-spin", className)} />
    }
    return <UflLoader style={style} variant="inline" text={text} className={cn(!compact && "py-16", className)} compact={compact} />
}
