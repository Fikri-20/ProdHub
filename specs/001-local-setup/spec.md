# Feature Specification: One-Command Local Setup

**Feature Branch**: `001-local-setup`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "One-command local setup: install deps, migrate DB, seed default user, start API + dashboard, print clear first-run instructions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-Time Setup (Priority: P1)

A developer clones ProdHub and wants to get it running immediately. They run a single command and within seconds have the API server and dashboard running with no manual configuration.

**Why this priority**: Zero-friction onboarding is the core goal. If setup requires multiple manual steps, contributors and users drop off before ever seeing the product.

**Independent Test**: Run `pnpm setup` on a fresh clone with no existing database. API server and dashboard both start, dashboard is accessible, and console output shows clear URLs.

**Acceptance Scenarios**:

1. **Given** a fresh clone with no database, **When** `pnpm setup` is run, **Then** dependencies are installed, the SQLite database is created, and a default user + API key are generated automatically.
2. **Given** setup is complete, **When** `pnpm start:all` is run, **Then** both the API (port 3000) and dashboard (port 3001) start, and console output shows their URLs.
3. **Given** setup has already been run once, **When** `pnpm setup` is run again, **Then** it completes successfully without overwriting the existing database or API key.

---

### User Story 2 — First-Run Guidance (Priority: P2)

After setup, a new user has no idea how to configure the desktop agent or browser extension. The console output tells them exactly where to find the API key and how to connect their tracking clients.

**Why this priority**: Without clear instructions, users can't connect any tracking clients and the product is useless even if it starts correctly.

**Independent Test**: Run the full setup and verify console output includes the dashboard URL, the API key value (or where to find it), and a brief instruction for connecting agents.

**Acceptance Scenarios**:

1. **Given** first-run setup completes, **When** `pnpm start:all` is run, **Then** the console prints the dashboard URL, the API key, and instructions for connecting the desktop agent.
2. **Given** setup is run on any OS, **When** instructions are printed, **Then** they are readable and accurate (correct ports, correct paths).

---

### User Story 3 — Cross-Platform Compatibility (Priority: P3)

The setup command works identically on Windows, macOS, and Linux without OS-specific manual steps.

**Why this priority**: ProdHub is open-source. Contributors and users are on all platforms.

**Independent Test**: The setup script uses only cross-platform Node.js tooling (no bash-only or PowerShell-only scripts in the critical path).

**Acceptance Scenarios**:

1. **Given** a Windows machine, **When** `pnpm setup` is run, **Then** it completes without error.
2. **Given** a macOS or Linux machine, **When** `pnpm setup` is run, **Then** it completes without error.

---

### Edge Cases

- What happens when ports 3000 or 3001 are already in use?
- What happens when `pnpm setup` is run a second time (idempotent)?
- What if Node.js or pnpm version is too old?
- What if the web directory dependencies fail to install?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A single `pnpm setup` command MUST install all root and web dependencies, generate the Prisma client, and run database migrations.
- **FR-002**: A single `pnpm start:all` command MUST start both the API server (port 3000) and the dashboard (port 3001) concurrently, printing their URLs to the console.
- **FR-003**: The setup MUST be idempotent — running it multiple times MUST NOT overwrite an existing database, user, or API key.
- **FR-004**: On server start, the console MUST print the dashboard URL, the generated API key, and brief instructions for connecting tracking clients.
- **FR-005**: The setup and start commands MUST work on Windows, macOS, and Linux using only cross-platform tooling.
- **FR-006**: If either service fails to start, the error MUST be clearly printed to the console.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from fresh clone to a running dashboard in under 2 minutes following only the README instructions.
- **SC-002**: Running `pnpm setup` twice in a row produces the same result as running it once (no errors, no data overwritten).
- **SC-003**: Console output on first run contains dashboard URL, API key, and agent connection instructions without consulting external docs.
- **SC-004**: Setup completes without manual intervention on Windows, macOS, and Linux.

## Assumptions

- Users have Node.js 20+ and pnpm 10+ installed (documented in README).
- `concurrently` package will handle running API + dashboard in parallel — it is cross-platform.
- Web directory has its own lockfile; setup installs web deps separately via `pnpm --filter web install`.
- Default user and API key seeding already exists in `src/lib/seed-default-user.ts` and runs on server startup — setup only needs to trigger migration and a brief server start to seed.
