# ActionHQ — Claude Project Guide

AI-powered daily command center. Reads yesterday's Gmail + Granola meeting notes, extracts action items using Claude, and presents them in a prioritized dashboard. Local-first — SQLite on your machine, no cloud sync.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3` |
| AI | Claude `claude-sonnet-4-6` via `@anthropic-ai/sdk` |
| Animations | Framer Motion |
| State | Zustand (`store/useTaskStore.ts`) |
| Icons | Lucide |

---

## Commands

```bash
npm run dev                # dev server on localhost:3000
npm run build              # production build (catches TS errors)
npx tsx scripts/seed.ts    # seed 11 sample tasks for dev
npx prisma migrate dev     # apply schema changes
npx prisma studio          # GUI for inspecting the SQLite DB
```

Always run `npm run build` before committing. Zero TypeScript errors is the bar — no exceptions.

---

## Project layout

```
app/
  api/
    tasks/route.ts          # GET all tasks, POST new task
    tasks/[id]/route.ts     # PATCH (update), DELETE
    sync/route.ts           # POST — receives email+meeting data, runs AI extraction
    briefing/route.ts       # GET — AI daily summary (cached per day in DailySummary)
    search/route.ts         # GET ?q= — NL search via Claude, fallback substring
    streak/route.ts         # GET streak, POST to increment

  page.tsx                  # Main dashboard (client component)
  layout.tsx                # Root layout — Inter font, Toaster

components/
  dashboard/
    DailyBriefing.tsx       # AI briefing card with skeleton loader
    FocusStats.tsx          # 4 stat cards + progress ring + streak
    SearchBar.tsx           # Debounced NL search (500ms)
    AddTaskButton.tsx       # Modal for manual task creation
  tasks/
    TaskCard.tsx            # Full task card — complete/snooze/edit/false-positive
    TaskList.tsx            # Filtered + sorted list with confetti on inbox zero
  sync/
    SyncPanel.tsx           # Collapsible panel — triggers /api/sync

lib/
  prisma.ts                 # Prisma singleton with better-sqlite3 adapter
  anthropic.ts              # extractTasksFromText, generateDailyBriefing, searchTasksNaturalLanguage
  useDebounce.ts            # Generic debounce hook

services/
  gmail.ts                  # buildGmailQuery(), parseThreadForExtraction()
  granola.ts                # isYesterday(), buildMeetingContext()

store/
  useTaskStore.ts           # Zustand — all task state + fetch/update/sync calls

types/index.ts              # Task, DailySummary, Streak, SyncResult
scripts/seed.ts             # Dev seeding with sample tasks (fake data, dev only)
```

---

## Data model

**Task** — core entity
`id · title · description · sourceType (email|meeting|manual) · sourceId · sourceName · sourceLink · sender · priority (urgent|high|medium|low) · status (pending|completed|snoozed|dismissed) · snoozedUntil · confidence · falsePositive · feedbackReason · notes · dueDate · completedAt · createdAt · updatedAt`

**Feedback** — one record per false-positive flagging  
`id · taskId · originalText · feedbackType · reason · createdAt`

**DailySummary** — one row per calendar day (YYYY-MM-DD key)  
`date · totalTasks · completedTasks · urgentTasks · topThemes (JSON) · generatedSummary`

**Streak** — single row, id="singleton"  
`currentDays · longestDays · lastActiveAt`

**FeedbackPattern** — aggregate of false-positive reasons (AI memory)  
`pattern · count · sourceType`

---

## Prisma 7 gotchas

- **Requires adapter** — `new PrismaClient()` with no args throws. Always use:
  ```ts
  import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
  const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" } as any);
  new PrismaClient({ adapter } as any)
  ```
- **No `url` in schema.prisma** — connection URL lives in `prisma.config.ts`, not the schema. The datasource block just has `provider = "sqlite"`.
- **DB location** — `prisma/dev.db`. Never commit it (gitignored). Migrations in `prisma/migrations/` ARE committed.

---

## AI extraction flow

`/api/sync` receives `{ emails[], meetings[] }` from the client, then:
1. Fetches top 20 `FeedbackPattern` records (AI memory of past false positives)
2. For each email/meeting, calls `extractTasksFromText()` with content + pattern context
3. Claude returns JSON array of `{ title, description, priority, confidence, dueDate? }`
4. Each item is written to Task table with `sourceId` deduplication
5. `DailySummary` is upserted for today

`/api/briefing` caches its result in `DailySummary.generatedSummary` for the day — won't call Claude again until tomorrow.

---

## Priority sort order

Tasks sorted **urgent → high → medium → low**, then newest-first within each tier. Sort happens in-memory in `app/api/tasks/route.ts` after the DB query (SQLite can't sort by custom rank natively).

---

## MCP integration in Claude Code sessions

Gmail MCP ID: `mcp__aedc8278-7245-4dfc-950c-6fcaaead1a80`  
Granola MCP ID: `mcp__1d2927ea-29f1-4296-8cbf-15965b322be7`

**To do a real sync from a Claude Code session:**
1. `search_threads` with `after:YYYY/MM/DD before:YYYY/MM/DD -category:promotions -category:social in:inbox`
2. `get_thread` for each relevant thread ID (full body)
3. `list_meetings` with `time_range: "this_week"` then filter by date
4. `get_meetings` with yesterday's meeting IDs
5. Extract tasks (Claude does this inline or via `/api/sync`)
6. `POST /api/tasks` for each extracted task

---

## False positive feedback loop

1. User marks task as "Not an action item" with a reason
2. `PATCH /api/tasks/:id` sets `{ falsePositive: true, feedbackReason }`
3. `Feedback` row created; `FeedbackPattern` upserted
4. Next sync: top 20 patterns injected into extraction prompt as "avoid these"

---

## Streak logic

`POST /api/streak` called on every `completeTask()`:
- Same day → no change
- Yesterday → `currentDays++`
- Older than yesterday → reset to 1

---

## Design system

- Purple/indigo primary, per-priority accents: red (urgent), orange (high), blue (medium), slate (low)
- Gradient mesh background via `.gradient-mesh` in `globals.css`
- `.glass` — backdrop-blur + white/70 bg for briefing card
- `.card-hover` — lift + shadow on hover
- Confetti from `canvas-confetti` fires when pending hits 0
- Toasts via `sonner`, bottom-right, richColors

---

## Known gotchas

- **`scripts/seed.ts`** uses `PrismaBetterSqlite3` directly, not the Next.js singleton — it runs outside the Next.js runtime
- **Briefing caches per day** — delete today's `DailySummary` row in Prisma Studio to regenerate
- **Snooze un-snooze on GET** — `GET /api/tasks` auto-flips expired snoozed tasks back to pending. No cron needed.
- **Search fallback** — if `ANTHROPIC_API_KEY` is absent, search falls back to SQLite `contains` substring match
- **`date-fns` for snooze dates** — use `addDays`, `nextMonday`, `format`. Don't use raw Date arithmetic.
- **Task deduplication** — done via `sourceId` uniqueness check in `/api/sync`. Same email thread won't generate duplicate tasks across multiple syncs.
