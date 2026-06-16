import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sourceType = searchParams.get("sourceType");

  const where: Record<string, unknown> = { falsePositive: false };
  if (status) where.status = status;
  if (sourceType) where.sourceType = sourceType;

  // Un-snooze tasks whose snooze has expired
  await prisma.task.updateMany({
    where: {
      status: "snoozed",
      snoozedUntil: { lt: new Date() },
    },
    data: { status: "pending", snoozedUntil: null },
  });

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });

  // Sort by priority rank: urgent > high > medium > low
  const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => {
    const pa = rank[a.priority] ?? 2;
    const pb = rank[b.priority] ?? 2;
    return pa !== pb ? pa - pb : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      sourceType: body.sourceType || "manual",
      sourceId: body.sourceId,
      sourceName: body.sourceName,
      sourceLink: body.sourceLink,
      sender: body.sender,
      priority: body.priority || "medium",
      confidence: body.confidence ?? 1.0,
      notes: body.notes,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
