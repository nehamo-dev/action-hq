export type Priority = "urgent" | "high" | "medium" | "low";
export type Status = "pending" | "completed" | "snoozed" | "dismissed";
export type SourceType = "email" | "meeting" | "manual";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  sourceType: SourceType;
  sourceId?: string | null;
  sourceName?: string | null;
  sourceLink?: string | null;
  sender?: string | null;
  priority: Priority;
  status: Status;
  snoozedUntil?: string | null;
  confidence: number;
  falsePositive: boolean;
  feedbackReason?: string | null;
  notes?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  id: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  urgentTasks: number;
  topThemes?: string | null;
  generatedSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Streak {
  id: string;
  currentDays: number;
  longestDays: number;
  lastActiveAt: string;
  updatedAt: string;
}

export interface SyncResult {
  added: number;
  skipped: number;
  tasks: Task[];
}
