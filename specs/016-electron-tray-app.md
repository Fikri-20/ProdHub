# Spec: Electron Tray-Only Desktop Agent Shell

> Ticket: TICKET-016 | Status: final

## Problem Statement

Phase 5 requires a lightweight desktop agent shell that runs in the system tray without embedding the web dashboard or backend server. The current project has no Electron runtime scaffold.

## User Stories

### Story 1

As a desktop user, I want the ProdHub agent to run quietly in the system tray, so that tracking capabilities can be layered in without requiring an always-open window.

## Functional Requirements

### FR-1: Electron Main Process Entry

- Description: Provide an Electron main-process entrypoint for the desktop agent.
- Input: App launch via desktop runtime.
- Output: Electron app initializes and stays resident.
- Constraints: No `BrowserWindow` creation.

### FR-2: Tray-Only Runtime

- Description: Initialize a system tray icon and tooltip.
- Input: Electron app ready lifecycle event.
- Output: Tray icon remains active while app runs.
- Constraints: Must not open any visible window.

### FR-3: Tray Context Menu

- Description: Expose a minimal tray menu with runtime status text and quit action.
- Input: User interaction with tray icon.
- Output: Clicking quit cleanly exits the process.
- Constraints: Menu must include `Quit`.

### FR-4: Single-Instance Guard

- Description: Ensure only one desktop agent instance runs.
- Input: Launching a second app instance.
- Output: Second instance exits immediately.
- Constraints: First instance remains active.

### FR-5: Build/Run Scripts

- Description: Add scripts to build and run the Electron desktop shell.
- Input: Project script commands.
- Output: Reproducible desktop entry for local development.
- Constraints: Uses existing TypeScript build pipeline conventions.

## Non-Functional Requirements

- Performance: Desktop shell startup should be lightweight and avoid unnecessary services.
- Security: No embedded HTTP server; no auth/secret flow added in this ticket.
- Maintainability: Tray menu construction should be testable without launching Electron.

## Edge Cases

1. Tray icon resource is unavailable at runtime.
2. User launches the app multiple times.

## Out of Scope

- Sending heartbeats to API (TICKET-017).
- Auto-start on login (TICKET-018).
- Extended tray actions/settings (TICKET-019).
- Installer packaging (TICKET-020).

## Success Criteria

1. Electron desktop app runs with tray icon and no window.
2. Tray menu includes quit and exits cleanly.
3. Second instance is blocked.
4. Automated tests cover tray menu helper behavior.
