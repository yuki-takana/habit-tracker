"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Wallet, HandCoins, TrendingUp } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your income goal."),
    profession: z.string().min(2, "Profession is required."),
    skills: z.string().min(2, "List at least one skill."),
    currentIncome: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

export function IncomeBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            profession: "",
            skills: "",
            currentIncome: 0,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    profession: values.profession,
                    skills: values.skills.split(',').map(s => s.trim()),
                    currentIncome: values.currentIncome
                }
            };

            const response = await fetch("/api/agents/income", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/income/${data.planId}`)
            } else {
                setError(data.message || "Financial Strategist encountered an error.")
            }
        } catch (error) {
            console.error("Income Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-emerald-600/20 via-border to-emerald-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-600/10 text-emerald-600 shadow-inner">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Financial Strategist AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Expert 30-day income generation programming based on your skills and profession.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="profession"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <HandCoins className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Profession</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="e.g. Software Engineer" className="h-12 bg-muted/20 border-border/50 focus:border-emerald-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentIncome"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Monthly Income</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-emerald-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Core Skills</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. React, Writing, Sales (comma separated)" className="h-12 bg-muted/20 border-border/50 focus:border-emerald-600/50 rounded-xl" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Income Generation Goal
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Make an extra $2,000 this month through freelance web development."
                                            className="min-h-[120px] bg-emerald-600/[0.02] border-emerald-600/20 focus:border-emerald-600 rounded-2xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Revenue Plan...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <HandCoins className="w-5 h-5" />
                                    Generate Income Plan
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

