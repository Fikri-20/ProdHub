# TICKET-012: GitHub-style Activity Heatmap

**Status:** `review-failed`
**Phase:** 4 — Next.js Dashboard
**Depends on:** TICKET-009, TICKET-010

## Description

Add a GitHub-style activity heatmap at `/dashboard/heatmap` showing ~52 weeks of daily activity as a calendar grid with green intensity shading based on duration. Includes a new `GET /api/heatmap` backend endpoint for daily aggregated data.

## Acceptance Criteria

- [x] Zod schema for heatmap query params (from/to dates)
- [x] `GET /api/heatmap` endpoint with daily aggregation SQL, scoped to user
- [x] Returns `{ date, totalDuration }[]` with 1-year default range
- [x] Frontend types (`HeatmapDay`, `HeatmapLevel`, `HeatmapCell`, `HeatmapGridData`)
- [x] Grid builder utility with quartile-based intensity levels (0-4)
- [x] CSS Grid component: 7 rows (days) x ~53 columns (weeks)
- [x] 5 green intensity levels matching GitHub style
- [x] Month labels along top, day labels (Mon/Wed/Fri) on left
- [x] Tooltip on hover showing date + formatted duration
- [x] Legend: "Less" [5 squares] "More"
- [x] Server Component page with error/empty states
- [x] Loading skeleton
- [x] Heatmap link added to dashboard sidebar

## Files Created

- `src/schemas/heatmap.ts`
- `src/routes/heatmap.ts`
- `web/src/types/heatmap.ts`
- `web/src/lib/heatmap-utils.ts`
- `web/src/components/heatmap/heatmap-grid.tsx`
- `web/src/app/dashboard/heatmap/page.tsx`
- `web/src/app/dashboard/heatmap/loading.tsx`

## Files Modified

- `src/server.ts` — registered `/api/heatmap` route
- `web/src/app/dashboard/layout.tsx` — added Heatmap nav link

## Review Report

- Review: /reviews/REVIEW_012.md

## Status History

| Date       | From        | To            | By    | Notes |
| ---------- | ----------- | ------------- | ----- | ----- |
| 2026-02-25 | implemented | review-failed | Codex | See /reviews/REVIEW_012.md (missing spec, missing tests, lint failure) |
