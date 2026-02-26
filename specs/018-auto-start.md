# Spec: Auto-Start Desktop Agent on OS Login

> Ticket: TICKET-018 | Status: final

## Problem Statement

The Electron tray agent currently requires manual launch after every reboot. For reliable tracking, the desktop agent should start automatically when the user logs into the OS.

## User Stories

### Story 1

As a user, I want ProdHub Agent to launch on OS login automatically, so that tracking starts without manual steps.

## Functional Requirements

### FR-1: Configure Login Item

- Description: Configure Electron login item settings for supported platforms.
- Input: App startup lifecycle.
- Output: `openAtLogin` is set according to agent auto-start configuration.
- Constraints: Supported platforms are Windows and macOS.

### FR-2: Environment Toggle

- Description: Allow disabling auto-start via environment variable.
- Input: `TRACKER_AUTO_START` env value.
- Output: Boolean auto-start intent.
- Constraints: Defaults to enabled if env is missing.

### FR-3: Development Safety

- Description: Avoid mutating OS login settings during dev runs unless explicitly allowed.
- Input: `app.isPackaged` and optional override env.
- Output: No login-item mutation in dev by default.
- Constraints: `TRACKER_AUTOSTART_ALLOW_DEV=true` bypasses this guard.

### FR-4: Idempotent Configuration

- Description: Do not call `setLoginItemSettings` when current value already matches target.
- Input: Current login item state from Electron.
- Output: Stable startup behavior with no unnecessary writes.
- Constraints: Must compare against current `openAtLogin`.

## Non-Functional Requirements

- Reliability: Unsupported platforms are handled as no-op.
- Maintainability: Auto-start logic is encapsulated in a testable module.
- Safety: No use of external startup scripts or shell registry edits.

## Edge Cases

1. Unsupported platform (Linux) should no-op without throwing.
2. Invalid `TRACKER_AUTO_START` value should fall back to enabled.
3. Existing login-item state already matches target.

## Out of Scope

- User-facing toggle UI in tray menu (TICKET-019).
- Installer-level auto-start registration (TICKET-020).

## Success Criteria

1. Packaged desktop app enables auto-start on supported platforms.
2. `TRACKER_AUTO_START=false` disables auto-start.
3. Unit tests cover parser and configuration behavior.
