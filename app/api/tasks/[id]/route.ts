import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.title !== undefined) updates.title = body.title;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.snoozedUntil !== undefined) updates.snoozedUntil = body.snoozedUntil ? new Date(body.snoozedUntil) : null;
  if (body.falsePositive !== undefined) updates.falsePositive = body.falsePositive;
  if (body.feedbackReason !== undefined) updates.feedbackReason = body.feedbackReason;

  if (body.status === "completed") updates.completedAt = new Date();
  if (body.status === "pending") updates.completedAt = null;

  const task = await prisma.task.update({ where: { id }, data: updates });

  // Log feedback if marking as false positive
  if (body.falsePositive && body.feedbackReason) {
    await prisma.feedback.create({
      data: {
        taskId: id,
        originalText: task.title + (task.description ? `: ${task.description}` : ""),
        feedbackType: "false_positive",
        reason: body.feedbackReason,
      },
    });

    // Update feedback pattern memory
    const pattern = body.feedbackReason.toLowerCase().slice(0, 100);
    await prisma.feedbackPattern.upsert({
      where: { pattern },
      create: { pattern, sourceType: task.sourceType },
      update: { count: { increment: 1 } },
    });
  }

  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
