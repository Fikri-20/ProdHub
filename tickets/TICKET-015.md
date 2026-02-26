# TICKET-015: TanStack Query for All Data Fetching

**Status:** `implemented`
**Phase:** 4 - Next.js Dashboard
**Depends on:** TICKET-009, TICKET-010, TICKET-011, TICKET-012, TICKET-013, TICKET-014

## Description

Integrate TanStack Query across dashboard data-fetching flows so timeline, summary, heatmap, categories, and live-status polling use a shared query client with query/mutation patterns instead of ad-hoc fetch logic.

## Acceptance Criteria

- [x] Add `@tanstack/react-query` dependency
- [x] Add `QueryClientProvider` in app providers
- [x] Replace timeline page fetch with `useQuery`
- [x] Replace summary page fetch with `useQuery`
- [x] Replace heatmap page fetch with `useQuery`
- [x] Replace categories fetch + CRUD state updates with `useQuery` + `useMutation`
- [x] Replace live-status polling fetch loop with TanStack Query refetch interval
- [x] Extract shared query functions and keys for dashboard data
- [x] Keep existing UI states (loading, empty, error) intact

## Files Created

- `web/src/hooks/use-authed-client-api.ts`
- `web/src/lib/dashboard-queries.ts`

## Files Modified

- `web/package.json`
- `web/pnpm-lock.yaml`
- `web/src/app/providers.tsx`
- `web/src/app/dashboard/page.tsx`
- `web/src/app/dashboard/summary/page.tsx`
- `web/src/app/dashboard/heatmap/page.tsx`
- `web/src/app/dashboard/categories/page.tsx`
- `web/src/app/dashboard/layout.tsx`
- `web/src/components/categories/category-manager.tsx`
- `web/src/components/live-status/live-status-indicator.tsx`
- `web/src/app/dashboard/loading.tsx`
- `web/src/app/dashboard/summary/loading.tsx`
- `web/src/app/dashboard/heatmap/loading.tsx`

## Status History

| Date       | From  | To          | By    | Notes |
| ---------- | ----- | ----------- | ----- | ----- |
| 2026-02-26 | draft | implemented | Codex | Integrated TanStack Query for dashboard data fetching and mutations |
