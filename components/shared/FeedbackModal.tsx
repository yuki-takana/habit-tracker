"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { submitPlatformFeedback } from "@/app/actions/feedback";
import { toast } from "sonner";

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState("general");
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message) {
            toast.error("Please enter your feedback");
            return;
        }

        setLoading(true);
        try {
            await submitPlatformFeedback(message, rating, category);
            toast.success("Thank you for your feedback!");
            setMessage("");
            setRating(5);
            setCategory("general");
            onClose();
        } catch (error) {
            toast.error("Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                        <MessageSquarePlus className="w-6 h-6 text-indigo-500" /> Share Feedback
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        What do you think about the platform? Your thoughts help us build a better experience.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 outline-none text-zinc-900 dark:text-white"
                        >
                            <option value="general">General</option>
                            <option value="feature">Feature Request</option>
                            <option value="bug">Report a Bug</option>
                            <option value="praise">Praise</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Rating (1-5)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                                        rating >= star 
                                            ? "bg-indigo-500 text-white" 
                                            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Your Thoughts</label>
                        <textarea
                            rows={4}
                            placeholder="Tell us what's on your mind..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 outline-none text-zinc-900 dark:text-white resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit Feedback
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
