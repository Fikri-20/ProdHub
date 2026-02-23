# Review Report: TICKET-001 — API Endpoints (heartbeat, query, summary, categories CRUD)

**Reviewer**: Codex
**Date**: 2026-02-23
**Verdict**: CHANGES_REQUESTED

## Spec Compliance
- [ ] FR-1 (POST `/api/events/heartbeat`): ❌ Not fully met — device handling is a non-atomic `findFirst` + `create` flow and does not enforce a unique `(name, os)` key, so concurrent requests can create duplicates.
- [ ] FR-2 (GET `/api/events`): ✅ Met — supports date filters, app filter, pagination, default range, and sorted results.
- [ ] FR-3 (Categories CRUD): ✅ Met — CRUD endpoints exist, duplicate names return 409, and delete cascades assignments.
- [ ] FR-4 (GET `/api/summary`): ❌ Not fully met — `groupBy=category` can return zero-duration rows when no events exist in range; spec edge case expects an empty array.
- [ ] NFR (Prisma singleton/scalability): ✅ Met — shared Prisma client module is used.

## Test Coverage
- Tests run: `pnpm build` failed before type-check due missing Rollup optional binary (`@rollup/rollup-linux-x64-gnu`); dependency repair attempts were blocked by network (`EAI_AGAIN`).
- Missing coverage:
- No test for concurrent heartbeat ingestion to validate true device upsert behavior.
- No `groupBy=category` test for "no events in range => empty array".
- Edge cases not covered:
- Device uniqueness under concurrent requests.
- Category summary empty-range behavior when categories exist but no matching events.

## Issues Found

### Issue 1: Device upsert is not concurrency-safe
- Severity: major
- File: src/routes/events.ts
- Line(s): ~16
- Problem: The route performs `findFirst` followed by `create` for devices. Without a DB-level unique key on `(name, os)`, concurrent requests can insert duplicates, violating the upsert requirement.
- Suggested fix: Add a compound unique constraint on `(name, os)` at the schema/database level and use a single atomic upsert operation keyed by that constraint; add an integration test that sends concurrent heartbeats for the same device.

### Issue 2: Category summary violates empty-range edge case
- Severity: major
- File: src/routes/summary.ts
- Line(s): ~43
- Problem: The `groupBy=category` query starts from `categories` and left-joins events, which returns categories with `0` duration when no matching events exist. Spec edge case requires returning an empty array when no events are in range.
- Suggested fix: Base aggregation on filtered events (or exclude zero-sum rows via SQL filter) so no-event ranges return `[]`; add a dedicated test for this path.

## Security Check
- [x] No exposed secrets
- [x] Input validation present
- [x] No injection vulnerabilities

## Summary
Core endpoint coverage is strong, but two spec-critical behaviors are not fully compliant: device upsert correctness under concurrency and category summary behavior for empty ranges. Ticket should not be approved until both are addressed and revalidated.
