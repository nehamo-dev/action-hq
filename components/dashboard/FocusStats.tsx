"use client";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, Clock, CheckCircle2, Flame } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";

export function FocusStats() {
  const { tasks, streak, fetchStreak } = useTaskStore();

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const pending = tasks.filter((t) => t.status === "pending" && !t.falsePositive);
  const completed = tasks.filter((t) => t.status === "completed" && !t.falsePositive);
  const snoozed = tasks.filter((t) => t.status === "snoozed" && !t.falsePositive);
  const urgent = pending.filter((t) => t.priority === "urgent");

  const total = pending.length + completed.length;
  const completionPct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const cards = [
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Urgent",
      value: urgent.length,
      color: "from-red-500/20 to-red-500/5 border-red-500/20",
      textColor: "text-red-600 dark:text-red-400",
      iconColor: "text-red-500",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Pending",
      value: pending.length,
      color: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
      textColor: "text-amber-700 dark:text-amber-400",
      iconColor: "text-amber-500",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Snoozed",
      value: snoozed.length,
      color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
      textColor: "text-blue-700 dark:text-blue-400",
      iconColor: "text-blue-500",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Completed",
      value: completed.length,
      color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
      textColor: "text-emerald-700 dark:text-emerald-400",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border bg-gradient-to-br p-4 card-hover cursor-default ${card.color}`}
          >
            <div className={`mb-2 ${card.iconColor}`}>{card.icon}</div>
            <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Inbox Zero Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Inbox Zero Progress</span>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completed.length} of {total} tasks completed
          </p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20 p-4 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Daily Streak</span>
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {streak?.currentDays ?? 0}
            <span className="text-base font-normal text-muted-foreground ml-1">days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Best: {streak?.longestDays ?? 0} days
          </p>
        </motion.div>
      </div>
    </div>
  );
}
