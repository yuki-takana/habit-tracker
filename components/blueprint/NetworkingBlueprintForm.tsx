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
import { Sparkles, Users, MessageSquare } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your networking objective."),
    targetIndustry: z.string().min(2, "Industry is required."),
    currentNetwork: z.string().optional(),
    preferredPlatforms: z.string().min(2, "Platform is required."),
})

type FormValues = z.infer<typeof formSchema>

export function NetworkingBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            targetIndustry: "",
            currentNetwork: "",
            preferredPlatforms: "LinkedIn",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    targetIndustry: values.targetIndustry,
                    currentNetwork: values.currentNetwork,
                    preferredPlatforms: values.preferredPlatforms.split(',').map(s => s.trim())
                }
            };

            const response = await fetch("/api/agents/networking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/networking/${data.planId}`)
            } else {
                setError(data.message || "The AI Architect encountered an error.")
            }
        } catch (error) {
            console.error("Networking Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-blue-500/20 via-border to-blue-500/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500 shadow-inner">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Networking Strategist AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Build a high-value professional network and master the art of outreach.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetIndustry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Target Industry</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Fintech, AI, Venture Capital" className="h-12 bg-muted/20 border-border/50 focus:border-blue-500/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preferredPlatforms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Platforms (comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. LinkedIn, Twitter, Coffee Chats" className="h-12 bg-muted/20 border-border/50 focus:border-blue-500/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="currentNetwork"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Network Status (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Example: I have 200 connections on LinkedIn but rare engagement with senior leaders."
                                            className="min-h-[100px] bg-muted/20 border-border/50 focus:border-blue-500/50 rounded-xl"
                                            {...field}
                                        />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Primary Networking Goal
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to build a network of 50+ Senior Devs in the Fintech sector within 30 days."
                                            className="min-h-[120px] bg-blue-500/[0.02] border-blue-500/20 focus:border-blue-500 rounded-2xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs italic">Specificity helps the AI create high-conversion outreach scripts.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Mapping Network...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Generate Networking Strategy
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

