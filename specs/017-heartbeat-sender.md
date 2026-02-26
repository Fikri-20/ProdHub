# Spec: Desktop Heartbeat Sender via API Key

> Ticket: TICKET-017 | Status: final

## Problem Statement

The Electron tray shell exists, but it does not yet track active windows or send heartbeats to the hosted API. Without this, the desktop agent provides no activity data.

## User Stories

### Story 1

As a desktop user, I want the tray agent to send heartbeat events to the API with my API key, so that my activity appears in the dashboard.

## Functional Requirements

### FR-1: Active Window Polling

- Description: Poll the current active window at a fixed interval.
- Input: Runtime timer ticks.
- Output: Window sessions are tracked by app and title.
- Constraints: Default interval is 5 seconds.

### FR-2: Heartbeat Session Flush

- Description: On window change and shutdown, flush prior session as a heartbeat payload.
- Input: Previous session data and current timestamp.
- Output: `POST /api/events/heartbeat` request payload.
- Constraints: Payload must include `deviceName`, `os`, `appName`, `windowTitle`, `startTime`, `endTime`, `duration`.

### FR-3: API Key Authentication

- Description: Send Bearer auth header when API key is configured.
- Input: `TRACKER_API_KEY` environment variable.
- Output: `Authorization: Bearer <key>` header.
- Constraints: No auth header when key is missing.

### FR-4: API Endpoint Configuration

- Description: Read API base URL from environment for hosted SaaS compatibility.
- Input: `TRACKER_API_URL` environment variable.
- Output: Requests target `${TRACKER_API_URL}/api/events/heartbeat`.
- Constraints: Default `http://localhost:3000`.

### FR-5: Graceful Shutdown Flush

- Description: Stop polling and flush the current session before app exit.
- Input: App quit lifecycle event.
- Output: Final heartbeat attempt before process exits.
- Constraints: Must not create any window.

## Non-Functional Requirements

- Reliability: Poll loop must avoid overlapping async polls.
- Security: API key is read from env only and never logged.
- Testability: Heartbeat logic and sender behavior are unit-tested without launching Electron.

## Edge Cases

1. `activeWindow()` returns `null` for a poll tick.
2. Window switches quickly and yields near-zero duration.
3. API request fails with network error or non-2xx response.

## Out of Scope

- Auto-start registration (TICKET-018).
- Expanded tray controls (TICKET-019).
- Installer/distribution concerns (TICKET-020).

## Success Criteria

1. Desktop app polls active window and sends heartbeats on session changes.
2. Bearer token header is attached when `TRACKER_API_KEY` exists.
3. Final session is flushed on quit attempt.
4. Unit tests cover heartbeat state transitions and sender headers.
