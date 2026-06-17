# ActionHQ — session memory

## Project
Local-first AI action item dashboard for Neha (neha.monga@gmail.com).
Reads Gmail + Granola via MCP, extracts tasks with Claude, serves them in a polished Next.js dashboard.
Repo: https://github.com/nehamo-dev/action-hq
Dev server: localhost:3000 (`npm run dev` in /Users/nemo/ClaudeCode/action-hq)

## MCP server IDs (as of 2026-06-16)
- Gmail MCP:   mcp__aedc8278-7245-4dfc-950c-6fcaaead1a80
- Granola MCP: mcp__1d2927ea-29f1-4296-8cbf-15965b322be7

## Database
SQLite at prisma/dev.db (gitignored).
Inspect: `npx prisma studio`
Seed real tasks: `npx tsx scripts/seed-real.ts`
Seed fake tasks: `npx tsx scripts/seed.ts`

## Critical Prisma 7 gotcha
Bare `new PrismaClient()` throws. Must use adapter:
  import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
  const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" } as any);
  new PrismaClient({ adapter } as any)

## ANTHROPIC_API_KEY
Stored in .env.local (not committed). Without it:
- Briefing shows fallback text (not 500)
- Search falls back to substring match
- /api/sync returns 0 tasks (extraction skipped)

## To regenerate AI briefing during dev
Delete today's DailySummary row in Prisma Studio, then reload.

## User context (important for AI extraction quality)
- Active job search: Monzo (next round invited), Workday (interviews Jun 23), Zalando (intro to David pending), Yoodli (spoke with CEO Varun), Brighton Park Capital (call 6/22 1pm PT)
- Buying a house: 935 Sculptor Street, Wendell NC — purchase agreement + title docs in flight, Deepesh (husband) co-buyer
- Podcast: Product Faculty with Moe Ali, June 23 9am PT — "Claude Code for Executives"
- Advisory: Sapia (AI assistant startup, Latin America) — PLG ideas committed
- Side project: Wanderluster (this Claude Code project), Nightly Evals currently failing

## Real sync flow (for future Claude Code sessions)
1. search_threads: `after:2026/06/15 before:2026/06/16 -category:promotions -category:social in:inbox`
2. get_thread for each relevant threadId (get full body)
3. list_meetings: time_range "this_week" or "last_week"
4. Filter meetings where date matches yesterday
5. get_meetings with those IDs to get summaries + notes
6. Extract tasks inline (Claude does this), then POST to /api/tasks or run seed-real.ts

## False positive patterns to train (add as you learn)
- Automated school newsletters from Cedar Crest / KA = NOT action items
- Kayak / travel notifications = NOT action items
- Hyatt / hotel sign-in links = NOT action items
- Fidelity investment alerts = NOT action items
- Tadpoles daycare daily reports = NOT action items
