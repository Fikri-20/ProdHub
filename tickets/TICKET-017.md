# TICKET-017: Heartbeat Sender - POST to Hosted API via API Key

**Status:** `implemented`
**Phase:** 5 - Desktop Agent (Electron)
**Depends on:** TICKET-016

## Description

Implement active-window polling and heartbeat posting in the Electron tray agent, authenticated via API key.

## Acceptance Criteria

- [x] Poll active window every 5s in desktop runtime
- [x] Detect window changes and flush prior session heartbeat
- [x] Send `POST /api/events/heartbeat` payload with required fields
- [x] Use `TRACKER_API_URL` with localhost default
- [x] Attach Bearer token from `TRACKER_API_KEY` when present
- [x] Flush final session on desktop app shutdown
- [x] Add unit tests for sender and polling/session logic
- [x] Update `PLAN.md` status for TICKET-017

## Files Created

- `specs/017-heartbeat-sender.md`
- `src/desktop/heartbeat-agent.ts`
- `src/desktop/heartbeat-sender.ts`
- `src/tests/desktop/heartbeat-agent.test.ts`
- `src/tests/desktop/heartbeat-sender.test.ts`

## Files Modified

- `src/desktop/main.ts`
- `PLAN.md`

## Status History

| Date       | From        | To           | By    | Notes |
| ---------- | ----------- | ------------ | ----- | ----- |
| 2026-02-26 | draft       | specified    | Codex | Added heartbeat sender spec in `specs/017-heartbeat-sender.md`. |
| 2026-02-26 | specified   | planned      | Codex | Confirmed implementation approach with testable polling/sender modules. |
| 2026-02-26 | planned     | implementing | Codex | Started implementation. |
| 2026-02-26 | implementing | implemented | Codex | Added desktop heartbeat polling/sender modules, main-process wiring, and tests. |
