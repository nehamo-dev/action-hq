"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/store/useTaskStore";
import { Skeleton } from "@/components/ui/skeleton";

const MOTIVATIONAL = [
  "You're unstoppable today.",
  "One task at a time.",
  "Progress, not perfection.",
  "Make it happen.",
  "Clear mind, clear inbox.",
  "Small steps, big impact.",
];

export function DailyBriefing() {
  const { briefing, fetchBriefing } = useTaskStore();

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const motivational = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (!briefing) {
    return (
      <div className="rounded-2xl glass p-6 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass p-6 relative overflow-hidden"
    >
      {/* Background gradient orb */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {greeting}
            </span>
          </div>
          <p className="text-base text-foreground leading-relaxed">
            {briefing.summary}
          </p>
          <p className="text-sm text-primary font-medium italic">{motivational}</p>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px]">
          <Stat icon={<AlertCircle className="h-3.5 w-3.5 text-red-500" />} label="Urgent" value={briefing.stats.urgent} color="text-red-500" />
          <Stat icon={<Clock className="h-3.5 w-3.5 text-amber-500" />} label="Pending" value={briefing.stats.total - briefing.stats.completed} color="text-amber-500" />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} label="Done" value={briefing.stats.completed} color="text-emerald-500" />
        </div>
      </div>

      {briefing.themes.length > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Today&apos;s themes:</span>
          <div className="flex flex-wrap gap-1.5">
            {briefing.themes.map((theme) => (
              <Badge key={theme} variant="secondary" className="text-xs font-normal">
                {theme}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ml-auto ${color}`}>{value}</span>
    </div>
  );
}
