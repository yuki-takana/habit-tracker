"use client";

import React, { useState } from "react";
import { Lock, Sparkles, Zap, ShieldAlert, CheckCircle2 } from "lucide-react";
import { UflLoaderInline } from "./ufl-loader";

export interface AgentCardProps {
  id: string;
  label: string;
  icon: string | React.ReactNode;
  color: string;
  description?: string;
  isActive: boolean;
  isPro: boolean;
  config: any;
  isPurchased: boolean;
  promptsUsed: number;
  promptLimit: number;
  onSelect: (id: string) => void;
  onPurchase: (id: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  label,
  icon,
  color,
  description,
  isActive,
  isPro,
  config,
  isPurchased,
  promptsUsed,
  promptLimit,
  onSelect,
  onPurchase,
}) => {
  const [isHandlingPurchase, setIsHandlingPurchase] = useState(false);
  const hasInfiniteAccess = isPro || isPurchased;
  const isExhausted = !hasInfiniteAccess && promptsUsed >= promptLimit;
  const isCompletelyLocked = promptLimit === 0;

  // Render variables based on state
  const shadowColor = isActive ? color : "transparent";
  const bgOpacity = isActive ? "0.1" : "0.03";

  const handlePurchaseClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHandlingPurchase(true);
    try {
      await onPurchase(id);
    } finally {
      setIsHandlingPurchase(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative overflow-hidden rounded-2xl border bg-card p-2 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 ${isActive ? "border-transparent" : "border-border hover:border-foreground/20"
        } ${isExhausted && !isCompletelyLocked && "grayscale-[0.5]"}`}
      style={{
        boxShadow: isActive ? `0 0 20px ${shadowColor}33` : "none",
        ...(isActive ? { borderColor: color } : {}),
      }}
    >
      <div className="bg-card/80 border p-5 rounded-2xl relative z-10">
        {/* Background Glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(120px circle at left top, ${color}${bgOpacity}, transparent)`,
          }}
        />
        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: color }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
          <div className="flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm"
              style={{ background: `${color}15`, color: color }}
            >
              {typeof icon === "string" ? (
                <span className="text-2xl drop-shadow-md">{icon}</span>
              ) : (
                icon
              )}
            </div>
            {/* Status Badge */}
            {hasInfiniteAccess ? (
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase border border-emerald-500/20">
                <CheckCircle2 size={12} /> Unlocked
              </div>
            ) : isCompletelyLocked ? (
              <div className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase border border-rose-500/20">
                <Lock size={12} /> Locked
              </div>
            ) : isExhausted ? (
              <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase border border-red-500/20">
                <ShieldAlert size={12} /> Depleted
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground border border-border">
                Free Tier
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-lg tracking-tight flex items-center gap-2">
              {label}
              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: color }}
                  ></span>
                </span>
              )}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {/* Progress Bar for Free Tier if it's not totally locked */}
            {!hasInfiniteAccess && !isCompletelyLocked && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Free Prompts</span>
                  <span className={isExhausted ? "text-red-500 font-bold" : "text-foreground"}>
                    {promptsUsed} / {promptLimit}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isExhausted ? "bg-red-500" : ""
                      }`}
                    style={{
                      width: `${Math.min((promptsUsed / promptLimit) * 100, 100)}%`,
                      backgroundColor: !isExhausted ? color : undefined,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Button: Required if Exhausted */}
            {isExhausted && (
              <button
                onClick={handlePurchaseClick}
                disabled={isHandlingPurchase}
                className="group/btn relative mt-2 w-full overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-100%)] group-hover/btn:duration-1000 group-hover/btn:transform-[skew(-12deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20 dark:bg-white/10" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  {isHandlingPurchase ? (
                    <UflLoaderInline />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Unlock for ₹{config}
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
