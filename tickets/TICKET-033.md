# TICKET-033: Cross-Platform Desktop Packaging

## Status: `implemented`
## Priority: P1

## Summary
Add macOS (.dmg) and Linux (.AppImage/.deb) builds for the desktop agent. Windows NSIS installer already works via `electron-builder.json` and `scripts/prepare-desktop-installer.mjs`.

> **Note:** This ticket replaces the original TICKET-033 (CI/CD + Docker publish) which was SaaS-oriented.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [x] macOS build target in electron-builder config (.dmg)
2. [x] Linux build targets (.AppImage and .deb)
3. [x] Build scripts in package.json for each platform
4. [x] Tray icon assets for macOS and Linux (icon upgraded to 512×512)
5. [x] Auto-start works on macOS (native login items) and Linux (XDG autostart)

## Acceptance Criteria
- [x] `pnpm dist:desktop:mac` produces a .dmg installer
- [x] `pnpm dist:desktop:linux` produces an .AppImage and .deb
- [x] Desktop agent starts in system tray on all 3 platforms
- [x] Auto-start on login works on macOS (setLoginItemSettings) and Linux (XDG autostart desktop file)

## Dependencies
- Depends on: TICKET-020 (Windows installer — existing)
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket rewritten for cross-platform packaging |
| 2026-03-24 | draft | implemented | Claude | Added mac/linux targets to electron-builder.json, dist:desktop:mac + dist:desktop:linux scripts, icon upgraded 256→512px, Linux XDG autostart in auto-start.ts with injectable deps for testability, 4 new Linux autostart tests |
