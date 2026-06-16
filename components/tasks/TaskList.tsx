"use client";
import { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { useTaskStore } from "@/store/useTaskStore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task, Status } from "@/types";
import { Inbox } from "lucide-react";
import confetti from "canvas-confetti";

interface TaskListProps {
  filter?: Status | "all";
  showCompleted?: boolean;
  limit?: number;
}

export function TaskList({ filter = "all", showCompleted = false, limit }: TaskListProps) {
  const { tasks, loading, fetchTasks, searchResults, searchQuery } = useTaskStore();
  const prevCompletedRef = useRef(0);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const displayTasks = searchQuery && searchResults !== null ? searchResults : tasks;

  const filtered = displayTasks.filter((t: Task) => {
    if (t.falsePositive) return false;
    if (filter === "all") return t.status !== "completed" || showCompleted;
    return t.status === filter;
  });

  // Sort: urgent first, then by priority, then by date
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) => {
    const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
    const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayed = limit ? sorted.slice(0, limit) : sorted;

  // Confetti when inbox zero
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending" && !t.falsePositive).length;

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"] });
  }, []);

  useEffect(() => {
    if (prevCompletedRef.current > 0 && pendingCount === 0 && completedCount > prevCompletedRef.current) {
      fireConfetti();
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, pendingCount, fireConfetti]);

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        {pendingCount === 0 && !searchQuery ? (
          <>
            <p className="text-base font-medium">Inbox zero! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">You&apos;re all caught up. Enjoy the moment.</p>
          </>
        ) : (
          <>
            <p className="text-base font-medium">{searchQuery ? "No results found" : "Nothing here"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? `Try a different search for "${searchQuery}"` : "All tasks will appear here."}
            </p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {displayed.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
}
