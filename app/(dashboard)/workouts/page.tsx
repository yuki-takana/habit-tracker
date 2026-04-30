"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, ChevronRight, Dumbbell, Sparkles, Trash } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"
import Link from "next/link"

export default function WorkoutHub() {
    const [plans, setPlans] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)


    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/workout-plans')
            const data = await response.json()
            if (data.success) {
                setPlans(data.plans)
            }
        } catch (error) {
            console.error("Failed to fetch plans:", error)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {

        fetchPlans()
    }, [])

    const handleDelete = async (id: string) => {

        setPlans(prev => prev.filter(plan => plan.id !== id));

        try {
            const res = await fetch(`/api/workout-plans/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Delete failed");
            }

        } catch (error) {
            console.error(error);

            fetchPlans()
        }
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <UflLoaderInline style="pulse-dots" text="Loading your workouts..." />
                <p className="text-muted-foreground animate-pulse">Loading your fitness blueprints...</p>
            </div>
        )
    }

    return (
        <div className=" space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                        Workout Blueprints
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your AI-architected training routines.
                    </p>
                </div>
                <Link href="/blueprint/gym/new">
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create New Plan
                    </Button>
                </Link>
            </div>

            {plans.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/50 py-20">
                    <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Dumbbell className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">No active plans found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                You haven't generated any workout plans yet. Let our AI Coach build one for you.
                            </p>
                        </div>
                        <Link href="/blueprint/gym/new">
                            <Button variant="outline" className="mt-4">
                                Get Started
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-primary/5">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={plan.isActive ? "default" : "secondary"}>
                                            {plan.isActive ? "Active" : "Archived"}
                                        </Badge>
                                        <div className="flex gap-2" >
                                            <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform" >

                                                <Trash onClick={() => handleDelete(plan.id)} className="w-5 h-5 text-destructive" />

                                            </div>
                                            <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">

                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl line-clamp-1">{plan.goal}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        Week {plan.weekNumber}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Dumbbell className="w-4 h-4" />
                                            <span>{plan._count.workouts} Workouts</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className=" pt-4">
                                    <Link href={`/workouts/${plan.id}`} className="w-full">
                                        <Button className="w-full transition-all">
                                            View Details
                                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                                {/* Decorative gradient accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

