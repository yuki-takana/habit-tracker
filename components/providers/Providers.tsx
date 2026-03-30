"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { XpProvider } from "./xp-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <XpProvider>
                {children}
            </XpProvider>
        </SessionProvider>
    );
}
