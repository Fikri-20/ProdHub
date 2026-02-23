# TICKET-001: API Endpoints (heartbeat, query, summary, categories CRUD)

## Status: `approved`
## Priority: P0

## Summary
Build the four core API endpoint groups that power the tracker-to-API pipeline: heartbeat ingestion, event querying with filters, summary aggregation, and categories CRUD management.

## Spec Reference
- Spec: /specs/001-api-endpoints.md

## Requirements
1. [x] POST /api/events/heartbeat — ingest activity events with device upsert
2. [x] GET /api/events — query events with date range, app filter, pagination
3. [x] GET /api/summary — aggregate durations grouped by app or category
4. [x] CRUD /api/categories — create, read, update, delete categories
5. [x] Prisma client singleton to avoid connection pool exhaustion
6. [x] Manual input validation (Zod deferred to TICKET-002)
7. [x] Integration tests for all endpoints

## Acceptance Criteria
- [x] POST /api/events/heartbeat creates event and upserts device, returns 201
- [x] POST /api/events/heartbeat returns 400 for missing/invalid fields
- [x] GET /api/events returns filtered, paginated results with device info
- [x] GET /api/events defaults to last 24h, limit 100
- [x] GET /api/categories lists all categories
- [x] POST /api/categories creates category, returns 201
- [x] POST /api/categories returns 409 for duplicate name
- [x] GET /api/categories/:id returns single category
- [x] PATCH /api/categories/:id updates category fields
- [x] DELETE /api/categories/:id deletes category and cascades assignments
- [x] GET /api/summary?groupBy=app returns aggregated durations per app
- [x] GET /api/summary?groupBy=category returns aggregated durations per category
- [x] All endpoints have integration tests passing (36 tests)

## Dependencies
- Depends on: Phase 2.1 (Fastify server), Phase 2.2 (PostgreSQL + Prisma)
- Blocks: TICKET-002 (Zod validation), TICKET-003 (categorization engine), TICKET-004 (tracker migration)

## Review Report
- Review: /reviews/REVIEW_001.md

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-02-23 | — | draft | Claude | Ticket created |
| 2026-02-23 | draft | implementing | Claude | Implementation started |
| 2026-02-23 | implementing | implemented | Claude | All 36 tests passing, ready for review |
| 2026-02-23 | implemented | review-failed | Codex | See /reviews/REVIEW_001.md (non-atomic device upsert, summary edge-case mismatch) |
| 2026-02-24 | review-failed | implemented | Claude | Fixed: atomic device upsert via compound unique + prisma.upsert, category summary HAVING clause filters zero-duration rows, added tests (40 total passing) |
| 2026-02-24 | implemented | approved | Codex | See /reviews/REVIEW_001_R2.md — all issues resolved |
