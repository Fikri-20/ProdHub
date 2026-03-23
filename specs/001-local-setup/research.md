# Research: One-Command Local Setup

**Feature**: 001-local-setup
**Date**: 2026-03-23

## R1: Cross-Platform Concurrent Process Runner

**Decision**: Use `concurrently` npm package.

**Rationale**: `concurrently` is the de facto standard for running multiple npm scripts in parallel cross-platform. It prefixes each process's output with a colored label, handles Ctrl+C to kill all child processes, and exits with a non-zero code if any process fails. Works on Windows, macOS, and Linux without shell-specific syntax.

**Alternatives considered**:
- `npm-run-all` / `run-p` — similar but less maintained; `concurrently` has more active community
- Shell `&` — bash-only, breaks on Windows cmd/PowerShell
- `parallelshell` — deprecated

## R2: Setup Script Approach

**Decision**: A Node.js ESM script (`scripts/setup.mjs`) that uses `spawnSync` from `child_process` to call pnpm sub-commands sequentially.

**Rationale**: A plain `.mjs` script is cross-platform (runs with `node`), has no extra dependencies, and can print colored output with ANSI codes. Using `spawnSync` with `stdio: 'inherit'` passes output directly to the terminal so the user sees progress in real time. `spawnSync` with an explicit args array avoids shell injection risk. The script is called via `"setup": "node scripts/setup.mjs"` in package.json.

**Alternatives considered**:
- Shell script (`.sh`) — bash-only, fails on Windows without WSL
- PowerShell script (`.ps1`) — Windows-only without extra config on macOS/Linux
- Makefile — requires `make` installed, non-standard for JS projects
- Pure package.json chained scripts — hard to add conditional logic for idempotency checks

## R3: Prisma Migrate in Setup

**Decision**: Use `prisma migrate deploy` (not `prisma migrate dev`) in the setup script.

**Rationale**: `prisma migrate dev` is interactive — it prompts for migration names. `prisma migrate deploy` applies all pending migrations non-interactively, which is correct for setup. This matches the CI/CD fix in TICKET-032.

## R4: Seeding Strategy

**Decision**: Seeding runs automatically when the server starts for the first time via the existing `seed-default-user.ts` logic. The setup script does NOT need to start the server to seed.

**Rationale**: `seed-default-user.ts` already runs on every server startup and is idempotent (uses upsert). No standalone seed step needed. This keeps setup simpler.

**Implication**: The API key is printed when the server first starts via `pnpm start:all`, not during `pnpm setup`. This is acceptable — setup prepares the environment, start:all boots everything and shows the key.

## R5: First-Run Output Format

**Decision**: Print a formatted banner in `server.ts` after seeding, showing: dashboard URL, API server URL, the generated API key, and a one-liner for connecting the desktop agent. Print only when a new key was just created (first run).

**Rationale**: The API key is available after seeding in `server.ts`. Printing it there is the natural place. Using a clear visual separator makes it easy to spot in combined `concurrently` output.

**Implementation**: `seed-default-user.ts` returns `{ rawKey: string | null }` where `rawKey` is non-null only when a key was newly generated. `server.ts` conditionally prints the banner based on this.
