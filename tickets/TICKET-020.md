# TICKET-020: Windows Installer (macOS/Linux later)

**Status:** `done`
**Phase:** 5 - Desktop Agent (Electron)
**Depends on:** TICKET-019

## Description

Add Windows installer packaging for the Electron desktop agent using an NSIS target, plus an unpacked smoke-build target.

## Acceptance Criteria

- [ ] Add Windows installer spec artifact
- [ ] Add Electron Builder dependency and configuration file
- [ ] Add scripts for `dist:desktop:dir` (smoke) and `dist:desktop:win` (installer)
- [ ] Configure NSIS x64 target with stable artifact naming
- [ ] Ensure packaged app entry points to `dist/desktop/main.js`
- [ ] Add unit test that validates installer config shape and critical values
- [ ] Validate packaging flow via smoke build command
- [ ] Update `PLAN.md` status for TICKET-020

## Files Created

- `specs/020-windows-installer.md`
- `electron-builder.json`
- `src/tests/desktop/installer-config.test.ts`

## Files Modified

- `package.json`
- `pnpm-lock.yaml`
- `PLAN.md`

## Status History

| Date       | From      | To           | By    | Notes                                                               |
| ---------- | --------- | ------------ | ----- | ------------------------------------------------------------------- |
| 2026-02-26 | draft     | specified    | Codex | Added Windows installer spec in `specs/020-windows-installer.md`.   |
| 2026-02-26 | specified | planned      | Codex | Confirmed Electron Builder + NSIS approach with smoke build target. |
| 2026-02-26 | planned   | implementing | Codex | Started implementation.                                             |
