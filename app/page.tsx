"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, CheckSquare, Clock, Archive, Moon, Sun } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyBriefing } from "@/components/dashboard/DailyBriefing";
import { FocusStats } from "@/components/dashboard/FocusStats";
import { TaskList } from "@/components/tasks/TaskList";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { AddTaskButton } from "@/components/dashboard/AddTaskButton";
import { SyncPanel } from "@/components/sync/SyncPanel";

export default function Home() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ActionHQ</h1>
              <p className="text-xs text-muted-foreground">Your daily command center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AddTaskButton />
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              title="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </motion.header>

        {/* AI Briefing */}
        <DailyBriefing />

        {/* Stats */}
        <FocusStats />

        {/* Sync */}
        <SyncPanel />

        {/* Search */}
        <SearchBar />

        {/* Task tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4 h-10 bg-muted/60 rounded-xl p-1">
            <TabsTrigger value="today" className="rounded-lg text-xs gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Focus
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-lg text-xs gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> All
            </TabsTrigger>
            <TabsTrigger value="snoozed" className="rounded-lg text-xs gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Snoozed
            </TabsTrigger>
            <TabsTrigger value="done" className="rounded-lg text-xs gap-1.5">
              <Archive className="h-3.5 w-3.5" /> Done
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-2 mt-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Today&apos;s Focus</h2>
            </div>
            <TaskList filter="pending" />
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">All Tasks</h2>
            </div>
            <TaskList filter="all" />
          </TabsContent>

          <TabsContent value="snoozed" className="mt-0">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Snoozed</h2>
            </div>
            <TaskList filter="snoozed" />
          </TabsContent>

          <TabsContent value="done" className="mt-0">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Completed</h2>
            </div>
            <TaskList filter="completed" showCompleted />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
