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
import { Sparkles, LucideIcon, PlusCircle, CalendarDays } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import { motion } from "framer-motion"

const baseSchema = z.object({
    goal: z.string().min(10, "Please provide more detail about your goal."),
})

interface BlueprintField {
    name: string;
    label: string;
    placeholder?: string;
    type: "text" | "number" | "textarea";
    description?: string;
}

interface BlueprintFormProps {
    domain: string;
    title: string;
    description: string;
    icon: LucideIcon;
    colorClass: string;
    fields: BlueprintField[];
}

export function BlueprintForm({ domain, title, description, icon: Icon, colorClass, fields }: BlueprintFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Dynamically build the schema based on fields
    const dynamicFieldsSchema = fields.reduce((acc, field) => {
        if (field.type === "number") {
            acc[field.name] = z.coerce.number().min(0);
        } else {
            acc[field.name] = z.string().min(2, `${field.label} is required.`);
        }
        return acc;
    }, {} as any);

    const fullSchema = baseSchema.extend(dynamicFieldsSchema);
    type FormValues = z.infer<typeof fullSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            goal: "",
            ...fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === "number" ? 0 : "" }), {})
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        setError(null);
        try {
            const { goal, ...context } = values;

            // Map the API endpoint correctly
            const apiEndpoint = domain === "Gym" ? "gym" :
                domain === "Networking" ? "networking" :
                    domain === "Income" ? "income" :
                        domain === "Project" ? "project" :
                            domain === "Career" ? "career" :
                                domain.toLowerCase();

            const response = await fetch(`/api/agents/${apiEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userGoal: goal, context }),
            })

            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/${apiEndpoint}/${data.planId}`)
            } else {
                setError(data.message || "The AI Architect hit a wall. Please try slightly modifying your goal.");
            }
        } catch (err) {
            console.error("Agent failed:", err)
            setError("Connection lost. Please check your internet and try again.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-1 bg-gradient-to-br from-border/50 via-border/20 to-border/50 rounded-3xl"
        >
            <div className="bg-card p-8 md:p-10 rounded-[1.4rem] shadow-2xl space-y-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 ${colorClass} shadow-inner`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-heading">{title}</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            {fields.map((field) => (
                                <FormField
                                    key={field.name}
                                    control={form.control}
                                    name={field.name as any}
                                    render={({ field: fieldProps }) => {
                                        const { ref, value, ...restFieldProps } = fieldProps;
                                        const safeValue = (value as string) ?? "";
                                        return (
                                            <FormItem className={field.type === "textarea" ? "md:col-span-2" : ""}>
                                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                                    <PlusCircle className="w-3 h-3" />
                                                    {field.label}
                                                </FormLabel>
                                                <FormControl>
                                                    {field.type === "textarea" ? (
                                                        <Textarea
                                                            placeholder={field.placeholder}
                                                            className="min-h-[120px] bg-muted/20 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all rounded-xl"
                                                            value={safeValue}
                                                            {...restFieldProps}
                                                        />
                                                    ) : (
                                                        <Input
                                                            type={field.type}
                                                            placeholder={field.placeholder}
                                                            className="h-12 bg-muted/20 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all rounded-xl"
                                                            value={safeValue}
                                                            {...restFieldProps}
                                                        />
                                                    )}
                                                </FormControl>
                                                {field.description && <FormDescription className="text-xs">{field.description}</FormDescription>}
                                                <FormMessage className="text-xs font-medium" />
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                        </div>

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => {
                                const { ref, value, ...restField } = field;
                                return (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            The Master Objective
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Example: I want to build a professional network of 50+ Senior Devs and Tech Leads in the Fintech sector within 30 days."
                                                className="min-h-[150px] bg-primary/[0.02] border-primary/20 focus:border-primary focus:bg-background transition-all text-lg rounded-2xl shadow-sm"
                                                value={(value as string) ?? ""}
                                                {...restField}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs italic text-muted-foreground/70">
                                            Pro-tip: Agents perform 40% better when you include specific numbers and dates.
                                        </FormDescription>
                                        <FormMessage className="text-xs font-medium" />
                                    </FormItem>
                                )
                            }}
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-center text-destructive text-sm font-semibold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-16 text-xl font-black shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-2xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <UflLoaderInline style="pulse-dots" compact={true} className="w-6 h-6" />
                                        <span>Architecting Your Future...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-3">
                                        <Sparkles className="w-6 h-6 fill-current" />
                                        <span>GENERATE MY BLUEPRINT</span>
                                    </span>
                                )}
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em] font-bold">
                                Powered by Ultra-Fast Latency Architect 3.0
                            </p>
                        </div>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}
