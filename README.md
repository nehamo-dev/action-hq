# ActionHQ ⚡

Your AI-powered daily command center. Automatically surfaces action items from yesterday's emails and meetings, so every morning starts with clarity instead of chaos.

## What it does

Every morning, ActionHQ:
1. Reads yesterday's Gmail threads (via Gmail MCP)
2. Reads yesterday's Granola meeting notes (via Granola MCP)
3. Extracts genuine action items using Claude AI
4. Deduplicates and merges similar tasks
5. Prioritizes them (Urgent → High → Medium → Low)
6. Generates a friendly daily briefing with themes

You get one clean inbox to triage, snooze, complete, or dismiss — with a feedback loop that teaches the AI what you consider a real action item.

---

## Features

- **AI Daily Briefing** — A warm summary of your day with top themes
- **Smart Prioritization** — Urgent/High/Medium/Low with confidence scores
- **Task Cards** — Complete ✓, Snooze 😴, Edit ✏️, or mark "Not an action item" 👎
- **Feedback Loop** — The AI learns what's not an action item for you
- **Natural Language Search** — "Tasks from Jessica", "Recruiting emails", etc.
- **Inbox Zero Confetti** 🎉 — Celebration when you clear everything
- **Daily Streak** 🔥
- **Dark Mode** 🌙
- **Gmail + Granola MCP integrations**

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite via Prisma 7 |
| AI | Claude (Anthropic SDK) |
| Animations | Framer Motion |
| State | Zustand |
| Icons | Lucide |

---

## Installation

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/nehamo-dev/action-hq
cd action-hq

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Set up the database
npx prisma migrate dev

# 5. (Optional) Seed sample data
npx tsx scripts/seed.ts

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Your Anthropic API key |
| `DATABASE_URL` | Auto | SQLite path (default: `file:./prisma/dev.db`) |
| `USER_NAME` | No | Your first name for the briefing (default: "Neha") |

---

## MCP Integrations

ActionHQ works with Claude Code's MCP servers.

### Gmail MCP
Reads email threads from yesterday, skipping promotions and newsletters. Claude extracts genuine action items: follow-ups, pending decisions, scheduling tasks, things you promised.

### Granola MCP
Reads meeting notes from yesterday. Claude extracts commitments you made, follow-ups assigned to you, and open questions awaiting your input.

### Without MCP
Add tasks manually via the "Add task" button.

---

## Project structure

```
app/
  api/
    tasks/          # CRUD for tasks
    tasks/[id]/     # Update / delete individual task
    sync/           # AI extraction from email + meeting data
    briefing/       # Daily AI summary
    search/         # Natural language task search
    streak/         # Daily streak tracking
  page.tsx          # Main dashboard

components/
  dashboard/        # DailyBriefing, FocusStats, SearchBar, AddTaskButton
  tasks/            # TaskCard, TaskList
  sync/             # SyncPanel

lib/
  prisma.ts         # Prisma client singleton
  anthropic.ts      # AI helpers: extract tasks, briefing, search

services/
  gmail.ts          # Gmail query builder + thread parser
  granola.ts        # Meeting context formatter

store/
  useTaskStore.ts   # Zustand store

scripts/
  seed.ts           # Seed sample data for development
```

---

## Feedback learning

When you mark a task as "Not an action item":
1. Records the task and your reason in the `Feedback` table
2. Stores a pattern in `FeedbackPattern` with a count
3. On next sync, injects top patterns into the AI prompt so it skips similar items

---

## Roadmap

- [ ] Slack integration
- [ ] Google Calendar integration  
- [ ] Linear / Notion sync
- [ ] Email reply drafting from within the app
- [ ] Weekly review mode
- [ ] Mobile PWA
