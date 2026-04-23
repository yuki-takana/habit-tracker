"use client";

/**
 * MicroInteractionProvider
 * ─────────────────────────
 * Sits inside the dashboard layout and:
 *  1. Fetches the current user's phone / whatsappEnabled flags
 *  2. Shows PhonePromptDialog  if user has no phone (after 5 s delay, once per session)
 *  3. Shows WhatsappEnableDialog if user has phone but whatsappEnabled = false
 *  4. Listens for level-up events emitted by XpProvider and shows LevelUpDialog
 */

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession }            from "next-auth/react";
import { useXp }                 from "@/components/providers/xp-provider";
import PhonePromptDialog         from "@/components/dialogs/PhonePromptDialog";
import WhatsappEnableDialog      from "@/components/dialogs/WhatsappEnableDialog";
import LevelUpDialog             from "@/components/dialogs/LevelUpDialog";

// ─── Storage keys ─────────────────────────────────────────────────
const SS_WA_PROMPT      = "wa-prompt-seen";   // sessionStorage — once per tab
const LS_CELEBRATED_LVL = "levelup-celebrated"; // localStorage   — persists across refreshes

// ─── context (exported so other components can trigger level-up) ──
type MicroCtx = { triggerLevelUp: (level: number, xp: number) => void };
const MicroContext = createContext<MicroCtx>({ triggerLevelUp: () => {} });
export const useMicroInteractions = () => useContext(MicroContext);

// ─────────────────────────────────────────────────────────────────
export default function MicroInteractionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { level, xp }             = useXp();

  // Dialog visibility
  const [showPhonePrompt,    setShowPhonePrompt]    = useState(false);
  const [showWhatsappEnable, setShowWhatsappEnable] = useState(false);
  const [levelUpData,        setLevelUpData]        = useState<{ level: number; xp: number } | null>(null);

  // ── 1. Detect level-up (localStorage-persisted so it survives refreshes) ──
  useEffect(() => {
    // Wait until XP provider has fetched real data (level starts at 1 by default)
    if (!level || level < 1) return;

    const storedRaw      = localStorage.getItem(LS_CELEBRATED_LVL);
    const lastCelebrated = storedRaw ? parseInt(storedRaw, 10) : 0;

    if (level > lastCelebrated) {
      // Mark immediately so refreshes don't re-trigger
      localStorage.setItem(LS_CELEBRATED_LVL, String(level));

      // Only pop the dialog for a genuine level-up (not the very first login
      // where lastCelebrated was 0 and the user is already at, say, level 3)
      if (lastCelebrated > 0) {
        setLevelUpData({ level, xp });
      }
    }
  }, [level, xp]);

  // ── 2. WhatsApp prompts — only once per session ────────────────
  useEffect(() => {
    if (status !== "authenticated") return;
    if (sessionStorage.getItem(SS_WA_PROMPT)) return;

    const timer = setTimeout(async () => {
      try {
        const res  = await fetch("/api/check-user");
        if (!res.ok) return;
        const data = await res.json();

        // Mark so this doesn't fire again this session
        sessionStorage.setItem(SS_WA_PROMPT, "1");

        if (!data.phone) {
          setShowPhonePrompt(true);
        } else if (!data.whatsappEnabled) {
          setShowWhatsappEnable(true);
        }
      } catch {
        // silently fail — don't annoy user if request fails
      }
    }, 5000); // 5 s after login to let page settle

    return () => clearTimeout(timer);
  }, [status]);

  // ── Context value ──────────────────────────────────────────────
  const triggerLevelUp = (level: number, xp: number) => setLevelUpData({ level, xp });

  return (
    <MicroContext.Provider value={{ triggerLevelUp }}>
      {children}

      {/* Phone number prompt */}
      {showPhonePrompt && (
        <PhonePromptDialog
          onClose={() => setShowPhonePrompt(false)}
          onSaved={() => setShowPhonePrompt(false)}
        />
      )}

      {/* WhatsApp enable prompt */}
      {showWhatsappEnable && (
        <WhatsappEnableDialog
          onClose={() => setShowWhatsappEnable(false)}
          onEnabled={() => setShowWhatsappEnable(false)}
        />
      )}

      {/* Level-up celebration */}
      {levelUpData && (
        <LevelUpDialog
          newLevel={levelUpData.level}
          xp={levelUpData.xp}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </MicroContext.Provider>
  );
}
