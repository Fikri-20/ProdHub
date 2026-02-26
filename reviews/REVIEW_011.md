# Review Report: TICKET-011 - Summary View (Pie Chart + Bar Chart)

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [ ] Linked spec file exists: Not met - `/specs/011-summary-view.md` is missing.
- [x] Summary page route and data fetch: Met - `/dashboard/summary` fetches `/api/summary` by range/group.
- [x] Pie and bar chart components: Met - Recharts components are integrated and rendered.
- [x] Group-by/date controls and loading/empty/error states: Met - implemented in page and support components.

## Test Coverage

- Tests/build run:
- `pnpm.cmd test` (web) - 5 passed, 0 failed (API client only).
- `pnpm.cmd build` (web) - passed.
- `pnpm.cmd lint` (web) - failed (pre-existing lint errors in web test file).
- Gap: No automated tests were added for summary page/chart behavior in this ticket scope.

## Issues Found

### Issue 1: Missing required spec artifact for this ticket

- Severity: major
- File: tickets/TICKET-011.md
- Line(s): No linked spec path; `/specs/011-summary-view.md` is absent.
- Problem: Required spec-first workflow is not satisfied.
- Suggested fix: Add and link the ticket spec, then rerun review.

### Issue 2: Summary feature shipped without dedicated automated tests

- Severity: major
- File: web/src/app/dashboard/summary/page.tsx
- Line(s): 1+
- Problem: No summary-specific tests were added for groupBy/range behavior, chart data rendering, or empty/error states.
- Suggested fix: Add tests for summary query construction, state rendering, and chart input mapping.

## Security Check

- [x] No exposed secrets
- [x] No direct injection risk in reviewed UI code
- [x] Existing API auth boundary remains server-side

## Summary

Feature builds and appears functional, but approval is blocked by missing spec documentation and missing summary test coverage.
