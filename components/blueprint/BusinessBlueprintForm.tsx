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
import { Sparkles, Briefcase, TrendingUp } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your business goal."),
    idea: z.string().min(10, "Please describe your business idea in more detail."),
    targetMarket: z.string().min(2, "Target market is required."),
    revenueModel: z.string().min(2, "Revenue model is required."),
})

type FormValues = z.infer<typeof formSchema>

export function BusinessBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            idea: "",
            targetMarket: "",
            revenueModel: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    industry: values.targetMarket, // Mapping industry to targetMarket for architect
                    targetAudience: values.targetMarket,
                    revenueModel: values.revenueModel,
                    businessIdea: values.idea
                }
            };

            const response = await fetch("/api/agents/business", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/business/${data.planId}`)
            } else {
                setError(data.message || "Business Architect encountered an error.")
            }
        } catch (error) {
            console.error("Business Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-slate-800/20 via-border to-slate-800/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-800/10 text-slate-800 shadow-inner">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Business Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Engineered to turn ideas into profitable realities. Validating and scaling your venture.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="idea"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">The Business Idea</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your product or service in detail..."
                                            className="min-h-[100px] bg-muted/20 border-border/50 focus:border-slate-800/50 rounded-xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetMarket"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Target Market</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Gen Z, Small Businesses, Devs" className="h-12 bg-muted/20 border-border/50 focus:border-slate-800/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="revenueModel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Revenue Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. SaaS, Subscription, Ads" className="h-12 bg-muted/20 border-border/50 focus:border-slate-800/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Startup Objective
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to build and launch a niche job board and reach $1k MRR in 90 days."
                                            className="min-h-[120px] bg-slate-800/[0.02] border-slate-800/20 focus:border-slate-800 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-800/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Venture...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Generate Startup Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

