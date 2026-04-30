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
import { Sparkles, BriefcaseBusiness, GraduationCap, Clock, Building2 } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Describe your career goal briefly."),
    currentRole: z.string().min(2, "Current role is required."),
    targetRole: z.string().min(2, "Target role is required."),
    targetCompany: z.string().optional(),
    currentSkills: z.string().min(2, "List some skills."),
    yearsOfExperience: z.coerce.number().min(0),
    hoursPerWeek: z.coerce.number().min(1).max(100),
})

type FormValues = z.infer<typeof formSchema>

export function CareerBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentRole: "",
            targetRole: "",
            targetCompany: "",
            currentSkills: "",
            yearsOfExperience: 2,
            hoursPerWeek: 10,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    currentRole: values.currentRole,
                    targetRole: values.targetRole,
                    targetCompany: values.targetCompany,
                    currentSkills: values.currentSkills.split(',').map(s => s.trim()),
                    yearsOfExperience: values.yearsOfExperience,
                    hoursPerWeek: values.hoursPerWeek
                }
            };

            const response = await fetch("/api/agents/career", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/career/${data.planId}`)
            } else {
                setError(data.message || "Career Architect encountered an error.")
            }
        } catch (error) {
            console.error("Career Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-linear-to-br from-amber-600/20 via-border to-amber-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-600/10 text-amber-600 shadow-inner">
                        <BriefcaseBusiness className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Career Mentor AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Architect a step-by-step roadmap to transition from your current position to your dream role.</p>
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Role</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Graphic Designer" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targetRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Target Role</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. UI/UX Product Designer" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="targetCompany"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Dream Company</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="e.g. Stripe, Google" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearsOfExperience"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Years Exp.</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Hours/Week</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="currentSkills"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Skills</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. React, Figma, Communication (comma separated)" className="h-12 bg-muted/20 border-border/50 focus:border-amber-600/50 rounded-xl" {...field} />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Transition Objective
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to transition from print design to digital product design and land a junior role at a fintech startup within 6 months."
                                            className="min-h-[120px] bg-amber-600/[0.02] border-amber-600/20 focus:border-amber-600 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg shadow-amber-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Mapping Career Leap...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Generate Career Roadmap
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

