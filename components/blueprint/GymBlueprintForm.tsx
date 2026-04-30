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
import { Sparkles, Dumbbell, Activity, Info } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your fitness goal."),
    weight: z.coerce.number().min(30, "Please enter a valid weight."),
    height: z.coerce.number().min(100, "Please enter a valid height."),
    experience: z.enum(["beginner", "intermediate", "advanced"]),
})

type FormValues = z.infer<typeof formSchema>

export function GymBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            weight: 70,
            height: 175,
            experience: "beginner",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    weight: values.weight,
                    height: values.height,
                    experience: values.experience,
                }
            };

            const response = await fetch("/api/agents/gym", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/gym/${data.planId}`)
            } else {
                setError(data.message || "Gym Architect encountered an error.")
            }
        } catch (error) {
            console.error("Gym Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-red-600/20 via-border to-red-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-600/10 text-red-600 shadow-inner">
                        <Dumbbell className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Gym Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Senior Gym Trainer. Precision workouts tailored to your physiology.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Weight (KG)</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-red-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Height (CM)</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-red-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Fitness Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-red-600/50 rounded-xl">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate / Regular</SelectItem>
                                            <SelectItem value="advanced">Advanced / Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Primary Fitness Goal
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to lose 5kg of fat and build muscle definition in 2 months."
                                            className="min-h-[120px] bg-red-600/[0.02] border-red-600/20 focus:border-red-600 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Workout...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Generate Gym Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

