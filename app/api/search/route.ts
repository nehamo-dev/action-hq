import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchTasksNaturalLanguage } from "@/lib/anthropic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json([]);

  const tasks = await prisma.task.findMany({
    where: { falsePositive: false },
    select: { id: true, title: true, description: true, sender: true, sourceName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    // Fallback: simple substring match
    const q_lower = q.toLowerCase();
    const results = await prisma.task.findMany({
      where: {
        falsePositive: false,
        OR: [
          { title: { contains: q_lower } },
          { sender: { contains: q_lower } },
          { sourceName: { contains: q_lower } },
          { description: { contains: q_lower } },
        ],
      },
    });
    return NextResponse.json(results);
  }

  const ids = await searchTasksNaturalLanguage(
    q,
    tasks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))
  );

  const results = await prisma.task.findMany({
    where: { id: { in: ids }, falsePositive: false },
  });

  return NextResponse.json(results);
}
