# TICKET-014: Live Status Indicator

**Status:** `implemented`
**Phase:** 4 — Next.js Dashboard
**Depends on:** TICKET-009

## Description

Add a live status indicator in the dashboard header that polls every 10s to show the user's current/latest activity. Includes a new backend endpoint and a client-side polling component.

## Acceptance Criteria

- [x] `GET /api/events/latest` endpoint returns most recent event (or 204)
- [x] `formatRelativeTime()` utility in timeline-utils
- [x] `LiveStatusIndicator` client component with 10s polling
- [x] Displays color dot (from category), app name, and relative time
- [x] Shows "No recent activity" when no events or event older than 1h
- [x] Integrated in dashboard header (left side)
- [x] SSR initial data passed from layout server component
- [x] Backend and frontend build successfully

## Files Changed

- `src/routes/events.ts` — added `GET /latest` route
- `web/src/lib/timeline-utils.ts` — added `formatRelativeTime()`
- `web/src/components/live-status/live-status-indicator.tsx` — new component
- `web/src/app/dashboard/layout.tsx` — integrated status indicator in header
