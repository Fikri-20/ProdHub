# TICKET-022: Active Tab Detection + Heartbeat

**Status:** `implemented`
**Phase:** 6 — Browser Extension

## Summary
Implemented tab session tracking with chrome.storage persistence, daily stats accumulation, and heartbeat sending to the API.

## Files Created
- `browser-extension/src/storage.ts` — chrome.storage wrappers for config (sync), session (local), dailyStats (local)
- `browser-extension/src/daily-stats.ts` — recordTime, getTodayTopSites, getTotalSeconds, extractDomain
- `browser-extension/src/session-manager.ts` — handleTabChange, handleWindowBlur, handleAlarmFlush with cached config/sender
- `src/tests/browser-extension/chrome-mock.ts` — in-memory chrome.storage mock
- `src/tests/browser-extension/storage.test.ts` — 9 tests
- `src/tests/browser-extension/daily-stats.test.ts` — 9 tests
- `src/tests/browser-extension/session-manager.test.ts` — 8 tests

## Key Decisions
- `appName = "Chrome"`, `os = "Browser"`, `windowTitle = tab.title`
- Session persisted to chrome.storage.local (survives service worker restarts)
- Alarm every 5min flushes current session
- No API key → local-only mode (tracks daily stats, skips heartbeat)
- Skips chrome:// and chrome-extension:// URLs
