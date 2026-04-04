"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme()

    const handleThemeChange = (e: React.MouseEvent<HTMLButtonElement>) => {
        const currentTheme = theme === "system" ? systemTheme : theme;
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setTheme(newTheme)
            return
        }

        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2

        const targetX = window.innerWidth
        const targetY = window.innerHeight

        const endRadius = Math.hypot(
            Math.max(x, targetX - x),
            Math.max(y, targetY - y)
        )

        const transition = document.startViewTransition(() => {
            setTheme(newTheme)
        })

        transition.ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
            ]

            document.documentElement.animate(
                {
                    clipPath: clipPath
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)"
                }
            )
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeChange}
            className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all duration-300"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
