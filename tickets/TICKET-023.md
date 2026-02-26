# TICKET-023: Popup UI

**Status:** `implemented`
**Phase:** 6 — Browser Extension

## Summary
Finalized the popup with config form, status indicator, and daily activity display.

## Features
- Status indicator: green (connected), red (disconnected), gray (paused)
- Collapsible Settings panel: API URL, API Key, Device Name, tracking toggle
- Today's Activity: total time + top 10 domains with bar charts
- Health check via `GET /api/events/health` with 5s timeout
- 350px wide, supports dark mode via prefers-color-scheme
- "Saved!" feedback on config save
