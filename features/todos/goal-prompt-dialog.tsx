"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Loader2 } from "lucide-react";
import { saveUserGoal } from "@/app/actions/user-goals";
import { toast } from "sonner";

export function GoalPromptDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [goal, setGoal] = useState("");
    const [domain, setDomain] = useState("life");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!goal) {
            toast.error("Please enter a goal");
            return;
        }

        setLoading(true);
        try {
            await saveUserGoal(goal, domain);
            toast.success("Goal saved successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to save goal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                        <Target className="w-6 h-6 text-indigo-500" /> Set Your Life Goal
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        What do you want to achieve? This will guide your daily routine and tasks.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Your Goal</label>
                        <input
                            type="text"
                            placeholder="e.g., Become a Senior Developer"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 outline-none text-zinc-900 dark:text-white"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Domain</label>
                        <select
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 outline-none text-zinc-900 dark:text-white"
                        >
                            <option value="life">Life</option>
                            <option value="career">Career</option>
                            <option value="income">Income</option>
                            <option value="fitness">Fitness</option>
                            <option value="startup">Startup</option>
                            <option value="productivity">Productivity</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Maybe Later
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Goal
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
