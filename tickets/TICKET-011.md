# TICKET-011: Summary View (Pie Chart + Bar Chart)

**Status:** `review-failed`
**Phase:** 4 — Next.js Dashboard
**Depends on:** TICKET-009, TICKET-010

## Description

Add a Summary View page at `/dashboard/summary` that displays activity duration data as a pie chart and horizontal bar chart, grouped by application or category, with date range filtering.

## Acceptance Criteria

- [x] Recharts installed as dependency
- [x] Summary types defined (`SummaryItem`, `SummaryGroupBy`)
- [x] Pie chart component showing distribution with custom tooltips
- [x] Bar chart component showing durations with custom tooltips
- [x] Group-by toggle (By App / By Category) using URL search params
- [x] Date range picker reused from timeline view
- [x] Server Component page fetching from `GET /api/summary`
- [x] Empty state when no data
- [x] Error state on fetch failure
- [x] Loading skeleton
- [x] Summary link added to dashboard sidebar

## Files Created

- `web/src/types/summary.ts`
- `web/src/components/summary/summary-pie-chart.tsx`
- `web/src/components/summary/summary-bar-chart.tsx`
- `web/src/components/summary/group-by-toggle.tsx`
- `web/src/app/dashboard/summary/page.tsx`
- `web/src/app/dashboard/summary/loading.tsx`

## Files Modified

- `web/src/app/dashboard/layout.tsx` — added Summary nav link
- `web/package.json` — added recharts dependency

## Review Report

- Review: /reviews/REVIEW_011.md

## Status History

| Date       | From        | To            | By    | Notes |
| ---------- | ----------- | ------------- | ----- | ----- |
| 2026-02-25 | implemented | review-failed | Codex | See /reviews/REVIEW_011.md (missing spec + missing summary tests) |
