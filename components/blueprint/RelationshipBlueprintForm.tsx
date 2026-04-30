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
import { Sparkles, Users, HeartHandshake } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your relationship goal."),
    relationshipType: z.enum(["romantic", "family", "friendship", "professional", "social"]),
    currentChallenge: z.string().min(10, "Please describe the challenges you're facing."),
    introvertExtrovert: z.enum(["introvert", "extrovert", "ambivert"]),
    socialAnxiety: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function RelationshipBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            relationshipType: "romantic",
            currentChallenge: "",
            introvertExtrovert: "ambivert",
            socialAnxiety: false,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        setError(null)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    relationshipType: values.relationshipType,
                    currentChallenge: values.currentChallenge,
                    introvertExtrovert: values.introvertExtrovert,
                    socialAnxiety: values.socialAnxiety,
                }
            };

            const response = await fetch("/api/agents/relationships", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/relationships/${data.planId}`)
            } else {
                setError(data.message || "Relationship Specialist encountered an error.")
            }
        } catch (error) {
            console.error("Relationship Agent failed:", error)
            setError("Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto p-1 bg-gradient-to-br from-teal-600/20 via-border to-teal-600/10 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-teal-600/10 text-teal-600 shadow-inner">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">Relationship Specialist AI</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">Social intelligence engine. Improving every connection in your life.</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="relationshipType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Relationship Context</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-teal-600/50 rounded-xl">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="romantic">Romantic Partner</SelectItem>
                                                <SelectItem value="family">Family Members</SelectItem>
                                                <SelectItem value="friendship">Friendships</SelectItem>
                                                <SelectItem value="professional">Professional / Work</SelectItem>
                                                <SelectItem value="social">General Social / Networking</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="introvertExtrovert"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Temperament</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 focus:border-teal-600/50 rounded-xl">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="introvert">Introverted</SelectItem>
                                                <SelectItem value="extrovert">Extroverted</SelectItem>
                                                <SelectItem value="ambivert">Ambivert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="currentChallenge"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Current Social Challenges</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What's making things difficult? e.g. lack of communication, social anxiety, difficult conversations..."
                                            className="min-h-[100px] bg-muted/20 border-border/50 focus:border-teal-600/50 rounded-xl"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="socialAnxiety"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-bold tracking-tight">Social Anxiety?</FormLabel>
                                        <FormDescription className="text-xs">Tailor recommendations for social comfort.</FormDescription>
                                    </div>
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
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-teal-600 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Primary Connection Goal
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to improve communication with my partner and rebuild emotional intimacy."
                                            className="min-h-[120px] bg-teal-600/[0.02] border-teal-600/20 focus:border-teal-600 rounded-2xl"
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

                        <Button type="submit" className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-lg shadow-teal-600/20" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="pulse-dots" compact={true} className="mr-2" /> Architecting Connection Plan...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <HeartHandshake className="w-5 h-5" />
                                    Generate Relationship Blueprint
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

