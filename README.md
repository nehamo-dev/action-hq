# ActionHQ

**Every promise you made yesterday, waiting for you this morning.**

Yesterday you said "I'll send that over" on three calls, got two emails that quietly needed a decision, and agreed to find a time with someone you've now forgotten about. ActionHQ reads your email and meeting notes overnight, finds the real commitments, and starts your day with one clean list instead of an inbox archaeology dig.

---

## What a morning looks like

1. **Sync.** ActionHQ pulls yesterday's Gmail threads (skipping promotions and newsletters) and yesterday's Granola meeting notes.
2. **Extract.** Claude reads each one for genuine action items: follow-ups you owe, decisions waiting on you, things you promised, scheduling loops to close.
3. **Clean up.** Near-duplicates are merged, so "send the deck to Priya" from the call and from the follow-up email become one task.
4. **Prioritize.** Each task is ranked Urgent, High, Medium or Low, with a confidence score.
5. **Brief.** A short, warm summary of the day and its themes sits at the top.

Then you triage: complete it, snooze it, edit it, or tell it **"Not an action item."**

## It learns what "action item" means to you

That last button is the interesting part. Every dismissal is recorded with its reason and rolled up into patterns with counts. On the next sync, the strongest patterns are injected into the extraction prompt, so ActionHQ stops surfacing the kinds of things you keep throwing away. No fine-tuning, no settings page: you train it just by using it.

## Also

- **Search in plain English.** "Tasks from Jessica", "anything about recruiting".
- **Streaks and inbox zero.** A daily streak, focus stats and a confetti moment when the list hits zero.
- **Dark mode**, and manual "Add task" for anything that didn't come from email or a meeting.

## Under the hood

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS v4 · shadcn/ui · Framer Motion · Lucide |
| State | Zustand |
| Data | SQLite via Prisma 7 (tasks, feedback, learned patterns, streaks) |
| AI | Claude via the Anthropic SDK: Sonnet for extraction and the briefing, Haiku for fast search |
| Sources | Gmail and Granola through MCP |

```
app/api/
  sync/       email + meeting text → Claude → deduped, prioritized tasks
  briefing/   the morning summary
  search/     natural-language task search
  tasks/      CRUD, plus feedback when a task is rejected
  streak/     daily streak
lib/anthropic.ts    extraction, briefing and search prompts
services/           Gmail query builder, Granola formatter
```

## Run it

Requires Node 18+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
git clone https://github.com/nehamo-dev/action-hq
cd action-hq
npm install
cp .env.example .env.local      # add ANTHROPIC_API_KEY (and USER_NAME for the briefing)
npx prisma migrate dev
npx tsx scripts/seed.ts         # optional sample data
npm run dev                     # http://localhost:3000
```

Without MCP connected, you can still add tasks by hand and use everything else.

## Roadmap

- [ ] Slack and Google Calendar as sources
- [ ] Draft email replies from a task
- [ ] Sync to Linear and Notion
- [ ] Weekly review mode
- [ ] Mobile PWA
