import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface ActiveBlueprintCardProps {
  title: string;
  badgeLabel: string;
  icon: React.ReactNode;
  badgeColor: string;
  delay?: number;
}

export const ActiveBlueprintCard: React.FC<ActiveBlueprintCardProps> = ({
  title,
  badgeLabel,
  icon,
  badgeColor,
  delay = 0,
}) => {
  return (
    <div className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer
    border h-full rounded-2xl overflow-hidden relative p-2
    bg-white border-slate-200
    dark:bg-[#111113] dark:border-zinc-800
    hover:shadow-indigo-500/5`}>
      {/* Subtle Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(120px circle at left top, var(--primary)/5, transparent)`
        }}
      />

      <div className="p-5 flex flex-col h-full justify-between gap-4 relative z-10 rounded-2xl border
      bg-white border-slate-200
      dark:bg-[#18181B] dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl border ${badgeColor} bg-background shadow-xs`}>
            {icon}
          </div>
          <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 border ${badgeColor} shadow-none`}>
            {badgeLabel}
          </Badge>
        </div>

        <div className="flex-1 mt-2">
          <p className="font-bold text-[15px] text-foreground leading-snug line-clamp-2">
            {title}
          </p>
        </div>

        <div className="pt-4 mt-auto border-t border-border/40 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Resume
          </span>
          <div className="bg-primary/5 rounded-full p-1 group-hover:bg-primary/10 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
