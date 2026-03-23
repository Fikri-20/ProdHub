# Tasks: Contributing Docs & Architecture Guide

**Input**: Design documents from `/specs/001-contributing-docs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the file skeleton before writing content.

- [x] T001 Create `CONTRIBUTING.md` at repository root with top-level heading and section placeholders

---

## Phase 2: User Story 1 — New Contributor Onboarding (Priority: P1) 🎯 MVP

**Goal**: A new contributor can follow CONTRIBUTING.md to set up a dev environment, understand the branch/commit conventions, run tests, and open a PR — without any external help.

**Independent Test**: Follow only the Setup, Workflow, and Testing sections on a fresh clone. Dev environment starts, branches are named correctly, tests run.

### Implementation for User Story 1

- [x] T002 [US1] Write Prerequisites section in `CONTRIBUTING.md` — Node.js 20+, pnpm 10+, Git; include version check commands
- [x] T003 [US1] Write Dev Environment Setup section in `CONTRIBUTING.md` — git clone, `pnpm setup`, `pnpm start:all`, verify URLs (localhost:3000 health, localhost:3001 dashboard)
- [x] T004 [US1] Write Development Workflow section in `CONTRIBUTING.md` — branch naming (`NNN-short-description`), commit format (`[TICKET-NNN] imperative description`), PR steps (test locally → open PR → address review → merge)
- [x] T005 [US1] Write Testing section in `CONTRIBUTING.md` — `pnpm test` for backend+extensions, `cd web && pnpm test` for dashboard, note on sequential execution and shared SQLite

**Checkpoint**: US1 sections complete — a contributor can get set up and submit a PR using only these sections.

---

## Phase 3: User Story 2 — Architecture Understanding (Priority: P2)

**Goal**: A contributor reads the architecture section and can describe all 5 components, their roles, and trace a heartbeat event end-to-end without reading source code.

**Independent Test**: Read only the architecture section. Answer: "What does each component do?" and "Where does a heartbeat go?" without consulting any source files.

### Implementation for User Story 2

- [x] T006 [US2] Write Architecture Overview section in `CONTRIBUTING.md` — list all 5 components (API server port 3000, dashboard port 3001, Electron desktop agent, Chrome extension, VS Code extension) with one-line descriptions; include ASCII data-flow diagram (tracking client → POST /api/events/heartbeat → Fastify → Prisma → SQLite → dashboard query); document `pk_` API key auth pattern and `~/.prodhub/agent.json` auto-connect mechanism

**Checkpoint**: US2 section complete — a contributor understands the full system topology and data flow.

---

## Phase 4: User Story 3 — Code Conventions Reference (Priority: P3)

**Goal**: A contributor writes code consistent with the existing codebase by consulting the conventions section.

**Independent Test**: Read only the conventions section. Write a new import statement, a new Prisma query, and a new TypeScript type — all matching existing project patterns.

### Implementation for User Story 3

- [x] T007 [US3] Write Code Conventions section in `CONTRIBUTING.md` — (1) ESM-only: `"type": "module"` means all files are ES modules; (2) `.js` import extensions: always use `.js` even in `.ts` files due to `nodenext` resolution; (3) Strict TypeScript: `exactOptionalPropertyTypes` — can't assign `undefined` to optional fields, `noUncheckedIndexedAccess` — array/map access returns `T | undefined`; (4) Prisma user scoping: all queries include `userId` filter; (5) Zod at API boundaries: validate request body with Zod schema before processing

**Checkpoint**: All sections complete — CONTRIBUTING.md covers all 3 user stories.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final review and verification.

- [x] T008 [P] Proofread `CONTRIBUTING.md` — verify every command is accurate, cross-platform (no bash-only syntax), and consistent with current `package.json` scripts
- [x] T009 Update ticket TICKET-037 status to `implemented` in `tickets/TICKET-037.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 first
- **US1 (Phase 2)**: Depends on T001 (file must exist)
- **US2 (Phase 3)**: Can start after T001 (independent section); logically follows US1 in the final document
- **US3 (Phase 4)**: Can start after T001 (independent section); logically follows US2 in the final document
- **Polish (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

All user stories write to the same file (`CONTRIBUTING.md`) so they are sequentially ordered in the document, but each section is independently writable.

### Parallel Opportunities

- T002, T003, T004, T005 all write different sections — they can be drafted in parallel and assembled
- T008 and T009 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: Create file skeleton
2. T002–T005: Write onboarding sections
3. **STOP and VALIDATE**: Fresh clone + follow only CONTRIBUTING.md → dev environment running

### Incremental Delivery

1. T001 → T002–T005: Onboarding complete (US1 — most valuable section)
2. T006: Architecture added (US2)
3. T007: Conventions added (US3)
4. T008–T009: Polish and ticket update

---

## Notes

- All tasks write to `CONTRIBUTING.md` — no parallelism across tasks in the same section
- T001 creates the skeleton so subsequent tasks have a file to edit
- Commands must reference `pnpm setup` (TICKET-036) not manual migration steps
- API key prefix is `pk_` (not `ph_`) — confirmed from `src/lib/api-key.ts`
