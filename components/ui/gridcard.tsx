"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const variantStyles: Record<string, string> = {
  default: "bg-zinc-900 border-zinc-800",
  indigo: "bg-indigo-950/40 border-indigo-900",
  success: "bg-[#1a2e00] border-[#2d4a00]",
  danger: "bg-red-950/40 border-red-900",
  warning: "bg-amber-950/40 border-amber-900",
};

interface GridCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  noPad?: boolean;
  variant?: keyof typeof variantStyles;
}

export function GridCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  noPad = false,
  variant = "default",
}: GridCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        colSpan === 2 && "sm:col-span-2",
        colSpan === 4 && "lg:col-span-4",
        rowSpan === 2 && "lg:row-span-2"
      )}
    >
      <Card
        className={cn(
          "rounded-2xl overflow-hidden border transition-colors hover:border-zinc-700",
          variantStyles[variant],
          className
        )}
      >
        <CardContent className={cn(!noPad && "p-5")}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}