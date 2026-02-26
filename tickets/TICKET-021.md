# TICKET-021: Browser Extension Scaffold

**Status:** `implemented`
**Phase:** 6 — Browser Extension

## Summary
Set up the browser-extension directory with Manifest V3, build pipeline (tsup IIFE), TypeScript types, heartbeat-sender (copied from desktop), popup HTML/CSS, and generated icons.

## Files Created
- `browser-extension/manifest.json` — MV3 manifest
- `browser-extension/package.json` — build scripts
- `browser-extension/tsconfig.json` — strict TS with @types/chrome
- `browser-extension/tsup.config.ts` — IIFE bundler config
- `browser-extension/src/types.ts` — ExtensionConfig, TabSession, DailyStats
- `browser-extension/src/heartbeat-sender.ts` — copied from desktop
- `browser-extension/src/background.ts` — service worker entry
- `browser-extension/src/popup.ts` — popup entry
- `browser-extension/popup/popup.html` — full popup markup
- `browser-extension/popup/popup.css` — full styling with dark mode
- `browser-extension/icons/icon-{16,48,128}.png` — generated PNGs

## Files Modified
- `package.json` — added `build:ext` script, `@types/chrome` devDep
- `vitest.config.ts` — excluded `browser-extension/**` from test runner
