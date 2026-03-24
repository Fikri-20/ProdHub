# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ProdHub** — a privacy-first, open-source, local-first activity tracker inspired by ActivityWatch with a GitHub-style heatmap dashboard. All data stays on the user's machine in SQLite.

See `PLAN.md` for the full phase-by-phase roadmap and `INSTRUCTIONS.md` for the mentoring/teaching context.

## Current Progress

- **Phase 1 (complete):** Local CLI tracker that polls the active window every 5s and logs to SQLite.
- **Phase 2 (complete):** REST API with Fastify + SQLite + Prisma.
  - [x] 2.1 Fastify server with plugin-based route architecture
  - [x] 2.2 SQLite + Prisma schema (Device, Category, ActivityEvent, CategoryAssignment)
  - [x] 2.3 Build API endpoints (heartbeat, events query, summary, categories CRUD) — TICKET-001
  - [x] 2.4 Zod validation with fastify-type-provider-zod — TICKET-002
  - [x] 2.5 Categorization engine — TICKET-003
  - [x] 2.6 Migrate tracker to POST heartbeats to API — TICKET-004
- **Phase 3 (complete):** Auth + Multi-Tenancy (TICKET-005 through TICKET-008)
  - [x] 3.1 User model + data scoping — TICKET-005
  - [x] 3.2 API key auth for desktop agents — TICKET-006
  - [x] 3.3 Tenant isolation — TICKET-007
  - [x] 3.4 Rate limiting + CORS — TICKET-008
- **Phase 4 (complete):** Next.js Dashboard (TICKET-009 through TICKET-015)
  - [x] 4.1 Next.js App Router scaffold — TICKET-009
  - [x] 4.2 Timeline View — TICKET-010
  - [x] 4.3 Summary View — TICKET-011
  - [x] 4.4 GitHub-style Heatmap — TICKET-012
  - [x] 4.5 Category Manager — TICKET-013
  - [x] 4.6 Live Status Indicator — TICKET-014
- **Phase 5 (complete):** Desktop Agent / Electron (TICKET-016 through TICKET-020)
  - [x] 5.1 Electron tray app — TICKET-016
  - [x] 5.2 Heartbeat sender — TICKET-017
  - [x] 5.3 Auto-start on OS login — TICKET-018
  - [x] 5.4 Tray menu — TICKET-019
  - [x] 5.5 Windows installer — TICKET-020
- **Phase 6 (complete):** Browser Extension (TICKET-021 through TICKET-025)
  - [x] 6.1 Extension scaffold + manifest + build pipeline — TICKET-021
  - [x] 6.2 Active tab detection + heartbeat sending — TICKET-022
  - [x] 6.3 Popup UI with config, status, daily stats — TICKET-023
  - [x] 6.4 URL domain categorization — TICKET-024
  - [x] 6.5 Edge cases — incognito, idle, multiple windows — TICKET-025
- **Phase 7 (complete):** Editor Plugins + Polish (TICKET-026 through TICKET-031)
  - [x] 7.1 VS Code extension — heartbeats with file, language, project — TICKET-026
  - [x] 7.2 Projects dimension in data model + dashboard — TICKET-027
  - [x] 7.3 WebSocket support for real-time dashboard — TICKET-028
  - [x] 7.4 Data export (JSON, CSV) and import — TICKET-029
  - [x] 7.5 Goals feature — daily targets + progress tracking — TICKET-030
  - [x] 7.6 Reports page — weekly/monthly summaries — TICKET-031
- **Phase 8 (complete):** Open-Source Distribution & Polish (TICKET-032 through TICKET-037)
  - [x] 8.1 Fix CI/CD — GitHub Actions with SQLite — TICKET-032
  - [x] 8.2 Cross-platform desktop packaging (macOS + Linux) — TICKET-033
  - [x] 8.3 Project landing page (open-source) — TICKET-034
  - [x] 8.4 Structured logging (pino + error IDs) — TICKET-035
  - [x] 8.5 One-command local setup — TICKET-036
  - [x] 8.6 Contributing docs + architecture guide — TICKET-037

## Commands

