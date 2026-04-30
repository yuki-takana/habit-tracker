"use client"

import { UflLoader, UflLoaderInline, type LoaderStyle } from "@/components/ui/ufl-loader"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AnimatedGradient from "@/components/AnimatedGradient"

const variants: { style: LoaderStyle; label: string; desc: string; dark?: boolean }[] = [
    { style: "bounce", label: "Bounce", desc: "Staggered letter bounce + shimmer bar" },
    { style: "typewriter", label: "Typewriter", desc: "Types letters in, then deletes them" },
    { style: "glitch", label: "Glitch", desc: "RGB-split cyberpunk scanline flicker", dark: true },
    { style: "flip", label: "Flip", desc: "Departure board tile rotation", dark: true },
    { style: "glow", label: "Neon Glow", desc: "Letters pulse with expanding neon rings" },
    { style: "orbit", label: "Orbit", desc: "Dots orbit around the UFL text" },
    { style: "split", label: "Split", desc: "Letters fly apart and slam back together" },
    { style: "minimal-ring", label: "Minimal Ring", desc: "Sleek and classic gradient spinning ring" },
    { style: "pulse-dots", label: "Pulse Dots", desc: "Simple fading dots for minimal distraction" },
    { style: "ai-core", label: "AI Core", desc: "Futuristic pulsing core with rotating tech rings", dark: true },
    { style: "wave-bars", label: "Wave Bars", desc: "Minimalist vertical wave animation" },
]

export default function LoaderDemoPage() {
    const [fullscreen, setFullscreen] = useState<LoaderStyle | null>(null)

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <AnimatedGradient/>
            {fullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm gap-10">
                    <UflLoader style={fullscreen} variant="inline" text="Loading your data..." />
                    <Button variant="outline" onClick={() => setFullscreen(null)}>Close</Button>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                    <Badge variant="outline" className="text-xs tracking-widest uppercase font-semibold mb-4">UFL Loader Gallery</Badge>
                    <h1 className="text-4xl font-black tracking-tight">{variants.length} Loader Styles</h1>
                    <p className="text-muted-foreground">Click any card to preview it full-screen. Pick your favourite to roll out app-wide.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {variants.map(({ style, label, desc, dark }) => (
                        <button
                            key={style}
                            onClick={() => setFullscreen(style)}
                            className={`group flex flex-col items-center gap-6 p-8 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 text-left w-full
                                ${dark
                                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
                                    : "bg-card border-border hover:border-indigo-500/40"
                                }`}
                        >
                            {/* Preview */}
                            <div className="flex-1 flex items-center justify-center w-full min-h-32 pointer-events-none">
                                <UflLoaderInline style={style} className="py-0" />
                            </div>

                            {/* Info */}
                            <div className="w-full border-t border-border/40 pt-4 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className={`font-bold text-base ${dark ? "text-white" : "text-foreground"}`}>{label}</p>
                                    <Badge variant="secondary" className="text-[10px] font-mono opacity-70">{style}</Badge>
                                </div>
                                <p className={`text-xs leading-relaxed ${dark ? "text-zinc-400" : "text-muted-foreground"}`}>{desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="text-center pt-8 border-t border-border/40 space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Tell us which style you love — we'll set it as the default across the whole app.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {variants.map(({ style, label }) => (
                            <Button key={style} variant="outline" size="sm" onClick={() => setFullscreen(style)} className="text-xs">
                                Preview {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
