"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserXp } from "@/app/action";

type XpContextType = {
  xp: number;
  level: number;
  refreshXp: () => Promise<void>;
};

const XpContext = createContext<XpContextType | null>(null);

export const XpProvider = ({ children }: { children: React.ReactNode }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const { status } = useSession();

  const refreshXp = async () => {
    try {
      if (status === "authenticated") {
        const data = await getUserXp();
        setXp(data.xp);
        if (data.level) setLevel(data.level);
      }
    } catch (e) {
      console.error("Failed to fetch XP", e);
    }
  };

  useEffect(() => {
    refreshXp(); // fetch when session changes
  }, [status]);

  return (
    <XpContext.Provider value={{ xp, level, refreshXp }}>
      {children}
    </XpContext.Provider>
  );
};

export const useXp = () => {
  const context = useContext(XpContext);
  if (!context) throw new Error("useXp must be used within XpProvider");
  return context;
};
