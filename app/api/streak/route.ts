import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const streak = await prisma.streak.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(streak || { currentDays: 0, longestDays: 0 });
}

export async function POST() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.streak.findUnique({ where: { id: "singleton" } });

  if (!existing) {
    const s = await prisma.streak.create({
      data: { id: "singleton", currentDays: 1, longestDays: 1, lastActiveAt: new Date() },
    });
    return NextResponse.json(s);
  }

  const lastActive = new Date(existing.lastActiveAt);
  lastActive.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let newCurrent = existing.currentDays;
  if (diffDays === 1) newCurrent += 1;
  else if (diffDays > 1) newCurrent = 1;
  // diffDays === 0 means same day, don't change

  const newLongest = Math.max(existing.longestDays, newCurrent);

  const s = await prisma.streak.update({
    where: { id: "singleton" },
    data: { currentDays: newCurrent, longestDays: newLongest, lastActiveAt: new Date() },
  });
  return NextResponse.json(s);
}
