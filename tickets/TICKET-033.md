# TICKET-033: Cross-Platform Desktop Packaging

## Status: `draft`
## Priority: P1

## Summary
Add macOS (.dmg) and Linux (.AppImage/.deb) builds for the desktop agent. Windows NSIS installer already works via `electron-builder.json` and `scripts/prepare-desktop-installer.mjs`.

> **Note:** This ticket replaces the original TICKET-033 (CI/CD + Docker publish) which was SaaS-oriented.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [ ] macOS build target in electron-builder config (.dmg)
2. [ ] Linux build targets (.AppImage and/or .deb)
3. [ ] Build scripts in package.json for each platform
4. [ ] Tray icon assets for macOS (template icon) and Linux
5. [ ] Test that auto-start works on macOS and Linux

## Acceptance Criteria
- [ ] `pnpm dist:desktop:mac` produces a .dmg installer
- [ ] `pnpm dist:desktop:linux` produces an .AppImage or .deb
- [ ] Desktop agent starts in system tray on all 3 platforms
- [ ] Auto-start on login works on macOS and Linux

## Dependencies
- Depends on: TICKET-020 (Windows installer — existing)
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket rewritten for cross-platform packaging |
