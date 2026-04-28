"use client";

import { SessionProvider } from "next-auth/react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import React from "react";
import { XpProvider } from "./xp-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <XpProvider>
                {children}
                <ProgressBar
                    height="2px"
                    color="#6366f1"
                    options={{ showSpinner: false }}
                    shallowRouting
                />
            </XpProvider>
        </SessionProvider>
    );
}
