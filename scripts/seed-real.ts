// Real tasks extracted from Neha's Gmail + Granola — June 15, 2026
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" } as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.task.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.dailySummary.deleteMany();

  const tasks = [
    // URGENT
    {
      title: "Sign purchase agreement for 935 Sculptor St (Adobe Sign)",
      description: "Adobe Sign sent a signature request for the purchase agreement at 935 Sculptor Street, Wendell NC. Review and sign before closing.",
      sourceType: "email", sourceId: "19eccfb8822c4b6c",
      sourceName: "Signature requested — Purchase Agreement 935 Sculptor Street",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19eccfb8822c4b6c",
      sender: "adobesign@adobesign.com", priority: "urgent", confidence: 0.97,
    },
    {
      title: "Respond to Monzo interview invitation — schedule next round",
      description: "Caroline Burke at Monzo invited you for the next interview stage after the team thought the conversation went well. Confirm and schedule next round.",
      sourceType: "email", sourceId: "19ecb56511c2f503",
      sourceName: "Interviewing at Monzo 🚀",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecb56511c2f503",
      sender: "carolineburke@monzo.com", priority: "urgent", confidence: 0.95,
    },
    // HIGH
    {
      title: "Chase Deepesh to confirm he signed 935 Sculptor Street docs",
      description: "You signed all docs. Chris Barr Realty confirmed Deepesh still needed to sign — he said 'I'll do it tonight' on June 15. Follow up to confirm.",
      sourceType: "email", sourceId: "19ecbb8bf9363d75",
      sourceName: "935 Sculptor Street — pending Deepesh signature",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecbb8bf9363d75",
      sender: "admin@chrisbarrrealtygroup.com", priority: "high", confidence: 0.92,
    },
    {
      title: "Prep call with AJ D'Antonio (Workday) — 12:30 PM PT today",
      description: "AJ (Sr. Principal Talent Acquisition, Workday) confirmed a prep call at 12:30 PM PT for your June 23 Workday interviews. He will call you.",
      sourceType: "email", sourceId: "19ecda92930ec2b9",
      sourceName: "You're Confirmed! Workday Meetings — June 23",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecda92930ec2b9",
      sender: "aj.dantonio@workday.com", priority: "high", confidence: 0.91,
    },
    {
      title: "Send product-led growth ideas to Sapia (JP + Pico)",
      description: "Committed in Sapia strategy session to send ideas on where to push for PLG. Key themes: skill sharing, WhatsApp group tagging, Sites virality. They grow 4-5%/wk; target is 15-20%.",
      sourceType: "meeting", sourceId: "bf900526-1986-4d08-adcf-27b2c99281e1",
      sourceName: "Sapia product strategy — growth, integrations, competitive positioning",
      priority: "high", confidence: 0.94,
    },
    {
      title: "Fix Wanderluster Nightly Evals GitHub Actions failure",
      description: "Nightly Evals failed on master (d8a03a4) — all jobs failed in 23s. Likely missing GROQ_API_KEY secret. Check Actions secrets in repo settings.",
      sourceType: "email", sourceId: "19eca19f20fdadcc",
      sourceName: "[nehamo-dev/wanderluster] Run failed: Nightly Evals",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19eca19f20fdadcc",
      sender: "notifications@github.com", priority: "high", confidence: 0.88,
    },
    // MEDIUM
    {
      title: "Confirm Zapia call with JP happened — follow up if not",
      description: "JP (jp@zapia.com) on June 15 said he wants to discuss product strategy 'tomorrow' (June 16). Confirm the call happened and capture any commitments.",
      sourceType: "email", sourceId: "19e99822037c54da",
      sourceName: "Re: Zapia's website builder",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19e99822037c54da",
      sender: "jp@zapia.com", priority: "medium", confidence: 0.82,
    },
    {
      title: "Review DHI Title Commitment documents for 935 Sculptor Street",
      description: "DHI Title Agency sent 2 new Title Commitment documents (File 169-263103688). Review them on the DHI secure website before closing.",
      sourceType: "email", sourceId: "19ecbf4db40db1ef",
      sourceName: "DHI Title Agency: New Document — 935 Sculptor Street",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecbf4db40db1ef",
      sender: "EAHoy@dhititle.com", priority: "medium", confidence: 0.85,
    },
    {
      title: "Follow up on Zalando intro to David (co-CEO) — by Thu Jun 19",
      description: "In your Zalando interview debrief, Christina's firm targeted an intro to David (co-CEO) next week or week after. If no contact by Thu Jun 19, follow up. Also confirm your latest resume is on file.",
      sourceType: "meeting", sourceId: "d94b4465-5485-4489-82ee-34c64f3345ca",
      sourceName: "Neha interview — product leadership and Zalando opportunity",
      priority: "medium", confidence: 0.88,
      dueDate: new Date("2026-06-19"),
    },
    {
      title: "Prepare for Product Faculty podcast — June 23, 9am PT",
      description: "Recording with Moe Ali confirmed for Tue Jun 23 9–10am PT. Angle: 'Claude Code for Executives, by an executive.' Prep talking points on the upskilling initiative.",
      sourceType: "email", sourceId: "19ecc6095303d317",
      sourceName: "Updated: Neha Podcast Recording @ Tue Jun 23 9am PDT",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecc6095303d317",
      sender: "moe@productfaculty.com", priority: "medium", confidence: 0.89,
      dueDate: new Date("2026-06-23"),
    },
    // LOW
    {
      title: "Confirm Brighton Park Capital call with Emily — 6/22 1pm PT",
      description: "You proposed 6/22 at 1pm PT to Emily Fischgrund (Brighton Park Capital). If no confirmation by EOD Wed, follow up.",
      sourceType: "email", sourceId: "19ecc0745b207f8b",
      sourceName: "Brighton Park Capital",
      sourceLink: "https://mail.google.com/mail/u/0/#inbox/19ecc0745b207f8b",
      sender: "efischgrund@bpc.com", priority: "low", confidence: 0.75,
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t as any });
  }

  // Restore streak
  await prisma.streak.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", currentDays: 1, longestDays: 1, lastActiveAt: new Date() },
    update: { lastActiveAt: new Date() },
  });

  console.log(`Seeded ${tasks.length} real tasks from Gmail + Granola (June 15, 2026).`);
  console.log("Sources: 9 emails, 2 Granola meetings");
}

main().finally(() => prisma.$disconnect());
