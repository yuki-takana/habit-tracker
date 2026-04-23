"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, X, ChevronRight, Loader2 } from "lucide-react";
import { saveUserPhone } from "@/app/action";
import { toast } from "sonner";

interface PhonePromptDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function PhonePromptDialog({ onClose, onSaved }: PhonePromptDialogProps) {
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const clean = phone.trim();
    if (!clean) return toast.error("Please enter your phone number");
    // Basic E.164 check
    if (!/^\+[1-9]\d{7,14}$/.test(clean)) {
      return toast.error("Use international format: +919876543210");
    }

    setLoading(true);
    try {
      await saveUserPhone(clean);
      toast.success("WhatsApp reminders enabled! 🎉");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed to save phone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm animate-in zoom-in-95 fade-in duration-300 ease-out">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-6 pb-8 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <X size={14} />
            </button>

            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-white" />
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">
              Enable WhatsApp Reminders
            </h2>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">
              Get notified on WhatsApp before your todos start so you never miss a beat.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Your WhatsApp Number
              </label>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-slate-50 dark:bg-zinc-800">
                <Phone size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  autoFocus
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                Format: +[country code][number] e.g. +919876543210
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Ignore
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    Save & Enable
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
