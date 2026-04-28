"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { generateAiRoutine } from "@/app/actions/ai-routine";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RoutinePromptDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [focus, setFocus] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAiGenerate = async () => {
        setLoading(true);
        try {
            await generateAiRoutine(focus || "general productivity and health");
            toast.success("AI generated your routine!");
            onClose();
        } catch (error) {
            toast.error("Failed to generate routine");
        } finally {
            setLoading(false);
        }
    };

    const handleManualCreate = () => {
        onClose();
        router.push("/routines");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                        <Calendar className="w-6 h-6 text-indigo-500" /> Create Your Routine
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        You don't have an active routine. We can build one for you based on your goals, or you can create it manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Focus Area (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Deep work, learning, health"
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 outline-none text-zinc-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <Button 
                        onClick={handleAiGenerate} 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl text-md flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Let AI Create Routine
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleManualCreate} 
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-bold border-2 border-zinc-200 dark:border-zinc-800"
                    >
                        Create Manually
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
