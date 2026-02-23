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
  - [ ] 2.3 Build API endpoints (heartbeat, events query, summary, categories CRUD)
  - [ ] 2.4 Zod validation with fastify-type-provider-zod
  - [ ] 2.5 Categorization engine
  - [ ] 2.6 Migrate tracker to POST heartbeats to API

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
```

Package manager is **pnpm** (v10.30.1). No test runner or linter is configured yet.

## Architecture

### Tracker (Phase 1 — SQLite)
A single long-running Node.js process that polls the active window every 5 seconds:

- **`src/tracker.ts`** — Entry point. `setInterval` loop using `get-windows` to detect the active window. On app switch, logs the previous event to SQLite.
- **`src/database.ts`** — SQLite layer using `better-sqlite3`. Creates `activity_events` table and exports `insertEvent()`. DB file: `activity.db`.
- **`src/types.ts`** — Shared `ActivityEvent` type (appName, windowTitle, startTime, endTime, duration).
- **`src/query.ts`** — Placeholder for querying activity data.

### API Server (Phase 2 — PostgreSQL)
- **`src/server.ts`** — Fastify server on port 3000 with plugin architecture.
- **`src/routes/events.ts`** — Event routes plugin registered at `/api/events` prefix.

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
| Frontend   | React + Vite        | Not started |
| Desktop    | Electron            | Not started |
| Validation | Zod                 | Not started |
