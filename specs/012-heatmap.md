# Spec: GitHub-style Activity Heatmap

**Ticket:** TICKET-012
**Phase:** 4 — Next.js Dashboard
**Status:** specified

---

## Overview

Add a GitHub-style activity heatmap at `/dashboard/heatmap` showing ~52 weeks of daily activity as a calendar grid. Cell colour intensity is derived from the day's total tracked duration relative to the user's maximum. A new `GET /api/heatmap` endpoint provides the daily-aggregated data, scoped to the authenticated user.

---

## Backend

### Endpoint

`GET /api/heatmap`

**Query params (all optional):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | ISO date string | 1 year ago | Start of date range (inclusive) |
| `to` | ISO date string | tomorrow | End of date range (inclusive) |

**Response:** `200 OK`

```json
[
  { "date": "2025-03-22", "totalDuration": 3600 },
  { "date": "2025-03-23", "totalDuration": 7200 }
]
```

- `date` — `YYYY-MM-DD` string
- `totalDuration` — total seconds tracked that day (integer)
- Days with no activity are omitted (filled in by the frontend)
- Results ordered ascending by date

**Validation (Zod):**

```ts
z.object({
  from: z.coerce.date().optional(),
  to:   z.coerce.date().optional(),
})
```

**SQL query:** raw `$queryRaw` using `DATE(ae.start_time)` grouping, joined to `devices` on `user_id` for tenant isolation.

---

## Frontend

### Types (`web/src/types/heatmap.ts`)

```ts
HeatmapDay   = { date: string; totalDuration: number }
HeatmapLevel = 0 | 1 | 2 | 3 | 4        // 0 = no activity
HeatmapCell  = { date, totalDuration, level, weekIndex, dayOfWeek }
HeatmapGridData = { cells, monthLabels, totalWeeks }
```

### Utility functions (`web/src/lib/heatmap-utils.ts`)

#### `computeLevel(duration, max): HeatmapLevel`

Assigns intensity based on quartile thresholds:

| Condition | Level |
|-----------|-------|
| `duration === 0` or `max === 0` | 0 |
| `ratio ≤ 0.25` | 1 |
| `ratio ≤ 0.50` | 2 |
| `ratio ≤ 0.75` | 3 |
| `ratio > 0.75` | 4 |

Where `ratio = duration / max`.

#### `buildHeatmapGrid(data): HeatmapGridData`

1. Builds a `Map<dateStr, duration>` from the API response.
2. Finds the max duration across all days.
3. Calculates a date range from ~364 days ago (aligned to the previous Sunday) through today.
4. Iterates day-by-day, producing one `HeatmapCell` per day; days absent from the map get `totalDuration = 0` and `level = 0`.
5. Tracks `weekIndex` (increments on each Sunday) and collects `monthLabels` (one per calendar month, at the week index where the month first appears).

#### `formatHeatmapDate(dateStr): string`

Formats a `YYYY-MM-DD` string to a human-readable label (e.g. `"Mon, Mar 22, 2026"`).

### Component (`web/src/components/heatmap/heatmap-grid.tsx`)

- CSS Grid layout: 7 rows (Sun–Sat) × `totalWeeks` columns.
- Month labels row above the grid.
- Day-of-week labels (Mon / Wed / Fri) on the left.
- Each cell is a coloured square (`13×13px`) with Tailwind classes mapping `level → bg-*`.
- Tooltip on hover: `formatHeatmapDate(date)` + formatted duration.
- Legend bar ("Less … More") below the grid.

### Page (`web/src/app/dashboard/heatmap/page.tsx`)

- Server Component; fetches from `GET /api/heatmap` server-side.
- Renders `HeatmapGrid`, or an empty-state message when no data exists.
- Uses Next.js `loading.tsx` for a Suspense skeleton (deterministic, no runtime randomness).

---

## Acceptance Criteria

- [x] `GET /api/heatmap` returns `{ date, totalDuration }[]` aggregated per calendar day, scoped to user
- [x] Invalid `from`/`to` values return `400`
- [x] Empty date range returns `[]`
- [x] Grid renders ~52 weeks with correct day/month alignment
- [x] Intensity levels use quartile-based thresholds (0–4)
- [x] Tooltip shows date and duration on hover
- [x] Loading skeleton uses deterministic values (no `Math.random()`)
- [x] Heatmap link present in dashboard sidebar nav
- [x] Backend integration tests for `/api/heatmap`
- [x] Frontend unit tests for `computeLevel`, `buildHeatmapGrid`, `formatHeatmapDate`
