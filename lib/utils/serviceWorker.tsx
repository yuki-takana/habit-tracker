"use client";
import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function ServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered", reg))
        .catch((err) => console.log("SW error", err));
    }

    // Detect iOS and standalone status
    const isIOSDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator) && (window.navigator as any).standalone;
    };

    if (isIOSDevice() && !isInStandaloneMode()) {
      setIsIos(true);
      setTimeout(() => {
        if (!hasDismissed) setShowPrompt(true);
      }, 3000);
    }

    // Handle Android/Chrome PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Delay showing the prompt to ensure content loads first
      setTimeout(() => {
        if (!hasDismissed) setShowPrompt(true);
      }, 3000); // 3 seconds after load
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [hasDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    setShowPrompt(false);
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User interaction outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasDismissed(true);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[350px] z-[100] animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-indigo-500/20 shadow-2xl rounded-2xl p-4 flex gap-4 items-start relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <X size={16} />
        </button>
        
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 text-white font-black text-xl">
          H
        </div>
        
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">Add Habit AI to Home Screen</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            {isIos ? "Enhance your workflow! Tap 'Share' then 'Add to Home Screen' below." : "Install for a faster, app-like experience to track your daily goals."}
          </p>
          {!isIos && (
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Download size={14} className="animate-bounce" /> Install App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}