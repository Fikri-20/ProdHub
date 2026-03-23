# TICKET-004: Migrate Tracker to POST Heartbeats to API

## Status: `implemented`

## Priority: P0

## Summary

Migrate the desktop activity tracker from writing directly to SQLite (`database.ts`) to sending HTTP heartbeats to the Fastify API (`POST /api/events/heartbeat`). The tracker becomes a thin client that detects the active window and reports to the cloud API.

## Spec Reference

- Spec: /specs/004-tracker-api-migration.md

## Requirements

1. [x] Replace SQLite writes with `fetch()` calls to `POST /api/events/heartbeat`
2. [x] Auto-detect device info using `os.hostname()` and `os.platform()`
3. [x] Send heartbeat with full session data when active window changes
4. [x] Graceful shutdown: POST final heartbeat on SIGINT/SIGTERM
5. [x] Error handling: log HTTP errors without crashing
6. [x] Read `TRACKER_API_URL` from environment (default: `http://localhost:3000`)

## Acceptance Criteria

- [x] Tracker no longer imports or uses `database.ts` / SQLite
- [x] Heartbeat events appear in PostgreSQL via the API
- [x] Device is auto-created with correct hostname and OS
- [x] Switching apps generates a heartbeat for the previous session
- [x] Tracker survives API downtime without crashing
- [x] Ctrl+C sends the final heartbeat before exit

## Dependencies

- Depends on: TICKET-001 (API endpoints)
- Blocks: TICKET-016 (Electron tray app)

## Review Report

- Review: /reviews/REVIEW_004.md

## Status History

| Date       | From         | To           | By          | Notes                                                  |
| ---------- | ------------ | ------------ | ----------- | ------------------------------------------------------ |
| 2026-02-24 | —            | draft        | Antigravity | Ticket created from PLAN scope                         |
| 2026-02-24 | draft        | implementing | Antigravity | Tracker rewritten to use HTTP heartbeats               |
| 2026-02-24 | implementing | implemented  | Antigravity | All requirements complete, TypeScript compiles cleanly |
| 2026-02-25 | implemented  | review-failed | Codex      | See /reviews/REVIEW_004.md (duration=0 contract mismatch, no shutdown timeout guard) |
