import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDailyBriefing } from "@/lib/anthropic";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const existing = await prisma.dailySummary.findUnique({ where: { date: today } });
  if (existing?.generatedSummary) {
    return NextResponse.json({
      summary: existing.generatedSummary,
      themes: JSON.parse(existing.topThemes || "[]"),
      stats: {
        total: existing.totalTasks,
        completed: existing.completedTasks,
        urgent: existing.urgentTasks,
      },
    });
  }

  const tasks = await prisma.task.findMany({
    where: { falsePositive: false, status: { not: "dismissed" } },
    select: { title: true, priority: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const name = process.env.USER_NAME || "there";
    return NextResponse.json({
      summary: `Good morning, ${name}! You have ${pending} action items waiting. Add your ANTHROPIC_API_KEY to .env.local for AI-powered briefings.`,
      themes: [],
      stats: { total, completed, urgent },
    });
  }

  const { summary, themes } = await generateDailyBriefing(
    tasks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    process.env.USER_NAME || "Neha"
  );

  const [total, completed, urgent] = await Promise.all([
    prisma.task.count({ where: { falsePositive: false } }),
    prisma.task.count({ where: { status: "completed", falsePositive: false } }),
    prisma.task.count({ where: { status: "pending", priority: "urgent", falsePositive: false } }),
  ]);

  await prisma.dailySummary.upsert({
    where: { date: today },
    create: {
      date: today,
      totalTasks: total,
      completedTasks: completed,
      urgentTasks: urgent,
      generatedSummary: summary,
      topThemes: JSON.stringify(themes),
    },
    update: {
      totalTasks: total,
      completedTasks: completed,
      urgentTasks: urgent,
      generatedSummary: summary,
      topThemes: JSON.stringify(themes),
    },
  });

  return NextResponse.json({ summary, themes, stats: { total, completed, urgent } });
}
