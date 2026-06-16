"use client";
import { create } from "zustand";
import type { Task, Priority, Status } from "@/types";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  syncing: boolean;
  searchQuery: string;
  searchResults: Task[] | null;
  briefing: { summary: string; themes: string[]; stats: { total: number; completed: number; urgent: number } } | null;
  streak: { currentDays: number; longestDays: number } | null;

  fetchTasks: () => Promise<void>;
  fetchBriefing: () => Promise<void>;
  fetchStreak: () => Promise<void>;
  updateTask: (id: string, updates: Partial<Task & { feedbackReason: string }>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  snoozeTask: (id: string, until: Date) => Promise<void>;
  markFalsePositive: (id: string, reason: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  search: (q: string) => Promise<void>;
  clearSearch: () => void;
  sync: (emails: unknown[], meetings: unknown[]) => Promise<{ added: number; skipped: number }>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  syncing: false,
  searchQuery: "",
  searchResults: null,
  briefing: null,
  streak: null,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/tasks");
      const tasks = await res.json();
      set({ tasks });
    } finally {
      set({ loading: false });
    }
  },

  fetchBriefing: async () => {
    const res = await fetch("/api/briefing");
    const briefing = await res.json();
    set({ briefing });
  },

  fetchStreak: async () => {
    const res = await fetch("/api/streak");
    const streak = await res.json();
    set({ streak });
  },

  updateTask: async (id, updates) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  completeTask: async (id) => {
    await get().updateTask(id, { status: "completed" });
    // Update streak
    fetch("/api/streak", { method: "POST" }).then((r) => r.json()).then((streak) => set({ streak }));
  },

  snoozeTask: async (id, until) => {
    await get().updateTask(id, { status: "snoozed", snoozedUntil: until.toISOString() } as unknown as Partial<Task & { feedbackReason: string }>);
  },

  markFalsePositive: async (id, reason) => {
    await get().updateTask(id, { falsePositive: true, feedbackReason: reason });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  deleteTask: async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  addTask: async (data) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const task = await res.json();
    set((s) => ({ tasks: [task, ...s.tasks] }));
  },

  search: async (q) => {
    set({ searchQuery: q });
    if (!q.trim()) { set({ searchResults: null }); return; }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const results = await res.json();
    set({ searchResults: results });
  },

  clearSearch: () => set({ searchQuery: "", searchResults: null }),

  sync: async (emails, meetings) => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, meetings }),
      });
      const result = await res.json();
      await get().fetchTasks();
      await get().fetchBriefing();
      return result;
    } finally {
      set({ syncing: false });
    }
  },
}));
