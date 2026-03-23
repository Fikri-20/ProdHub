# Implementation Plan: One-Command Local Setup

**Branch**: `001-local-setup` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-local-setup/spec.md`

## Summary

Add `pnpm setup` and `pnpm start:all` scripts so a fresh clone becomes a running ProdHub instance with a single command sequence. `pnpm setup` handles install → Prisma generate → migrate → seed. `pnpm start:all` uses `concurrently` to run the API server and Next.js dashboard in parallel, printing first-run instructions (dashboard URL + API key) on startup.

## Technical Context

**Language/Version**: TypeScript 5.9 (ESM), Node.js 20+
**Primary Dependencies**: `concurrently` (cross-platform parallel process runner), existing `tsx`, `prisma`, `next`
**Storage**: N/A (setup orchestrates existing SQLite; no new storage)
**Testing**: Vitest — integration test for the setup script logic
**Target Platform**: Windows, macOS, Linux (Node.js cross-platform)
**Project Type**: Developer tooling / npm scripts + Node.js setup script
**Performance Goals**: Full setup completes in under 2 minutes on a typical machine
**Constraints**: No bash-only scripts in critical path; must work with `pnpm` on all platforms
**Scale/Scope**: Single-user local install; one setup script, one start script

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Tests mandatory | PASS | Will test setup script logic and startup output |
| No silent failures | PASS | Setup script exits non-zero on failure; errors printed clearly |
| Security first | PASS | API key printed once to console (local machine only); no secrets in files |
| DRY but readable | PASS | Single setup script, thin orchestration in package.json |
| Spec-driven workflow | PASS | Spec complete, plan in progress |
| Constitution tech stack | PASS | TypeScript, Node.js, pnpm — no new runtime dependencies beyond `concurrently` |

**Gate result: PASS** — No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-local-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── setup-script.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
scripts/
└── setup.mjs            # NEW — cross-platform setup orchestration script

package.json             # MODIFY — add setup, start:all scripts; add concurrently devDep

src/server.ts            # MODIFY — print first-run info (dashboard URL + API key) on startup

src/tests/
└── setup.test.ts        # NEW — tests for setup script behavior
```

**Structure Decision**: Minimal footprint — one new script file, minimal package.json changes, one server.ts enhancement for first-run output.

## Complexity Tracking

No violations to justify.