```bash
# Development
pnpm dev              # Run tracker in watch mode (tsx --watch src/tracker.ts)
pnpm dev:server       # Run Fastify server in watch mode (tsx --watch src/server.ts)
pnpm dev:web          # Run Next.js dashboard in watch mode (port 3001)
pnpm build            # Bundle with tsup → dist/ (ESM)
pnpm build:ext        # Build browser extension → browser-extension/dist/
pnpm build:vscode     # Build VS Code extension → vscode-extension/dist/
pnpm start            # Run built tracker (node dist/tracker.js)
pnpm start:server     # Run built server (node dist/server.js)

# Database
pnpm db:migrate       # Run Prisma migrations (creates SQLite DB)
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

### API Server (Phase 2 — SQLite)

- **`src/server.ts`** — Fastify server on port 3000 with plugin architecture. Registers route plugins and manages Prisma lifecycle.
- **`src/lib/prisma.ts`** — Prisma client singleton (SQLite, no adapter needed).
- **`src/routes/events.ts`** — Event routes: `POST /api/events/heartbeat` (ingest + device upsert), `GET /api/events` (query with filters/pagination).
- **`src/routes/categories.ts`** — Categories CRUD at `/api/categories` (GET list, POST create, GET/:id, PATCH/:id, DELETE/:id).
- **`src/routes/summary.ts`** — `GET /api/summary?groupBy=app|category` (aggregated durations).
- **`src/routes/goals.ts`** — Goals CRUD: daily targets and progress tracking.
- **`src/routes/reports.ts`** — Reports API: weekly/monthly summary generation.
- **`src/routes/export.ts`** — Data export (JSON, CSV) and import endpoints.
- **`src/routes/ws.ts`** — WebSocket upgrade route for real-time dashboard updates.
- **`src/services/ws-broadcast.ts`** — WebSocket broadcast service for pushing events to connected clients.

### Database (SQLite + Prisma)

- **`prisma/schema.prisma`** — SQLite database at `prisma/prodhub.db`. Local-first: all data on user's machine. Models:
  - `User` — users with email, name, optional passwordHash
  - `ApiKey` — API keys for desktop agent auth
  - `Device` — tracked machines (id, name, os)
  - `Category` — user-defined categories with regex rules (JSON string) and colors
  - `ActivityEvent` — tracked events (appName, windowTitle, startTime, endTime, duration, deviceId)
  - `CategoryAssignment` — many-to-many link between events and categories
  - `Goal` — daily targets with progress tracking
- Single generator: `client` → `src/generated/prisma/`
- No Docker required — SQLite is a file.

### Web Dashboard (Phase 4 — Next.js)

- **`web/`** — Next.js App Router on port 3001 (no Auth.js — self-hosted mode).
- **`web/src/auth.ts`** — Fetches default user ID from Fastify `/api/setup/status` endpoint.
- **`web/src/lib/api-client.ts`** — Server-side `apiClient()` (reads default user, sets `X-User-Id`) and client-side `createClientApiClient()`.
- **`web/src/app/auth/signin/`** — Sign-in page with Google, GitHub, email magic link.
- **`web/src/app/dashboard/`** — Dashboard layout with sidebar nav + header.

### Browser Extension (Phase 6 — Chrome MV3)

- **`browser-extension/`** — Chrome Manifest V3 extension that tracks active tab activity.
- **`browser-extension/src/background.ts`** — Service worker: listens to tabs.onActivated, tabs.onUpdated, windows.onFocusChanged, alarm flush every 5min.
- **`browser-extension/src/session-manager.ts`** — Tab session tracking, heartbeat flushing, config caching.
- **`browser-extension/src/storage.ts`** — chrome.storage wrappers (sync for config, local for session/stats).
- **`browser-extension/src/daily-stats.ts`** — Per-domain time tracking for popup display.
- **`browser-extension/src/heartbeat-sender.ts`** — Copied from desktop, sends heartbeats to API.
- **`browser-extension/src/popup.ts`** — Config form, status indicator, daily stats display.
- **`browser-extension/popup/`** — popup.html + popup.css (350px wide, dark mode support).
- Build: `pnpm build:ext` → `browser-extension/dist/background.js` + `popup.js` (IIFE via tsup).

### VS Code Extension (Phase 7)

- **`vscode-extension/`** — VS Code extension that tracks coding activity (file, language, project) and sends heartbeats.
- **`vscode-extension/src/extension.ts`** — activate/deactivate: wires editor events (file switch, typing, window blur, config change).
- **`vscode-extension/src/session-manager.ts`** — File session tracking, periodic flush (2 min), idle detection (5 min).
- **`vscode-extension/src/heartbeat-sender.ts`** — Sends heartbeats to `POST /api/events/heartbeat` with Bearer auth.
- **`vscode-extension/src/status-bar.ts`** — Status bar indicator, click to toggle tracking.
- **`vscode-extension/src/types.ts`** — Config loading from VS Code settings, FileSession type, constants.
- Build: `pnpm build:vscode` → `vscode-extension/dist/extension.js` (CJS via esbuild).

## TypeScript Configuration

- Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled
- ESM-only (`"type": "module"` in package.json, `verbatimModuleSyntax` in tsconfig)
- All local imports must use `.js` extensions (e.g., `import { type ActivityEvent } from "./types.js"`)

## Tech Stack

| Layer      | Choice               | Status   |
| ---------- | -------------------- | -------- |
| Backend    | Fastify (TS)         | Complete |
| Database   | SQLite + Prisma      | Complete |
| ORM        | Prisma               | Complete |
| Frontend   | Next.js (App Router) | Complete |
| Desktop    | Electron             | Complete |
| Browser    | Chrome MV3 Extension | Complete |
| Editor     | VS Code Extension    | Complete |
| Validation | Zod                  | Complete |

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

| Status          | Meaning                                |
| --------------- | -------------------------------------- |
| `draft`         | Created, spec not written              |
| `specified`     | Spec complete                          |
| `planned`       | Technical plan written                 |
| `implementing`  | Claude actively working                |
| `implemented`   | Code done, ready for Codex review      |
| `review-failed` | Codex found issues — see review report |
| `approved`      | Done                                   |

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
