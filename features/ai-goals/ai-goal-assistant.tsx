"use client"

import { useState } from "react";
import { Sparkles, X, Target, Briefcase, Calendar, Wand2, CheckCircle2 } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { motion, AnimatePresence } from "framer-motion";
import { generateGoalTasks, addAiTasksToTodos } from "@/app/actions/ai-goals";
import { SuggestionList } from "./suggestion-list";
import { toast } from "sonner";

export function AiGoalAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState<'form' | 'loading' | 'results' | 'success'>('form');
    const [formData, setFormData] = useState({ goal: '', situation: '', timeline: '' });
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        try {
            const result = await generateGoalTasks(formData.goal, formData.situation, formData.timeline);
            setSuggestions(result);
            setStep('results');
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
            setStep('form');
        }
    };

    const handleAddTasks = async (selectedTasks: any[]) => {
        try {
            await addAiTasksToTodos(selectedTasks);
            setStep('success');
            setTimeout(() => {
                onClose();
                // Reset for next time
                setTimeout(() => {
                    setStep('form');
                    setFormData({ goal: '', situation: '', timeline: '' });
                }, 500);
            }, 2000);
        } catch (error) {
            toast.error("Failed to add tasks");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Sparkles className="text-white fill-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Goal Strategist</h2>
                                    <p className="text-indigo-100/80 text-sm font-medium">Powered by Gemini AI</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 'form' && (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                                <Target size={16} className="text-indigo-500" />
                                                WHAT IS YOUR GOAL?
                                            </label>
                                            <textarea
                                                required
                                                placeholder="e.g., Get a job as a Frontend Developer"
                                                value={formData.goal}
                                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                                className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none min-h-[120px] resize-none text-slate-900 dark:text-white font-medium"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                                    <Briefcase size={16} className="text-indigo-500" />
                                                    CURRENT STATUS
                                                </label>
                                                <input
                                                    required
                                                    placeholder="e.g., Working in sales"
                                                    value={formData.situation}
                                                    onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-slate-900 dark:text-white font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                                    <Calendar size={16} className="text-indigo-500" />
                                                    TIMELINE
                                                </label>
                                                <input
                                                    required
                                                    placeholder="e.g., 3 months"
                                                    value={formData.timeline}
                                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 transition-all outline-none text-slate-900 dark:text-white font-medium"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                                        >
                                            <Wand2 size={24} />
                                            GENERATE STRATEGY
                                        </button>
                                    </motion.form>
                                )}

                                {step === 'loading' && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="py-12 flex flex-col items-center justify-center text-center"
                                    >
                                        <UflLoaderInline style="pulse-dots" text="Architecting your destiny..." />
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 italic">Architecting your path...</h3>
                                        <p className="text-slate-500 max-w-xs font-medium">Gemini is analyzing your situation and creating the perfect roadmap.</p>
                                    </motion.div>
                                )}

                                {step === 'results' && (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <SuggestionList
                                            suggestions={suggestions}
                                            onAddSelected={handleAddTasks}
                                        />
                                    </motion.div>
                                )}

                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                                            <CheckCircle2 size={56} className="text-green-500" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">ROADMAP ACTIVE!</h3>
                                        <p className="text-slate-500 font-medium tracking-tight">Your new strategy has been integrated into your Daily Focus.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

