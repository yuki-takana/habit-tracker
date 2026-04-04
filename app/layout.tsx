import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import Nav from "@/components/shared/nav";
import DashboardFooter from "@/components/shared/dashboard-footer";
import { Toaster } from "sonner";

const myCustomFont = localFont({
  src: [
    {
      path: '../public/fonts/font8.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/font8.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
})

export const metadata: Metadata = {
  title: "UFL",
  description: "An AI featured Plateform for you productivity",
};

import { Providers } from "@/components/providers/Providers";
import { fetchUserSubscriptionTier } from "./action";
import ServiceWorkerRegister from "@/lib/utils/serviceWorker";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { plan } = await fetchUserSubscriptionTier();
  const isPro = plan === "pro";
  return (
    <html lang="en" className={myCustomFont.variable}>
      <body
        className={`${myCustomFont.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange = {false}
        >
          <Providers>
            <div className="flex flex-col min-h-screen bg-white dark:bg-[#09090B] transition-colors duration-300">
              <Nav />
              <ServiceWorkerRegister/>
              <main className="flex-1 w-full mt-16">
                {children}
                <Toaster richColors position="bottom-right" />
              </main>

              <DashboardFooter />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
