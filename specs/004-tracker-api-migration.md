# Spec: Tracker API Migration

> Ticket: TICKET-004 | Status: final

## Problem Statement

The desktop tracker currently writes activity events directly to a local SQLite database (`database.ts`). For the hosted SaaS model, the tracker must instead send heartbeats to the cloud API so data is centralized and accessible via the web dashboard.

## User Stories

### Story 1

As a user running the desktop tracker, I want my activity data sent to the cloud API automatically, so I can view it in the web dashboard from any device.

### Story 2

As a user, I want the tracker to keep running even if the API is temporarily unavailable, so I don't lose tracking continuity.

## Functional Requirements

### FR-1: HTTP Heartbeat

- Description: Replace SQLite writes with HTTP POST to `/api/events/heartbeat`.
- Input: Active window data (appName, windowTitle) + auto-detected device info (hostname, OS).
- Output: Heartbeat sent to API on each window change.
- Constraints: Uses native `fetch()` (Node.js 18+). No new dependencies.

### FR-2: Device Auto-Detection

- Description: Automatically populate `deviceName` and `os` from the system.
- Input: `os.hostname()` for device name, `os.platform()` mapped to human-readable OS name.
- Output: Consistent device identity across heartbeats.

### FR-3: Session-Based Heartbeats

- Description: Send one heartbeat per window session (when the user switches apps), not on every poll.
- Input: 5-second poll detects window change.
- Output: POST with `startTime`, `endTime`, `duration` for the completed session.
- Constraints: First poll does not send a heartbeat (no previous session).

### FR-4: Graceful Shutdown

- Description: On SIGINT/SIGTERM, send the final heartbeat for the current session before exiting.
- Constraints: Use a reasonable timeout (5s) to avoid hanging.

### FR-5: Error Resilience

- Description: HTTP errors (network failure, API down, 5xx) must not crash the tracker.
- Output: Errors logged to console.
- Constraints: No retry queue in this ticket (deferred to Phase 5 Electron agent).

### FR-6: Configuration

- Description: API base URL configurable via `TRACKER_API_URL` env var.
- Default: `http://localhost:3000`.

## Non-Functional Requirements

- No new npm dependencies required (native fetch + os module).
- Tracker must remain a lightweight long-running process.
- Backward compatibility: SQLite files kept but not imported.

## Edge Cases

1. Tracker starts with no API running → logs error, continues polling.
2. API goes down mid-session → heartbeat fails, error logged, next heartbeat retried normally.
3. Very short sessions (<5s) → still sent as heartbeat with duration 0.
4. Same app, different window title → treated as different session (window change detected).

## Out of Scope

- Offline queue / retry with backoff (deferred to Electron agent, TICKET-016+).
- API key authentication (deferred to TICKET-006).
- SQLite file cleanup/deletion.

## Success Criteria

1. Running `pnpm dev` sends heartbeats to the local API.
2. Events appear in `GET /api/events` with correct device, app, and duration data.
3. Tracker survives API downtime without crashing.
4. Existing API tests pass without regression.
