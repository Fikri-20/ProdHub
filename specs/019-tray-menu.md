# Spec: Tray Menu Actions (Pause, Dashboard, Settings)

> Ticket: TICKET-019 | Status: final

## Problem Statement

The tray app currently only exposes a minimal quit action. Users need direct controls from the tray to pause tracking, open the dashboard, and access settings entry points.

## User Stories

### Story 1

As a desktop user, I want to pause and resume tracking from the tray, so I can control when activity is captured.

### Story 2

As a desktop user, I want quick tray links to dashboard and settings, so I can manage my account and view activity without searching manually.

## Functional Requirements

### FR-1: Pause/Resume Menu Action

- Description: Add a menu action that toggles between pause and resume.
- Input: User click on tray toggle action.
- Output: Tracking state switches and heartbeat agent start/stop behavior updates accordingly.
- Constraints: Label reflects current state.

### FR-2: Tracking Status Label

- Description: Display read-only tracking status in tray menu.
- Input: Current tracking state.
- Output: Status line such as `Tracking: Active` or `Tracking: Paused`.
- Constraints: Status entry is disabled (non-clickable).

### FR-3: Open Dashboard Action

- Description: Add tray action to open the dashboard URL in default browser.
- Input: User click on `Open Dashboard`.
- Output: `shell.openExternal` called with dashboard URL.
- Constraints: URL defaults to `http://localhost:3001/dashboard`, override via env.

### FR-4: Settings Action

- Description: Add tray action to open settings URL in default browser.
- Input: User click on `Settings`.
- Output: `shell.openExternal` called with settings URL.
- Constraints: Default built from dashboard URL + `/settings`; override via env.

### FR-5: Menu Refresh on State Change

- Description: Rebuild tray menu after pause/resume so labels reflect current state.
- Input: Tracking state change.
- Output: Updated context menu.
- Constraints: No app window creation.

## Non-Functional Requirements

- Reliability: Failed external URL launches should be logged and not crash the app.
- Maintainability: Menu-template construction remains pure and unit-testable.

## Edge Cases

1. Dashboard URL has trailing slash.
2. Settings URL override is explicitly provided.
3. Toggle called before heartbeat agent exists.

## Out of Scope

- Persistent saved preferences for paused state.
- Full settings UI implementation.

## Success Criteria

1. Tray menu contains pause/resume, open dashboard, settings, and quit actions.
2. Pause/resume updates both tracking behavior and tray labels.
3. Menu-template tests cover stateful labels and callbacks.
