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
import { Sparkles, Layout, Code2, Clock } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    projectDescription: z.string().min(20, "Please describe your project in more detail."),
    techStack: z.string().min(2, "What technologies would you like to use?"),
    experience: z.enum(["beginner", "intermediate", "advanced"]),
    hoursPerDay: z.coerce.number().min(1).max(24),
})

type FormValues = z.infer<typeof formSchema>

export function ProjectBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            projectDescription: "",
            techStack: "",
            experience: "intermediate",
            hoursPerDay: 4,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                projectDescription: values.projectDescription,
                context: {
                    techStack: values.techStack,
                    experience: values.experience,
                    hoursPerDay: values.hoursPerDay,
                }
            };

            const response = await fetch("/api/agents/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            console.log("Project Agent response:", data)
            if (data.success && data.planId) {
                router.push(`/blueprint/project/${data.planId}`)
            } else {
                setError(data.message || "Project Architect encountered an error.")
            }
        } catch (error) {
            console.error("Project Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-blue-600/20 via-border to-blue-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-600/10 text-blue-600 shadow-inner">
                        <Layout className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Project Architect AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Senior Project Manager. Engineering timelines for your shipping success.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="projectDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Project Vision & Scope</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What are you building? List core features and the main problem it solves..."
                                            className="min-h-[120px] bg-muted/20 border-border/50 focus:border-blue-600/50 rounded-xl"
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
                                name="techStack"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Preferred Tech Stack</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="e.g. Next.js, FastAPI, Prisma, Tailwind" className="h-12 bg-muted/20 border-border/50 focus:border-blue-600/50 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Hours per Day</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input type="number" className="h-12 bg-muted/20 border-border/50 focus:border-blue-600/50 rounded-xl" {...field} />
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Developer Experience</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-blue-600/50 rounded-xl">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner / Learner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate / Capable</SelectItem>
                                            <SelectItem value="advanced">Advanced / Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-center text-destructive text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Engineering Plan...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Generate Project Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

