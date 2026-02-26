# Spec: Windows Installer Packaging for Desktop Agent

> Ticket: TICKET-020 | Status: final

## Problem Statement

The Electron desktop agent can run locally, but there is no distributable installer for Windows users. This blocks non-technical adoption and onboarding.

## User Stories

### Story 1

As a Windows user, I want a standard installer executable for ProdHub Agent, so I can install and launch it without development tooling.

## Functional Requirements

### FR-1: Windows Packaging Pipeline

- Description: Provide scripts to build desktop runtime and package Windows artifacts.
- Input: Package-manager command.
- Output: Installer artifacts under release output directory.
- Constraints: Windows target only in this ticket.

### FR-2: NSIS Installer Target

- Description: Configure Electron Builder for NSIS-based installer output.
- Input: Electron Builder config.
- Output: `.exe` setup artifact for x64 architecture.
- Constraints: Product name and artifact naming are explicit and stable.

### FR-3: Unpacked Smoke Target

- Description: Provide a faster unpacked directory target for local packaging validation.
- Input: Packaging command.
- Output: `win-unpacked` app directory.
- Constraints: Reuses same Electron Builder config.

### FR-4: App Entry Metadata for Packaging

- Description: Ensure packaged app launches desktop main process entry (`dist/desktop/main.js`).
- Input: Electron Builder metadata config.
- Output: Packaged executable starts tray app.
- Constraints: No BrowserWindow creation added.

### FR-5: Installer Config Validation Test

- Description: Add tests to validate critical installer configuration fields.
- Input: Installer config JSON file.
- Output: Automated checks for target, metadata, and artifact naming.
- Constraints: Test does not need to build installer binary.

## Non-Functional Requirements

- Reliability: Packaging configuration should be deterministic in CI/local runs.
- Maintainability: Installer settings are in a dedicated config file.
- Scope: No macOS/Linux packaging in this ticket.

## Edge Cases

1. Packaging run with missing desktop build output.
2. Config drift causing wrong `main` entry in packaged app metadata.
3. Artifact naming unintentionally changed.

## Out of Scope

- Code signing/certificate management.
- Auto-update distribution channel.
- macOS/Linux installers.

## Success Criteria

1. `dist:desktop:dir` command produces Windows unpacked artifact.
2. `dist:desktop:win` command is configured for NSIS installer generation.
3. Installer configuration tests pass.
