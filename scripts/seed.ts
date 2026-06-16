import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" } as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Clear existing tasks
  await prisma.task.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.dailySummary.deleteMany();
  await prisma.streak.deleteMany();

  const tasks = [
    {
      title: "Reply to Jessica about the Q3 partnership proposal",
      description: "Jessica from Acme Corp sent a detailed proposal for a Q3 partnership. She's waiting on our feedback about the revenue share model before Thursday's call.",
      sourceType: "email",
      sourceId: "email-001",
      sourceName: "Re: Q3 Partnership Proposal",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/email-001",
      sender: "jessica@acmecorp.com",
      priority: "urgent",
      confidence: 0.95,
    },
    {
      title: "Schedule follow-up call with recruiting team",
      description: "After yesterday's sync, the recruiting team needs a dedicated 30-min slot this week to discuss the new eng hiring bar and candidate pipeline.",
      sourceType: "meeting",
      sourceId: "meeting-001",
      sourceName: "Weekly Recruiting Sync",
      priority: "high",
      confidence: 0.88,
    },
    {
      title: "Send updated deck to investors before Friday",
      description: "Marcus asked for the revised pitch deck with updated ARR projections and new customer logos. He needs it for the LP update call on Friday.",
      sourceType: "email",
      sourceId: "email-002",
      sourceName: "Investor Update — Action Needed",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/email-002",
      sender: "marcus@vc.com",
      priority: "urgent",
      confidence: 0.92,
    },
    {
      title: "Review and approve Sarah's PR for the new onboarding flow",
      description: "Sarah opened PR #247 for the redesigned onboarding flow. She's blocked on your review before she can merge and ship to staging.",
      sourceType: "email",
      sourceId: "email-003",
      sourceName: "PR Review Request: Onboarding Flow",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/email-003",
      sender: "sarah@company.com",
      priority: "high",
      confidence: 0.91,
    },
    {
      title: "Follow up with legal on NDA for Stripe partnership",
      description: "The NDA draft has been sitting with legal for 2 weeks. Stripe is ready to move forward as soon as we sign. Ping David to get status.",
      sourceType: "meeting",
      sourceId: "meeting-002",
      sourceName: "Stripe Partnership Kickoff",
      priority: "high",
      confidence: 0.85,
    },
    {
      title: "Book flight and hotel for NYC offsite (June 20-22)",
      description: "Team offsite is confirmed for NYC June 20-22. Need to book travel ASAP — the team Slack said to coordinate with ops@company.com.",
      sourceType: "email",
      sourceId: "email-004",
      sourceName: "Team Offsite: NYC June 20-22",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/email-004",
      sender: "ops@company.com",
      priority: "medium",
      confidence: 0.79,
    },
    {
      title: "Write performance review for Alex by end of month",
      description: "Annual review cycle starts Monday. Alex's self-review is done and waiting for your manager input in Lattice.",
      sourceType: "email",
      sourceId: "email-005",
      sourceName: "Performance Review Cycle — Manager Action Required",
      sender: "hr@company.com",
      priority: "medium",
      confidence: 0.83,
    },
    {
      title: "Respond to Techcrunch journalist re: funding announcement",
      description: "Mei from TechCrunch reached out wanting a comment on the funding round before they publish. They have a 48-hour embargo deadline.",
      sourceType: "email",
      sourceId: "email-006",
      sourceName: "TechCrunch: Comment Request",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/email-006",
      sender: "mei@techcrunch.com",
      priority: "urgent",
      confidence: 0.97,
    },
    {
      title: "Share product roadmap doc with design team",
      description: "The design team needs Q3 roadmap to start mocking up features. Link is in Notion — just need to share with design@company.com.",
      sourceType: "meeting",
      sourceId: "meeting-003",
      sourceName: "Product-Design Weekly",
      priority: "low",
      confidence: 0.74,
    },
    {
      title: "Approve budget request for marketing campaign",
      description: "The $15k social campaign proposal is in Ramp waiting for your approval. Tanya needs it approved before she kicks off with the agency.",
      sourceType: "email",
      sourceId: "email-007",
      sourceName: "Budget Approval: Social Campaign",
      sender: "tanya@company.com",
      priority: "medium",
      confidence: 0.87,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task as Parameters<typeof prisma.task.create>[0]["data"] });
  }

  // Add one completed task
  await prisma.task.create({
    data: {
      title: "Send intro email to Ben at OpenAI",
      sourceType: "meeting",
      sourceName: "Partnerships Sync",
      priority: "medium",
      confidence: 0.82,
      status: "completed",
      completedAt: new Date(),
    },
  });

  // Set a streak
  await prisma.streak.create({
    data: {
      id: "singleton",
      currentDays: 4,
      longestDays: 12,
      lastActiveAt: new Date(),
    },
  });

  console.log("Seeded", tasks.length + 1, "tasks");
}

main().finally(() => prisma.$disconnect());
