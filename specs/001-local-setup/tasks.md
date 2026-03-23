# Tasks: One-Command Local Setup

**Input**: Design documents from `/specs/001-local-setup/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the one new dependency required before any feature work begins.

- [x] T001 Install `concurrently` as a devDependency via `pnpm add -D concurrently`

---

## Phase 2: User Story 1 — First-Time Setup (Priority: P1) 🎯 MVP

**Goal**: `pnpm setup` installs all dependencies, generates the Prisma client, and applies DB migrations in a single command with clear console output.

**Independent Test**: Run `pnpm setup` on a fresh clone — all 4 steps complete with exit code 0 and the success message is printed. Run again — still exits 0 with no errors (idempotent).

### Implementation for User Story 1

- [x] T002 [US1] Create `scripts/setup.mjs` — cross-platform ESM setup script using `spawnSync` with explicit args arrays for 4 steps: (1) pnpm install root, (2) pnpm install web, (3) pnpm db:generate, (4) npx prisma migrate deploy; print step banner, exit 1 on any failure, print success message on completion
- [x] T003 [US1] Add `"setup": "node scripts/setup.mjs"` and `"start:all": "concurrently --names api,web \"tsx src/server.ts\" \"pnpm dev:web\" --prefix-colors cyan,magenta"` scripts to `package.json`

### Tests for User Story 1

- [x] T004 [US1] Create `src/tests/routes/setup.test.ts` — test that `scripts/setup.mjs` runs steps in the correct order, exits 0 on success, and exits 1 when a step fails (mock `spawnSync` to simulate failure)

**Checkpoint**: `pnpm setup` runs all 4 steps, exits cleanly, and is idempotent on second run.

---

## Phase 3: User Story 2 — First-Run Guidance (Priority: P2)

**Goal**: On first `pnpm start:all`, a formatted banner prints the dashboard URL, API URL, generated API key, and agent connection env vars. On subsequent runs, no banner is printed.

**Independent Test**: Start the server with a fresh DB — banner prints with correct API key. Stop and restart with existing DB — no banner printed.

### Implementation for User Story 2

- [x] T005 [US2] Modify `src/lib/seed-default-user.ts` — change return type from `Promise<void>` to `Promise<{ rawKey: string | null }>`, returning `rawKey` only when a new key is created (first run), null on subsequent runs
- [x] T006 [US2] Modify `src/server.ts` — call `seedDefaultUser()`, use returned `rawKey` to conditionally print the first-run banner (dashboard URL, API URL, key value, `TRACKER_API_URL`/`TRACKER_API_KEY` env var instructions) when `rawKey` is non-null

### Tests for User Story 2

- [x] T007 [US2] Add tests to `src/tests/routes/setup.test.ts` — test that `seedDefaultUser()` returns `{ rawKey: string }` on first run and `{ rawKey: null }` on subsequent runs; test that the server banner prints iff rawKey is non-null and contains correct content

**Checkpoint**: First-run banner appears exactly once with correct content. Subsequent starts are silent.

---

## Phase 4: User Story 3 — Cross-Platform Compatibility (Priority: P3)

**Goal**: All setup commands work identically on Windows, macOS, and Linux using only cross-platform Node.js tooling.

**Independent Test**: Audit `scripts/setup.mjs` — all subprocess calls use `spawnSync` with explicit args arrays (no `shell: true`, no bash-only syntax, no PowerShell-only syntax).

### Implementation for User Story 3

- [x] T008 [US3] Audit `scripts/setup.mjs` — confirm all `spawnSync` calls use explicit args arrays (not shell strings), `stdio: 'inherit'` for real-time output, and no OS-specific code paths; fix any issues found

**Checkpoint**: Setup works on Windows, macOS, and Linux without modification.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation — all tests pass, quickstart steps confirmed.

- [x] T009 [P] Run `pnpm test` in repo root — verify all existing tests still pass and new setup tests in `src/tests/routes/setup.test.ts` pass (231/231 ✓)
- [x] T010 Run quickstart.md validation — manually execute the steps in `specs/001-local-setup/quickstart.md` to confirm implementation matches the spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on T001 (concurrently installed before package.json references it)
- **US2 (Phase 3)**: T005 must complete before T006 (server.ts depends on seed-default-user return type)
- **US3 (Phase 4)**: Depends on T002 (setup.mjs must exist to audit)
- **Polish (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after T001
- **US2 (P2)**: T005 before T006 (type signature change must exist before server.ts uses it)
- **US3 (P3)**: Depends on T002 being complete (audit the script that was just written)

### Within Each User Story

- T002 before T003 (setup.mjs must exist before package.json script references it)
- T005 before T006 (seed-default-user return type change before server.ts consumes it)
- Tests (T004, T007) can be written in parallel with implementation or after

### Parallel Opportunities

- T002 [scripts/setup.mjs] and T005 [src/lib/seed-default-user.ts] can run in parallel (different files)
- T003 [package.json start:all] and T006 [src/server.ts] can run in parallel (different files)
- T009 and T010 can run in parallel

---

## Parallel Example: US1 + US2

```bash
# These two tasks touch different files and can run in parallel:
Task T002: "Create scripts/setup.mjs"
Task T005: "Modify src/lib/seed-default-user.ts"

# These two can also run in parallel:
Task T003: "Update package.json scripts"
Task T006: "Modify src/server.ts banner logic"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: Install concurrently
2. T002: Create scripts/setup.mjs
3. T003: Update package.json scripts
4. T004: Write setup tests
5. **STOP and VALIDATE**: `pnpm setup` works end-to-end on a fresh clone

### Incremental Delivery

1. T001 → T002 → T003 → T004: `pnpm setup` + `pnpm start:all` works (US1 complete)
2. T005 → T006 → T007: First-run banner prints exactly once (US2 complete)
3. T008: Cross-platform audit passes (US3 complete)
4. T009 → T010: All tests pass, quickstart steps validated

---

## Notes

- T001 must complete before T003 (package.json references concurrently in start:all)
- T005 must complete before T006 (TypeScript type dependency)
- Commit after US1 complete and tests pass; commit again after US2 + US3
- Each story phase is independently deployable/testable
