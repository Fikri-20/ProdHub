# TICKET-010: Timeline View

**Phase:** 4 — Next.js Dashboard
**Status:** `implemented`
**Depends On:** TICKET-009

## Description

Wire up the Timeline View on the dashboard — a vertical timeline of activity events, color-coded by category, with date range filtering. Uses Server Components for data fetching via `apiClient()`.

## Scope

1. **Dashboard page** — Replaced placeholder with Server Component that fetches events via `apiClient('/api/events?from=...&to=...')` based on `searchParams.range` preset.
2. **Date range picker** — `DateRangePicker` renders preset buttons (Today, Yesterday, 7d, 30d), updates URL `?range=` param.
3. **Timeline rendering** — Events grouped by day via `groupEventsByDay()`, rendered with `TimelineList` and `TimelineEventCard` components (scaffolded in TICKET-009).
4. **Loading skeleton** — `loading.tsx` shows animated skeleton matching timeline card layout while Server Component fetches data.
5. **Error handling** — Caught fetch errors display inline error banner.

## Files Modified/Created

| File | Action |
|------|--------|
| `web/src/app/dashboard/page.tsx` | Modified — Server-side event fetching + timeline rendering |
| `web/src/app/dashboard/loading.tsx` | Created — Skeleton loading state |
| `tickets/TICKET-010.md` | Created — This ticket |
| `PLAN.md` | Modified — Marked TICKET-010 complete |
| `CLAUDE.md` | Modified — Updated progress |

## Acceptance Criteria

- [x] Dashboard page fetches events server-side using `apiClient()`
- [x] Date range picker filters events by preset (today, yesterday, 7d, 30d)
- [x] Events grouped by day and rendered as color-coded timeline cards
- [x] Loading skeleton displays while data is being fetched
- [x] Empty state shown when no events match the selected range
- [x] Error state shown when API request fails
- [x] `pnpm build` in `web/` compiles without errors
