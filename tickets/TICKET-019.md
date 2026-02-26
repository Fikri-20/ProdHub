# TICKET-019: Tray Menu - Pause Tracking, Open Dashboard, Settings

**Status:** `implemented`
**Phase:** 5 - Desktop Agent (Electron)
**Depends on:** TICKET-016

## Description

Expand the tray menu with user controls for pausing/resuming tracking and quick links to dashboard/settings.

## Acceptance Criteria

- [x] Tray menu includes pause/resume tracking action
- [x] Tray menu includes read-only tracking status line
- [x] Tray menu includes open dashboard action
- [x] Tray menu includes settings action
- [x] Dashboard/settings URLs are environment-configurable with sensible defaults
- [x] Menu refreshes when tracking state changes
- [x] Errors from external URL opens are logged without crashing
- [x] Unit tests cover menu template structure and callbacks
- [x] Update `PLAN.md` status for TICKET-019

## Files Created

- `specs/019-tray-menu.md`
- `src/tests/desktop/tray-menu.test.ts` (expanded coverage)
- `tickets/TICKET-019.md`

## Files Modified

- `src/desktop/main.ts`
- `src/desktop/tray-menu.ts`
- `src/desktop/tray-constants.ts`
- `PLAN.md`

## Status History

| Date       | From      | To           | By    | Notes |
| ---------- | --------- | ------------ | ----- | ----- |
| 2026-02-26 | draft     | specified    | Codex | Added tray-menu spec in `specs/019-tray-menu.md`. |
| 2026-02-26 | specified | planned      | Codex | Confirmed implementation approach with state-aware menu template and callbacks. |
| 2026-02-26 | planned   | implementing | Codex | Started implementation. |
| 2026-02-26 | implementing | implemented | Codex | Added tray actions (pause/resume, dashboard, settings), menu refresh logic, and tests. |
