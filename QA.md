# ActionHQ — QA Checklist

Run before every commit / feature merge.

---

## 1. Build & types

- [ ] `npm run build` exits 0 — zero TypeScript errors
- [ ] No `any` casts added without a comment explaining why
- [ ] No `console.log` left in production code

---

## 2. Core task interactions

### Complete
- [ ] Click the circle on a task → circle fills green, task slides out with animation
- [ ] Task moves to "Done" tab
- [ ] Completed count in stat card increments
- [ ] Inbox Zero Progress ring updates
- [ ] **Confetti fires when the last pending task is completed**

### Snooze
- [ ] Dropdown → "Snooze tomorrow" → toast shows correct date
- [ ] Dropdown → "Snooze next week" → toast shows next Monday
- [ ] Snoozed task disappears from Focus tab
- [ ] Snoozed task appears in Snoozed tab
- [ ] After snooze expires (or manually set `snoozedUntil` to past), task reappears in Focus on next page load

### Edit
- [ ] Edit modal opens with correct pre-filled title + notes
- [ ] Saving updates the card title immediately (optimistic via API round-trip)
- [ ] Cancel closes without changes

### Not an action item
- [ ] Dialog opens with reason chips + free-text field
- [ ] Submit without a reason → error toast, dialog stays open
- [ ] Submit with a reason → task disappears from all lists
- [ ] `falsePositive: true` in DB (verify in Prisma Studio)
- [ ] `Feedback` row created
- [ ] `FeedbackPattern` upserted (count increments on second submission of same reason)

### Delete
- [ ] Task is removed immediately
- [ ] Refreshing the page confirms it's gone from DB

---

## 3. Priority display

- [ ] Urgent tasks have red top accent bar and red `Urgent` badge
- [ ] High tasks have orange `High` badge
- [ ] Medium tasks have blue `Medium` badge
- [ ] Low tasks have grey `Low` badge
- [ ] Stat card "Urgent" count matches actual urgent pending tasks
- [ ] Sort order: urgent first, then high, medium, low within each tab

---

## 4. Stats & streak

- [ ] Urgent / Pending / Snoozed / Completed counts are accurate
- [ ] Inbox Zero Progress % = completed / (pending + completed) × 100
- [ ] Streak card shows correct `currentDays` and `longestDays`
- [ ] Completing a task calls `POST /api/streak` (check Network tab)
- [ ] Streak increments when completing on a new day (manual test: set `lastActiveAt` to yesterday in DB)

---

## 5. Daily briefing

- [ ] Briefing card shows skeleton while loading
- [ ] With `ANTHROPIC_API_KEY` set: real AI summary appears within ~5s
- [ ] Without API key: fallback message "You have N action items waiting. Add your ANTHROPIC_API_KEY…"
- [ ] Themes badges appear below briefing text
- [ ] Second page load same day: briefing loads instantly (cached in `DailySummary`)
- [ ] Motivational tagline rotates by day of week

---

## 6. Search

- [ ] Typing in search bar debounces 500ms before firing
- [ ] With API key: "Tasks from Jessica" returns email-sourced tasks from sender matching Jessica
- [ ] Without API key: plain substring search works (matches title/sender/sourceName)
- [ ] Clearing search (× button) restores full task list
- [ ] No results shows "No results found" empty state
- [ ] Search results respect `falsePositive: false` filter

---

## 7. Sync panel

- [ ] Panel is collapsed by default
- [ ] Clicking header expands with animation
- [ ] Gmail + Granola badges visible in header
- [ ] "Sync now" button shows spinner while syncing
- [ ] With empty data (no MCP): "0 new tasks added" info toast
- [ ] With real data (MCP session): tasks appear in Focus tab after sync
- [ ] No duplicate tasks created when syncing the same source twice (sourceId deduplication)
- [ ] API key missing note is visible in the panel

---

## 8. Add task (manual)

- [ ] "Add task" button opens modal
- [ ] Submit with empty title → button stays disabled
- [ ] Pressing Enter in title field submits
- [ ] All 4 priority levels selectable
- [ ] New task appears at correct priority position in Focus tab
- [ ] `sourceType: "manual"` in DB, `confidence: 1.0`

---

## 9. Tabs

- [ ] Focus tab: only `status: pending`, no false positives
- [ ] All tab: pending + any other non-false-positive status
- [ ] Snoozed tab: only `status: snoozed`
- [ ] Done tab: only `status: completed`
- [ ] Empty state shows correct message per tab (Inbox Zero in Focus, generic in others)

---

## 10. Dark mode

- [ ] Toggle button (moon/sun) in header switches theme
- [ ] All cards, text, badges readable in dark mode
- [ ] Gradient mesh visible in dark mode (subtle dark orbs)
- [ ] Toast notifications legible in dark mode
- [ ] No hardcoded light colors bleeding through (`bg-white` without `dark:bg-*`)

---

## 11. AI extraction quality (after sync with real data)

- [ ] Newsletters / promotional emails NOT extracted as tasks
- [ ] Pure FYI emails NOT extracted
- [ ] "Please reply by Friday" → extracted as `urgent` or `high`
- [ ] "Let me know your thoughts whenever" → extracted as `low`
- [ ] Confidence ≥ 0.8 for clear action items
- [ ] Confidence < 0.6 for borderline items
- [ ] Previously false-positived patterns don't recur on next sync
- [ ] Meeting follow-up commitments extracted with correct meeting name as `sourceName`

---

## 12. API error handling

- [ ] `/api/briefing` without API key → returns graceful fallback JSON (not 500)
- [ ] `/api/search` without API key → falls back to substring, returns results (not 500)
- [ ] `/api/sync` with empty `{ emails: [], meetings: [] }` → returns `{ added: 0, skipped: 0 }`
- [ ] `PATCH /api/tasks/:id` with invalid id → 500 is acceptable, not a hard crash
- [ ] Prisma connection error → server logs it, client shows error toast

---

## 13. Performance

- [ ] Initial page load < 2s on localhost
- [ ] Task list with 50+ items renders without lag
- [ ] Search response < 3s with API key
- [ ] Completing a task feels instant (optimistic UI update before API response)

---

## 14. Regression checklist after each feature

Add a row here whenever a bug is found and fixed:

| Date | Bug | How to test it's fixed |
|---|---|---|
| 2026-06-16 | Prisma 7 requires adapter — bare `new PrismaClient()` throws | `GET /api/tasks` returns JSON, not 500 HTML |
| 2026-06-16 | Priority sort was alphabetical — urgent appeared last | Urgent tasks appear first in Focus tab |
| 2026-06-16 | Briefing 500 when no API key | Page loads with fallback briefing text |
