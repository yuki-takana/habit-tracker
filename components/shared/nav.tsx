"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, LogOut, User as UserIcon, Settings, Phone, LayoutDashboard, Shield, Sun, Moon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { useTheme } from 'next-themes'
import { AuthModal } from '../auth/auth-modal'
import { useXp } from '../providers/xp-provider'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Nav = () => {
    const pathname = usePathname()
    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const [open, setOpen] = useState(false);
    const [isPro, setIsPro] = useState(false)
    const { xp, level } = useXp();
    const { data: session, status } = useSession()

    const isLoggedIn = status === "authenticated"
    const userInitials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || "U"

    useEffect(() => {
        if (!isLoggedIn) return

        const fetchPlanAndXp = async () => {
            try {
                const res = await fetch("/api/subscription/limits")
                if (res.ok) {
                    const data = await res.json()
                    setIsPro(data.isPro)
                }
            } catch (err) {
                console.error("Failed to fetch subscription:", err)
            }
        }

        fetchPlanAndXp()
    }, [isLoggedIn])

  // Hide nav on public profile pages (/[username])
  const KNOWN_ROUTES = ["/", "/dashboard", "/settings", "/signin", "/signup", "/habits", "/todos", "/insights", "/daily-goals", "/routines", "/challenges", "/admin", "/plans", "/leaderboard", "/privacy", "/terms"];
  const isUsername = pathname.split("/").length === 2 && !KNOWN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) && !pathname.startsWith("/api");
  if (isUsername) return null;

  const DASHBOARD_ROUTES = ["/dashboard", "/habits", "/todos", "/insights", "/daily-goals", "/routines", "/challenges", "/admin", "/plans", "/coding", "/journey", "/workouts", "/tasks", "/blueprint", "/billing"];
  const isDashboardRoute = DASHBOARD_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));
  const { theme, setTheme } = useTheme();

    return (
        <>
            <nav className={`fixed top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md ${isDashboardRoute ? 'hidden lg:block' : ''}`}>
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        UFL<span className="text-indigo-500">.</span>
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">


                        {isLoggedIn ? (
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                {isPro && (
                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                        PRO
                                    </span>
                                )}
                                <DropdownMenuTrigger asChild>
                                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 transition-all text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{session?.user?.name}</p>
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Lvl {level} ({xp} XP)
                                                </span>
                                            </div>
                                            <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">{session?.user?.email}</p>
                                            {session?.user?.phone && (
                                                <p className="text-[10px] leading-none text-indigo-500 font-medium pt-0.5">{session.user.phone}</p>
                                            )}
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setOpen(false)}>
                                        <Link
                                            href="/dashboard"
                                            className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/dashboard' ? 'text-indigo-500' : ''}`}
                                        >
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {session?.user?.email === "abhisheaurya@gmail.com" && (
                                        <DropdownMenuItem onClick={() => setOpen(false)}>
                                            <Link
                                                href="/admin"
                                                className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/admin' ? 'text-indigo-500' : ''}`}
                                            >
                                                <Shield className="mr-2 h-4 w-4" />
                                                <span>Admin Panel</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setOpen(false)}>
                                        <Link
                                            href="/settings"
                                            className={`flex items-center w-full hover:text-indigo-500 transition-colors ${pathname === '/settings' ? 'text-indigo-500' : ''}`}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Profile Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                        e.preventDefault();
                                        setTheme(theme === "dark" ? "light" : "dark");
                                    }} className="cursor-pointer">
                                        {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                        <span>Toggle Switch Theme</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 dark:text-red-400 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button
                                onClick={() => setIsAuthOpen(true)}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                            >
                                <LogIn size={16} />
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Auth Modal remains hidden until state is true */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    )
}

export default Nav