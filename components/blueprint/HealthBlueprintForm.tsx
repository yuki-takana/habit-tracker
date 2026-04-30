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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Heart, Activity } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your health goal."),
    age: z.coerce.number().min(5).max(120),
    currentWeight: z.coerce.number().min(20).max(300),
    existingIssues: z.string().optional(),
    dietPreference: z.enum(["veg", "non-veg", "vegan"]),
    sleepHours: z.coerce.number().min(1).max(24),
})

type FormValues = z.infer<typeof formSchema>

export function HealthBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            age: 25,
            currentWeight: 70,
            existingIssues: "",
            dietPreference: "veg",
            sleepHours: 7,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    age: values.age,
                    currentWeight: values.currentWeight,
                    existingIssues: values.existingIssues,
                    dietPreference: values.dietPreference,
                    sleepHours: values.sleepHours,
                }
            };

            const response = await fetch("/api/agents/health", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/health/${data.planId}`)
            } else {
                setError(data.message || "Failed to generate health plan.")
            }
        } catch (error) {
            console.error("Health Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-rose-500/20 via-border to-rose-500/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500 shadow-inner">
                        <Heart className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Health Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Personalized nutrition, sleep, and wellness programming for a vibrant life.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-rose-500/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentWeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Weight (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-rose-500/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sleepHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Avg. Sleep</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-rose-500/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dietPreference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Dietary Preference</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-rose-500/50 rounded-xl">
                                                    <SelectValue placeholder="Select diet" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="veg">Vegetarian</SelectItem>
                                                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                                <SelectItem value="vegan">Vegan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="existingIssues"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Existing Issues (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Back pain, Insulin resistance" className="h-12 bg-muted/20 border-border/50 focus:border-rose-500/50 rounded-xl" {...field} />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Health & Wellness Objective
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to improve my gut health and increase energy levels over the next 30 days."
                                            className="min-h-[120px] bg-rose-500/[0.02] border-rose-500/20 focus:border-rose-500 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg shadow-rose-500/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Wellness Plan...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Generate Health Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

