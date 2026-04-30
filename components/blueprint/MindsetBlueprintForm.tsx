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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Brain, Shrink } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your mindset goal."),
    currentChallenges: z.string().min(10, "Please describe your current mental blocks."),
    meditationExp: z.enum(["none", "some", "regular"]),
    journaling: z.boolean(),
    therapyHistory: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function MindsetBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentChallenges: "",
            meditationExp: "none",
            journaling: false,
            therapyHistory: false,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    currentChallenges: values.currentChallenges,
                    meditationExp: values.meditationExp,
                    journaling: values.journaling,
                    therapyHistory: values.therapyHistory,
                }
            };

            const response = await fetch("/api/agents/mindset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/mindset/${data.planId}`)
            } else {
                setError(data.message || "Mindset Architect encountered an error.")
            }
        } catch (error) {
            console.error("Mindset Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-pink-600/20 via-border to-pink-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-pink-600/10 text-pink-600 shadow-inner">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Mindset Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Psychological re-engineering. Building mental resilience and confidence.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="currentChallenges"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Mental Blocks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What's holding you back? e.g. imposter syndrome, procrastination..."
                                            className="min-h-[100px] bg-muted/20 border-border/50 focus:border-pink-600/50 rounded-xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="meditationExp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Meditation Exp.</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-pink-600/50 rounded-xl">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="some">Some</SelectItem>
                                                <SelectItem value="regular">Regular</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="journaling"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-center gap-2 p-3 bg-muted/20 border border-border/50 rounded-xl">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Active Journaling?</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="therapyHistory"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-center gap-2 p-3 bg-muted/20 border border-border/50 rounded-xl">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Therapy Exp?</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-pink-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Mindset Transformation Goal
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to build absolute self-belief and stop fearing public failure."
                                            className="min-h-[120px] bg-pink-600/[0.02] border-pink-600/20 focus:border-pink-600 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl shadow-lg shadow-pink-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Growth Mindset...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Shrink className="w-5 h-5" />
                                    Generate Mindset Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

