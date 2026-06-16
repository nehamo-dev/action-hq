import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTasksFromText } from "@/lib/anthropic";
import { buildGmailQuery, parseThreadForExtraction } from "@/services/gmail";
import { isYesterday, buildMeetingContext } from "@/services/granola";

// This route is called client-side and uses the MCP tools via a relay
// The actual MCP calls happen in the browser via the action-hq MCP bridge
// For server-side, we accept pre-fetched data from the client

export async function POST(req: Request) {
  const body = await req.json();
  const { emails = [], meetings = [] } = body as {
    emails: Array<{
      id: string;
      subject: string;
      sender: string;
      body: string;
      date: string;
      link: string;
    }>;
    meetings: Array<{
      id: string;
      title: string;
      date: string;
      transcript: string;
    }>;
  };

  // Get feedback patterns to avoid repeating mistakes
  const patterns = await prisma.feedbackPattern.findMany({
    orderBy: { count: "desc" },
    take: 20,
  });
  const patternTexts = patterns.map((p) => p.pattern);

  let added = 0;
  const allTasks = [];

  // Process emails
  for (const email of emails) {
    const existing = await prisma.task.findFirst({
      where: { sourceId: email.id, sourceType: "email" },
    });
    if (existing) continue;

    const extracted = await extractTasksFromText(
      `Subject: ${email.subject}\nFrom: ${email.sender}\n\n${email.body}`,
      "email",
      email.subject,
      patternTexts
    );

    for (const item of extracted) {
      const task = await prisma.task.create({
        data: {
          title: item.title,
          description: item.description,
          sourceType: "email",
          sourceId: email.id,
          sourceName: email.subject,
          sourceLink: email.link,
          sender: email.sender,
          priority: item.priority,
          confidence: item.confidence,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        },
      });
      allTasks.push(task);
      added++;
    }
  }

  // Process meetings
  for (const meeting of meetings) {
    const existing = await prisma.task.findFirst({
      where: { sourceId: meeting.id, sourceType: "meeting" },
    });
    if (existing) continue;

    const extracted = await extractTasksFromText(
      buildMeetingContext(meeting),
      "meeting",
      meeting.title,
      patternTexts
    );

    for (const item of extracted) {
      const task = await prisma.task.create({
        data: {
          title: item.title,
          description: item.description,
          sourceType: "meeting",
          sourceId: meeting.id,
          sourceName: meeting.title,
          priority: item.priority,
          confidence: item.confidence,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        },
      });
      allTasks.push(task);
      added++;
    }
  }

  // Update daily summary
  const today = new Date().toISOString().split("T")[0];
  const [total, completed, urgent] = await Promise.all([
    prisma.task.count({ where: { falsePositive: false } }),
    prisma.task.count({ where: { status: "completed", falsePositive: false } }),
    prisma.task.count({ where: { status: "pending", priority: "urgent", falsePositive: false } }),
  ]);

  await prisma.dailySummary.upsert({
    where: { date: today },
    create: { date: today, totalTasks: total, completedTasks: completed, urgentTasks: urgent },
    update: { totalTasks: total, completedTasks: completed, urgentTasks: urgent },
  });

  return NextResponse.json({ added, skipped: emails.length + meetings.length - added, tasks: allTasks });
}

export async function GET() {
  return NextResponse.json({ gmailQuery: buildGmailQuery(), isYesterdayFn: isYesterday.toString() });
}
