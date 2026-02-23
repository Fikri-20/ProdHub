# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ActivityWatcher (ProdHub)** — a privacy-first, cross-platform activity tracker inspired by ActivityWatch. Currently in Phase 1: building a local CLI tracker that polls the active window and logs activity to SQLite.

See `PLAN.md` for the full phase-by-phase roadmap and `INSTRUCTIONS.md` for the mentoring/teaching context.

## Commands

```bash
pnpm dev          # Run tracker in watch mode (tsx --watch src/tracker.ts)
pnpm build        # Bundle with tsup → dist/tracker.js (ESM)
pnpm start        # Run built output (node dist/tracker.js)
```

Package manager is **pnpm** (v10.30.1). No test runner or linter is configured yet.

## Architecture

The app is a single long-running Node.js process that polls the active window every 5 seconds:

- **`src/tracker.ts`** — Entry point. Runs a `setInterval` loop using `get-windows` to detect the active window. On app switch, it logs the previous event (app name, window title, duration) to the database.
- **`src/database.ts`** — SQLite layer using `better-sqlite3`. Creates the `activity_events` table on import and exports `insertEvent()`. The DB file is `activity.db` in the project root.
- **`src/types.ts`** — Shared `ActivityEvent` type (appName, windowTitle, startTime, endTime, duration).
- **`src/query.ts`** — Placeholder for querying activity data.

## TypeScript Configuration

- Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled
- ESM-only (`"type": "module"` in package.json, `verbatimModuleSyntax` in tsconfig)
- All local imports must use `.js` extensions (e.g., `import { type ActivityEvent } from "./types.js"`)

## Planned Tech Stack (Future Phases)

Backend: Fastify + PostgreSQL + Prisma | Frontend: React + Vite + TanStack Query | Desktop: Electron | Validation: Zod
