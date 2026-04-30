"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { Target, Calendar, Sparkles } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function ChallengeForm({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [focus, setFocus] = useState("");
    const [durationDays, setDurationDays] = useState("90");
    const [autoCreateTodos, setAutoCreateTodos] = useState(true);

    const handleSubmit = async (e: React.FormEvent | null, force = false) => {
        if (e) e.preventDefault();
        if (!title || !focus || !durationDays) return;

        setLoading(true);
        try {
            const res = await fetch("/api/challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    focus,
                    durationDays,
                    autoCreateTodos,
                    force,
                }),
            });

            if (res.ok) {
                toast.success(force ? "Challenge Replaced!" : "Challenge Deployed!");
                setTitle("");
                setFocus("");
                setDurationDays("90");
                if (onSuccess) onSuccess();
                router.refresh();
            } else if (res.status === 409) {
                const data = await res.json();
                toast.warning(data.message, {
                    action: {
                        label: "Replace",
                        onClick: () => handleSubmit(null, true),
                    },
                });
            } else {
                const data = await res.json();
                toast.error(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create challenge");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="text-indigo-500" size={32} />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight dark:text-white uppercase">Start a Challenge</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Define your focus and duration for this sprint.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Challenge Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., 90 Days of Code"
                            value={title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                            className="h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 focus:ring-indigo-500 font-bold"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="focus" className="text-xs font-black uppercase tracking-widest text-slate-400">Primary Focus</Label>
                            <Select value={focus} onValueChange={setFocus} required>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 font-bold">
                                    <SelectValue placeholder="Select Focus" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
                                    <SelectItem value="Code">Coding Architecture</SelectItem>
                                    <SelectItem value="Fitness">Physical Performance</SelectItem>
                                    <SelectItem value="Business">Income Blueprints</SelectItem>
                                    <SelectItem value="Learning">Skill Acquisition</SelectItem>
                                    <SelectItem value="Mindset">Mental Fortitude</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-xs font-black uppercase tracking-widest text-slate-400">Duration (Days)</Label>
                            <Select value={durationDays} onValueChange={setDurationDays} required>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 font-bold">
                                    <SelectValue placeholder="Select Duration" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
                                    <SelectItem value="30">30 Day Sprint</SelectItem>
                                    <SelectItem value="60">60 Day Grind</SelectItem>
                                    <SelectItem value="90">90 Day Transformation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-todo" className="text-sm font-bold text-slate-900 dark:text-white">Auto-create Todos</Label>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Deploy daily tasks automatically</p>
                        </div>
                        <Switch
                            id="auto-todo"
                            checked={autoCreateTodos}
                            onCheckedChange={setAutoCreateTodos}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <UflLoaderInline style="pulse-dots" compact={true} className="mr-2" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Target size={20} />
                                DEPLOY CHALLENGE
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

