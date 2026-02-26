# TICKET-018: Auto-Start on OS Login

**Status:** `implemented`
**Phase:** 5 - Desktop Agent (Electron)
**Depends on:** TICKET-016

## Description

Configure the Electron desktop agent to auto-start on OS login for supported platforms.

## Acceptance Criteria

- [x] Add auto-start configuration module for Electron login items
- [x] Default auto-start enabled when no env override is provided
- [x] Support `TRACKER_AUTO_START` env toggle (`false`/`0` disables)
- [x] Skip unsupported platforms safely
- [x] Avoid configuring login items in dev by default (`app.isPackaged` guard)
- [x] Support dev override with `TRACKER_AUTOSTART_ALLOW_DEV=true`
- [x] Wire auto-start configuration into desktop startup
- [x] Add unit tests for parser and configuration behavior
- [x] Update `PLAN.md` status for TICKET-018

## Files Created

- `specs/018-auto-start.md`
- `src/desktop/auto-start.ts`
- `src/tests/desktop/auto-start.test.ts`

## Files Modified

- `src/desktop/main.ts`
- `PLAN.md`

## Status History

| Date       | From      | To           | By    | Notes |
| ---------- | --------- | ------------ | ----- | ----- |
| 2026-02-26 | draft     | specified    | Codex | Added auto-start spec in `specs/018-auto-start.md`. |
| 2026-02-26 | specified | planned      | Codex | Confirmed implementation approach with isolated, testable login-item logic. |
| 2026-02-26 | planned   | implementing | Codex | Started implementation. |
| 2026-02-26 | implementing | implemented | Codex | Added auto-start module, startup wiring, and desktop tests. |
