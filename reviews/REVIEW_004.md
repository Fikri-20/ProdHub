# Review Report: TICKET-004 - Migrate Tracker to POST Heartbeats to API

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [x] FR-1 HTTP heartbeat via `fetch()`: Met.
- [x] FR-2 Device auto-detection (`hostname` + platform mapping): Met.
- [x] FR-3 Session flush on window change: Met.
- [ ] FR-4 Graceful shutdown timeout (5s): Not met.
- [x] FR-5 Error resilience (no crash on network/API errors): Met.
- [x] FR-6 `TRACKER_API_URL` config with localhost default: Met.

## Test Coverage

- Tests run: `pnpm.cmd test` (repo root) - 114 passed, 0 failed.
- Build run: `pnpm.cmd build` (repo root) - passed.
- Gap: No tracker-specific automated tests were added for this migration path.

## Issues Found

### Issue 1: Tracker can emit `duration=0`, but API schema rejects it

- Severity: major
- File: src/tracker.ts:78
- File: src/schemas/events.ts:15
- Problem: Tracker computes `duration` with `Math.max(0, ...)`, so very short sessions can produce `0`. The heartbeat schema enforces `.positive()`, rejecting `0`. This contradicts the spec edge case for short sessions.
- Suggested fix: Align tracker/API contract to accept zero-duration sessions (or guarantee tracker never sends zero).

### Issue 2: Graceful shutdown has no timeout guard

- Severity: major
- File: src/tracker.ts:130
- Problem: Shutdown awaits `flushSession()` directly with no timeout/abort behavior. If request hangs, shutdown can block indefinitely.
- Suggested fix: Add an explicit timeout (spec calls for ~5s) around final heartbeat send before exit.

## Security Check

- [x] No exposed secrets
- [x] Input validation present on API side
- [x] No injection vulnerabilities observed in this ticket scope

## Summary

Core migration is implemented, but two spec-critical behaviors remain unresolved: zero-duration heartbeat handling and bounded shutdown timeout.
