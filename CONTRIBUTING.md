# Contributing to ProdHub

Thank you for your interest in contributing! ProdHub is a privacy-first, open-source activity tracker. All data stays on your machine — no cloud, no telemetry.

This guide covers everything you need to go from a fresh clone to a merged pull request.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Dev Environment Setup](#dev-environment-setup)
3. [Development Workflow](#development-workflow)
4. [Testing](#testing)
5. [Architecture Overview](#architecture-overview)
6. [Code Conventions](#code-conventions)

---

## Prerequisites

You need the following installed before starting:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 20+ | `node --version` |
| pnpm | 10+ | `pnpm --version` |
| Git | Any recent | `git --version` |

**Install pnpm** (if you don't have it):

```bash
npm install -g pnpm
```

---

## Dev Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/prodhub.git
cd prodhub

# 2. Install all dependencies, generate Prisma client, and run DB migrations
pnpm setup

# 3. Start the API server (port 3000) and dashboard (port 3001) concurrently
pnpm start:all
```

**Verify it's running:**

```bash
# API health check
curl http://localhost:3000/health
# → { "status": "ok" }

# Dashboard
# Open http://localhost:3001 in your browser
```

On first start, the console prints your API key and connection instructions:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ProdHub is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Dashboard:   http://localhost:3001
  API:         http://localhost:3000
  API Key:     pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The API key is also written to `~/.prodhub/agent.json` for the desktop agent and browser extension to auto-connect.

**Individual dev commands** (when you only need one service):

```bash
pnpm dev:server     # API server only, with hot reload
pnpm dev:web        # Dashboard only, with hot reload
pnpm db:studio      # Open Prisma Studio to inspect the database
```

---

## Development Workflow

### Branch naming

Branch names follow this format:

```
NNN-short-description
```

Where `NNN` is the ticket number (zero-padded to 3 digits). Examples:

```
036-local-setup
037-contributing-docs
038-fix-heatmap-query
```

Create your branch from `main`:

```bash
git checkout main
git pull
git checkout -b 037-contributing-docs
```

### Commit messages

Every commit message follows this format:

```
[TICKET-NNN] imperative short description
```

The description should complete the sentence "This commit will...". Examples:

```
[TICKET-036] add one-command local setup (pnpm setup + pnpm start:all)
[TICKET-035] add structured logging with pino, error IDs, request IDs
[TICKET-037] add CONTRIBUTING.md with architecture guide
```

- Keep the first line under 72 characters
- Use the imperative mood ("add", "fix", "remove" — not "added", "fixes", "removing")
- No period at the end

### Opening a pull request

1. Run the full test suite locally and confirm it passes:
   ```bash
   pnpm test
   ```
2. Push your branch:
   ```bash
   git push -u origin 037-contributing-docs
   ```
3. Open a PR against `main` on GitHub.
4. Fill in the PR description — what changed and why.
5. Address any review feedback and push additional commits.
6. Once approved, merge using "Squash and merge".

---

## Testing

### Backend + extensions

Run from the repository root:

```bash
pnpm test          # Run all tests once
pnpm test:watch    # Run in watch mode during development
```

This runs tests in `src/tests/` covering:
- API routes (`src/tests/routes/`)
- Services (`src/tests/services/`)
- Desktop agent (`src/tests/desktop/`)
- Browser extension (`src/tests/browser-extension/`)

> **Note**: Tests run sequentially (`fileParallelism: false`) because they share a single SQLite database file. Do not change this setting.

### Web dashboard

Run from the `web/` directory:

```bash
cd web && pnpm test
```

### TypeScript type check

```bash
pnpm typecheck
```

This runs `tsc --noEmit` across the backend. The web dashboard has its own TypeScript config — Next.js type-checks it during `pnpm build:web`.

### What to test

Every new feature or bug fix must include tests. Place them in the appropriate directory:

| What you changed | Where tests go |
|-----------------|----------------|
| API route | `src/tests/routes/` |
| Service/library | `src/tests/services/` |
| Dashboard component | `web/src/` (colocated or `__tests__/`) |

---

## Architecture Overview

ProdHub consists of 5 components that communicate through a central API.

### Components

| Component | Location | Port | Role |
|-----------|----------|------|------|
| **API Server** | `src/server.ts` | 3000 | Central data store. Ingests heartbeats, serves queries, manages auth. |
| **Next.js Dashboard** | `web/` | 3001 | User-facing UI. Heatmap, timeline, summary, categories, goals. |
| **Electron Desktop Agent** | `src/desktop/` | — | Polls active window every 5s, sends heartbeats to the API. |
| **Chrome Extension** | `browser-extension/` | — | Tracks active browser tab, sends heartbeats to the API. |
| **VS Code Extension** | `vscode-extension/` | — | Tracks active file and project, sends coding heartbeats to the API. |

### Data flow

```
┌─────────────────────────────────────────────────┐
│               Tracking Clients                  │
│  Desktop Agent  │  Chrome Ext  │  VS Code Ext   │
└────────┬────────┴──────┬───────┴───────┬─────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
              POST /api/events/heartbeat
              Authorization: Bearer pk_xxxxx
              {
                appName, windowTitle,
                startTime, endTime,
                duration, deviceId
              }
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Fastify API Server (:3000)  │
         │   src/server.ts               │
         │   • Validates API key         │
         │   • Zod schema validation     │
         │   • Auto-categorisation       │
         └──────────────┬────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Prisma ORM     │
              │  SQLite         │
              │  prisma/        │
              │  prodhub.db     │
              └────────┬────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  Next.js Dashboard (:3001)  │
         │  web/                       │
         │  GET /api/summary           │
         │  GET /api/heatmap           │
         │  GET /api/events            │
         └─────────────────────────────┘
```

### Auth

API keys use the `pk_` prefix and are SHA-256 hashed before storage. The raw key is shown once on first run and written to `~/.prodhub/agent.json`. Subsequent server starts read this file to reconnect automatically.

Send the key as a Bearer token:

```
Authorization: Bearer pk_your_api_key_here
```

### Database

SQLite file at `prisma/prodhub.db`. Key models:

- `User` — the single local user (admin@localhost)
- `ApiKey` — one or more API keys per user
- `Device` — tracked machines (desktop agent, browser, editor)
- `ActivityEvent` — individual heartbeat events
- `Category` — user-defined rules for grouping apps/URLs

No Docker required — SQLite is a file on your machine.

---

## Code Conventions

### ESM only

ProdHub uses ES modules exclusively. `"type": "module"` is set in `package.json`. All files are treated as ES modules — there is no CommonJS in the main source tree.

### `.js` extensions in imports

TypeScript is compiled with `"module": "nodenext"` resolution. This requires that import paths in `.ts` files use the **output** extension (`.js`), not the source extension (`.ts`):

```typescript
// ✅ Correct
import { seedDefaultUser } from "./seed-default-user.js";
import type { ActivityEvent } from "../types.js";

// ❌ Wrong
import { seedDefaultUser } from "./seed-default-user";
import { seedDefaultUser } from "./seed-default-user.ts";
```

This applies to all local imports. Third-party package imports do not need extensions.

### Strict TypeScript

The project uses three strict settings beyond `"strict": true`:

**`exactOptionalPropertyTypes`** — You cannot assign `undefined` to an optional field:

```typescript
type Config = { timeout?: number };

// ✅ Correct — omit the field entirely
const a: Config = {};

// ❌ Wrong — TypeScript error
const b: Config = { timeout: undefined };
```

**`noUncheckedIndexedAccess`** — Array and object index access returns `T | undefined`:

```typescript
const items = ["a", "b", "c"];

// ✅ Correct — handle the undefined case
const first = items[0]; // type: string | undefined
if (first) console.log(first.toUpperCase());

// ❌ Wrong — TypeScript error without the check
console.log(items[0].toUpperCase());
```

**`noUncheckedSideEffectImports`** — Side-effect-only imports must be verifiable. Don't use bare `import "some-module"` unless necessary.

### Prisma user scoping

Every database query that touches user data **must** include a `userId` filter. This ensures tenant isolation:

```typescript
// ✅ Correct — always scope to the requesting user
const events = await prisma.activityEvent.findMany({
  where: {
    userId: request.userId,
    startTime: { gte: from },
  },
});

// ❌ Wrong — returns data for all users
const events = await prisma.activityEvent.findMany({
  where: { startTime: { gte: from } },
});
```

The user ID is available as `request.userId` in route handlers (set by the user middleware).

### Zod at API boundaries

All incoming request data is validated with Zod schemas before use. Schemas live next to their routes in `src/schemas/`:

```typescript
import { z } from "zod";

const HeartbeatSchema = z.object({
  appName: z.string().min(1),
  duration: z.number().int().min(0),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
```

Never trust raw `request.body` directly — always parse through a schema first.

### No `any`

Avoid `any` types. If you genuinely need to bypass the type system (e.g., interfacing with a poorly-typed library), use `unknown` and narrow it with a type guard, or add a targeted `// @ts-ignore` with a comment explaining why.
