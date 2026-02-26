# Review Report: TICKET-012 - GitHub-style Activity Heatmap

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [ ] Linked spec file exists: Not met - `/specs/012-heatmap.md` is missing.
- [x] Backend route and query schema implemented: Met.
- [x] Frontend heatmap page/grid/types implemented: Met.
- [x] Dashboard nav integration implemented: Met.

## Test Coverage

- Tests/build run:
- `pnpm.cmd test` (repo root) - 114 passed, 0 failed.
- `pnpm.cmd build` (repo root) - passed.
- `pnpm.cmd test` (web) - 5 passed, 0 failed.
- `pnpm.cmd build` (web) - passed.
- `pnpm.cmd lint` (web) - failed.
- Missing coverage:
- No backend tests for `/api/heatmap`.
- No frontend tests for `heatmap-utils` or heatmap UI states.

## Issues Found

### Issue 1: Missing required spec artifact for this ticket

- Severity: major
- File: tickets/TICKET-012.md
- Line(s): 1
- Problem: Required spec-driven workflow is incomplete because the ticket has no linked spec file under `/specs`.
- Suggested fix: Add `/specs/012-heatmap.md`, link it in the ticket, then rerun review.

### Issue 2: New heatmap feature has no automated tests

- Severity: major
- File: src/routes/heatmap.ts:1
- File: web/src/lib/heatmap-utils.ts:1
- Problem: Backend route behavior and frontend heatmap mapping/rendering were added without dedicated tests.
- Suggested fix: Add backend integration tests for `/api/heatmap` and frontend/unit tests for heatmap data shaping/render states.

### Issue 3: Lint rule violation in loading skeleton

- Severity: major
- File: web/src/app/dashboard/heatmap/loading.tsx:15
- Problem: `Math.random()` is called during render, violating React purity rule (`react-hooks/purity`) and failing CI lint.
- Suggested fix: Replace runtime randomness with deterministic values pre-defined in data/constants.

## Security Check

- [x] No exposed secrets
- [x] Query remains user-scoped (`request.userId`)
- [x] No injection vulnerabilities observed (parameterized SQL template)

## Summary

Heatmap functionality is largely implemented and builds, but approval is blocked by missing spec, missing tests, and a failing lint error.
