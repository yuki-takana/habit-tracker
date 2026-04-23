"use client";
import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

// ─── localStorage keys ────────────────────────────────────────────
const LS_DISMISSED = "pwa-prompt-dismissed-until"; // timestamp
const LS_INSTALLED = "pwa-installed";              // "true"
const DISMISS_DAYS = 14;                           // re-show after 14 days

// ─── helpers ─────────────────────────────────────────────────────
function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // Android / Chrome
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari
  if ((window.navigator as any).standalone === true) return true;
  return false;
}

function isDismissed(): boolean {
  const until = localStorage.getItem(LS_DISMISSED);
  if (!until) return false;
  return Date.now() < Number(until);
}

function isAlreadyInstalled(): boolean {
  return localStorage.getItem(LS_INSTALLED) === "true";
}

// ─────────────────────────────────────────────────────────────────
export default function ServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt]         = useState(false);
  const [isIos, setIsIos]                   = useState(false);

  useEffect(() => {
    // 1. Register generic SW (offline / caching)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered", reg))
        .catch((err) => console.log("SW error", err));
    }

    // 2. Never show if already running in standalone mode or already installed
    if (isRunningStandalone() || isAlreadyInstalled()) return;

    // 3. Never show if user dismissed recently
    if (isDismissed()) return;

    // 4. iOS: show manual instructions after delay
    const isIOSDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIOSDevice) {
      setIsIos(true);
      const t = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(t);
    }

    // 5. Android / Chrome: capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    // 6. Hide prompt silently if user installs via browser UI
    const handleAppInstalled = () => {
      localStorage.setItem(LS_INSTALLED, "true");
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // ── Install via our button ─────────────────────────────────────
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(LS_INSTALLED, "true");
    }
    setDeferredPrompt(null);
  };

  // ── Dismiss ────────────────────────────────────────────────────
  const handleDismiss = () => {
    setShowPrompt(false);
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(LS_DISMISSED, String(until));
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[360px] z-[100] animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
      <div className="relative bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 rounded-2xl p-4 flex gap-3 items-start">
        {/* Close */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <X size={15} />
        </button>

        {/* UFL Logo */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg border border-indigo-500/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/UFLLogo.png" alt="UFL" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-0.5">
            Add Habit AI to Home Screen
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            {isIos
              ? "Tap the Share icon below, then tap 'Add to Home Screen' to install."
              : "Get the full app experience — faster, offline, and distraction‑free."}
          </p>

          {isIos ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
              <Smartphone size={13} />
              <span>Tap Share → Add to Home Screen</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download size={13} className="animate-bounce" />
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}