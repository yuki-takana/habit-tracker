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
import { Sparkles, GraduationCap, BookOpen } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about what you want to learn."),
    currentLevel: z.enum(["beginner", "intermediate", "advanced"]),
    hoursPerDay: z.coerce.number().min(0.5).max(16),
    preferredStyle: z.enum(["video", "reading", "projects", "mixed"]),
    existingSkills: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function LearningBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentLevel: "beginner",
            hoursPerDay: 2,
            preferredStyle: "mixed",
            existingSkills: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    currentLevel: values.currentLevel,
                    hoursPerDay: values.hoursPerDay,
                    preferredStyle: values.preferredStyle,
                    existingSkills: values.existingSkills ? values.existingSkills.split(',').map(s => s.trim()) : []
                }
            };

            const response = await fetch("/api/agents/learning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/learning/${data.planId}`)
            } else {
                setError(data.message || "Learning Architect encountered an error.")
            }
        } catch (error) {
            console.error("Learning Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-orange-600/20 via-border to-orange-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-orange-600/10 text-orange-600 shadow-inner">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Learning Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Expert skill acquisition logic. Accelerated learning paths for any domain.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Skill Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-orange-600/50 rounded-xl">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Daily Hours Commitment</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" className="h-12 bg-muted/20 border-border/50 focus:border-orange-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="preferredStyle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Learning Style</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-orange-600/50 rounded-xl">
                                                    <SelectValue placeholder="Select style" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="video">Video Courses</SelectItem>
                                                <SelectItem value="reading">Books/Articles</SelectItem>
                                                <SelectItem value="projects">Practical Projects</SelectItem>
                                                <SelectItem value="mixed">Mixed Approach</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="existingSkills"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Related Skills You Have</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. basic HTML, Python" className="h-12 bg-muted/20 border-border/50 focus:border-orange-600/50 rounded-xl" {...field} />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        The Mastery Objective
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Master React and Next.js sufficiently to build a SaaS product."
                                            className="min-h-[120px] bg-orange-600/[0.02] border-orange-600/20 focus:border-orange-600 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-lg shadow-orange-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Learning Path...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Generate Learning Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

