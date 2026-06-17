# ActionHQ project notes (Claude Code session context)

## MCP server IDs (as of 2026-06-16)
- Gmail MCP: `mcp__aedc8278-7245-4dfc-950c-6fcaaead1a80__*`
- Granola MCP: `mcp__1d2927ea-29f1-4296-8cbf-15965b322be7__*`

## Dev server
- Runs on `localhost:3000` via `npm run dev`
- Launch config: `.claude/launch.json` (added to Wanderluster's launch.json since preview tool reads from there)
- Server ID for preview: `69f5b5dd-edae-45b9-bc72-4a3effabd1c2` (may change between sessions)

## Database
- SQLite at `prisma/dev.db`
- Inspect with: `npx prisma studio`
- Seed with: `npx tsx scripts/seed.ts`
- DB is gitignored — each developer runs migrations fresh

## To re-trigger AI briefing during dev
Delete today's DailySummary row in Prisma Studio, then reload the page.

## Known MCP sync flow
1. Use `mcp__aedc8278-*__search_threads` with `after:YYYY/MM/DD before:YYYY/MM/DD -category:promotions -category:social in:inbox`
2. For each thread ID, call `get_thread` to get full body
3. Use `mcp__1d2927ea-*__list_meetings` with `time_range: "this_week"` or `"last_week"`
4. Filter meetings by date to find yesterday's
5. Call `get_meetings` with their IDs to get notes + summaries
6. POST everything to `/api/sync` with `{ emails: [...], meetings: [...] }`
