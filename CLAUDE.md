# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ActivityWatcher (ProdHub)** — a privacy-first, cross-platform activity tracker inspired by ActivityWatch with a GitHub-style heatmap dashboard.

See `PLAN.md` for the full phase-by-phase roadmap and `INSTRUCTIONS.md` for the mentoring/teaching context.

## Current Progress

- **Phase 1 (complete):** Local CLI tracker that polls the active window every 5s and logs to SQLite.
- **Phase 2 (in progress):** REST API with Fastify + PostgreSQL + Prisma.
  - [x] 2.1 Fastify server with plugin-based route architecture
  - [x] 2.2 PostgreSQL (Docker) + Prisma schema (Device, Category, ActivityEvent, CategoryAssignment)
  - [x] 2.3 Build API endpoints (heartbeat, events query, summary, categories CRUD) — TICKET-001
  - [ ] 2.4 Zod validation with fastify-type-provider-zod — TICKET-002
  - [ ] 2.5 Categorization engine — TICKET-003
  - [ ] 2.6 Migrate tracker to POST heartbeats to API — TICKET-004
- **Phase 3 (not started):** Auth + Multi-Tenancy (TICKET-005 through TICKET-008)
- **Phase 4 (not started):** Next.js Dashboard (TICKET-009 through TICKET-015)
- **Phase 5 (not started):** Desktop Agent / Electron (TICKET-016 through TICKET-020)
- **Phase 6 (not started):** Browser Extension (TICKET-021 through TICKET-025)
- **Phase 7 (not started):** Editor Plugins + Polish (TICKET-026 through TICKET-031)
- **Phase 8 (not started):** Deployment + SaaS Infrastructure (TICKET-032 through TICKET-035)

## Commands

```bash
# Development
pnpm dev              # Run tracker in watch mode (tsx --watch src/tracker.ts)
pnpm dev:server       # Run Fastify server in watch mode (tsx --watch src/server.ts)
pnpm build            # Bundle with tsup → dist/ (ESM)
pnpm start            # Run built tracker (node dist/tracker.js)
pnpm start:server     # Run built server (node dist/server.js)

# Database
pnpm db:up            # Start PostgreSQL container (docker compose up -d)
pnpm db:down          # Stop PostgreSQL container
pnpm db:migrate       # Run Prisma migrations (prisma migrate dev)
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:generate      # Regenerate Prisma client

# Testing
pnpm test             # Run all tests (vitest run)
pnpm test:watch       # Run tests in watch mode (vitest)
```

Package manager is **pnpm** (v10.30.1). Test runner: **Vitest**. No linter configured yet.

## Architecture

### Tracker (Phase 1 — SQLite)
A single long-running Node.js process that polls the active window every 5 seconds:

- **`src/tracker.ts`** — Entry point. `setInterval` loop using `get-windows` to detect the active window. On app switch, logs the previous event to SQLite.
- **`src/database.ts`** — SQLite layer using `better-sqlite3`. Creates `activity_events` table and exports `insertEvent()`. DB file: `activity.db`.
- **`src/types.ts`** — Shared `ActivityEvent` type (appName, windowTitle, startTime, endTime, duration).
- **`src/query.ts`** — Placeholder for querying activity data.

### API Server (Phase 2 — PostgreSQL)
- **`src/server.ts`** — Fastify server on port 3000 with plugin architecture. Registers route plugins and manages Prisma lifecycle.
- **`src/lib/prisma.ts`** — Prisma client singleton using `@prisma/adapter-pg`.
- **`src/routes/events.ts`** — Event routes: `POST /api/events/heartbeat` (ingest + device upsert), `GET /api/events` (query with filters/pagination).
- **`src/routes/categories.ts`** — Categories CRUD at `/api/categories` (GET list, POST create, GET/:id, PATCH/:id, DELETE/:id).
- **`src/routes/summary.ts`** — `GET /api/summary?groupBy=app|category` (aggregated durations).

### Database (PostgreSQL + Prisma)
- **`docker-compose.yml`** — PostgreSQL 16 Alpine with persistent volume. Credentials: `prodhub/prodhub_dev`, database: `prodhub`.
- **`prisma/schema.prisma`** — Four models:
  - `Device` — tracked machines (id, name, os)
  - `Category` — user-defined categories with regex rules and colors
  - `ActivityEvent` — tracked events (appName, windowTitle, startTime, endTime, duration, deviceId)
  - `CategoryAssignment` — many-to-many link between events and categories
- **`src/generated/prisma/`** — Auto-generated Prisma client (gitignored).
- **`.env`** — `DATABASE_URL` for Prisma (gitignored).

## TypeScript Configuration

- Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled
- ESM-only (`"type": "module"` in package.json, `verbatimModuleSyntax` in tsconfig)
- All local imports must use `.js` extensions (e.g., `import { type ActivityEvent } from "./types.js"`)

## Tech Stack

| Layer      | Choice              | Status      |
| ---------- | ------------------- | ----------- |
| Backend    | Fastify (TS)        | Set up      |
| Database   | PostgreSQL + Prisma  | Set up      |
| ORM        | Prisma              | Set up      |
| Auth       | Auth.js             | Not started |
| Frontend   | Next.js (App Router)| Not started |
| Desktop    | Electron            | Not started |
| Validation | Zod                 | Not started |

---

## Spec-Driven Development Workflow

### Agent Roles
- **Claude (this agent)**: Architect + Developer. SOLE code author.
- **Codex**: Reviewer + QA. NEVER writes code. See `.codex/CODEX_INSTRUCTIONS.md`.

### Project Structure (SDD)
- `PLAN.md` — Living technical plan & architecture
- `memory/constitution.md` — Non-negotiable project principles
- `specs/` — Feature specifications
- `tickets/` — Feature tickets with status tracking
- `reviews/` — Codex review reports (Claude must address these)
- `.codex/` — Codex agent guardrails
- `.specify/` — Spec Kit templates and scripts
- `.claude/commands/` — Spec Kit slash commands

### Ticket Statuses
| Status | Meaning |
|--------|---------|
| `draft` | Created, spec not written |
| `specified` | Spec complete |
| `planned` | Technical plan written |
| `implementing` | Claude actively working |
| `implemented` | Code done, ready for Codex review |
| `review-failed` | Codex found issues — see review report |
| `approved` | Done |

### Workflow Rules
1. NEVER skip the spec. Every code change traces to a ticket and spec.
2. One ticket at a time.
3. Reviews are blocking — fix review issues before starting new work.
4. Constitution is law — everything in memory/constitution.md is non-negotiable.
5. Tests are mandatory.

### Before Starting Any Work
1. Check /reviews/ for unresolved review reports → fix first
2. Check /tickets/ for the next ticket by priority
3. Read the ticket's spec in /specs/
4. Read PLAN.md for architectural context
5. Read memory/constitution.md for guardrails
6. Then implement.

### Spec Kit Commands Available
- `/speckit.constitution` — Create/edit project principles
- `/speckit.specify` — Generate a feature spec
- `/speckit.plan` — Generate a technical plan
- `/speckit.tasks` — Break plan into tasks
- `/speckit.implement` — Implement tasks
- `/speckit.check` — Cross-artifact consistency check
