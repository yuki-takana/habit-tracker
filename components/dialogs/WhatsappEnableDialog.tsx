"use client";

import React, { useState } from "react";
import { MessageCircle, X, BellRing, Loader2 } from "lucide-react";
import { toggleWhatsapp } from "@/app/action";
import { toast } from "sonner";

interface WhatsappEnableDialogProps {
  onClose: () => void;
  onEnabled: () => void;
}

export default function WhatsappEnableDialog({ onClose, onEnabled }: WhatsappEnableDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await toggleWhatsapp(true);
      toast.success("WhatsApp reminders enabled! ✅");
      onEnabled();
    } catch (e: any) {
      toast.error(e.message || "Failed to enable");
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
          {/* Header */}
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 px-6 pt-6 pb-8 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

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
              WhatsApp Reminders are Off
            </h2>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">
              You have a phone number saved. Turn on WhatsApp reminders to get notified before your todos start.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Benefits */}
            <ul className="space-y-2 mb-5">
              {[
                "Get reminded 5 min before your todo starts",
                "Deadline alerts before tasks expire",
                "Works even when the app is closed",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <BellRing size={13} className="text-emerald-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Enable Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
