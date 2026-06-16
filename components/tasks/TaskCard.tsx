"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Clock, Mail, Video, AlertCircle, ChevronDown,
  ExternalLink, ThumbsDown, Trash2, Edit3, Calendar,
  Star, MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "@/store/useTaskStore";
import type { Task, Priority } from "@/types";
import { formatDistanceToNow, addDays, nextMonday, format } from "date-fns";
import { toast } from "sonner";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800", icon: <AlertCircle className="h-3 w-3" /> },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800", icon: <Star className="h-3 w-3" /> },
  medium: { label: "Medium", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800", icon: null },
  low: { label: "Low", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700", icon: null },
};

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notActionOpen, setNotActionOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || "");
  const { completeTask, snoozeTask, markFalsePositive, deleteTask, updateTask } = useTaskStore();

  const priority = PRIORITY_CONFIG[task.priority as Priority] || PRIORITY_CONFIG.medium;
  const age = formatDistanceToNow(new Date(task.createdAt), { addSuffix: true });

  const handleComplete = async () => {
    setCompleting(true);
    await completeTask(task.id);
    toast.success("Task completed! 🎉", { description: task.title });
  };

  const handleSnooze = async (days: number | "custom") => {
    let until: Date;
    if (days === "custom") {
      until = addDays(new Date(), 3);
    } else if (days === 7) {
      until = nextMonday(new Date());
    } else {
      until = addDays(new Date(), days);
    }
    await snoozeTask(task.id, until);
    toast.info(`Snoozed until ${format(until, "MMM d")}`, { icon: "😴" });
  };

  const handleNotAction = async () => {
    if (!feedbackReason.trim()) {
      toast.error("Please tell us why this isn't an action item.");
      return;
    }
    await markFalsePositive(task.id, feedbackReason);
    toast.success("Got it — we'll learn from this!", { description: "Won't generate similar items." });
    setNotActionOpen(false);
  };

  const handleEdit = async () => {
    await updateTask(task.id, { title: editTitle, notes: editNotes });
    setEditOpen(false);
    toast.success("Task updated");
  };

  const confidenceColor = task.confidence >= 0.8 ? "bg-emerald-400" : task.confidence >= 0.6 ? "bg-amber-400" : "bg-slate-300";

  if (task.status === "completed") {
    return (
      <motion.div
        layout
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Check className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm text-muted-foreground line-through">{task.title}</span>
        {task.sourceName && (
          <span className="text-xs text-muted-foreground/50 ml-auto truncate max-w-[120px]">{task.sourceName}</span>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: completing ? 0 : 1, y: 0, scale: completing ? 0.95 : 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className={`group rounded-2xl border bg-card card-hover overflow-hidden ${
          task.priority === "urgent" ? "border-red-200 dark:border-red-800/50 shadow-red-100 dark:shadow-red-900/20 shadow-sm" : ""
        }`}
      >
        {/* Priority accent bar */}
        <div className={`h-0.5 ${task.priority === "urgent" ? "bg-red-500" : task.priority === "high" ? "bg-orange-400" : task.priority === "medium" ? "bg-blue-400" : "bg-slate-200"}`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Complete button */}
            <button
              onClick={handleComplete}
              className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group/check"
              title="Mark complete"
            >
              <Check className="h-3 w-3 text-transparent group-hover/check:text-emerald-500 mx-auto transition-colors" />
            </button>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{task.title}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0 -mt-0.5 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => { setEditTitle(task.title); setEditNotes(task.notes || ""); setEditOpen(true); }}>
                      <Edit3 className="h-3.5 w-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSnooze(1)}>
                      <Clock className="h-3.5 w-3.5 mr-2" /> Snooze tomorrow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSnooze(7)}>
                      <Calendar className="h-3.5 w-3.5 mr-2" /> Snooze next week
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setNotActionOpen(true)} className="text-amber-600">
                      <ThumbsDown className="h-3.5 w-3.5 mr-2" /> Not an action item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Source badge */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {task.sourceType === "email" ? <Mail className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                  <span className="truncate max-w-[140px]">{task.sourceName || task.sender || task.sourceType}</span>
                </div>

                {/* Priority badge */}
                <span className={`inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full border font-medium ${priority.bg} ${priority.color}`}>
                  {priority.icon}
                  {priority.label}
                </span>

                {/* Confidence dot */}
                <span title={`AI confidence: ${Math.round(task.confidence * 100)}%`} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${confidenceColor}`} />
                  <span className="text-xs text-muted-foreground/60">{Math.round(task.confidence * 100)}%</span>
                </span>

                {/* Age */}
                <span className="text-xs text-muted-foreground/60 ml-auto">{age}</span>
              </div>

              {/* Description / expand */}
              {!compact && task.description && (
                <div>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    Context
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-muted/50 rounded-lg p-2.5">
                          {task.description}
                        </p>
                        {task.sourceLink && (
                          <a
                            href={task.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> View original
                          </a>
                        )}
                        {task.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">{task.notes}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={editNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNotes(e.target.value)} rows={3} placeholder="Add context or notes…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Not an action item dialog */}
      <Dialog open={notActionOpen} onOpenChange={setNotActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not an action item?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Help us improve! Why isn&apos;t &ldquo;{task.title}&rdquo; an action item?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["It's just FYI", "Already done", "Not mine to do", "It's automated", "Duplicate", "Other"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFeedbackReason(r)}
                  className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${feedbackReason === r ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 hover:bg-muted border-border"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Or describe why… (helps the AI learn)"
              value={feedbackReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackReason(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotActionOpen(false)}>Cancel</Button>
            <Button onClick={handleNotAction} variant="destructive">Mark as not an action item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
