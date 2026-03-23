# Research: Contributing Docs & Architecture Guide

**Feature**: 001-contributing-docs
**Date**: 2026-03-23

## R1: CONTRIBUTING.md Structure for Open-Source TypeScript Projects

**Decision**: Single `CONTRIBUTING.md` at the repository root with 6 sections: Prerequisites → Setup → Development Workflow (branch/commit/PR) → Testing → Architecture → Code Conventions.

**Rationale**: GitHub surfaces `CONTRIBUTING.md` automatically in the "How to contribute" prompt on Issues and PRs. A single file is easier to maintain than splitting into `docs/`. The section order mirrors the natural contributor journey: get set up → understand workflow → run tests → understand architecture → write code.

**Alternatives considered**:
- `docs/CONTRIBUTING.md` + `docs/ARCHITECTURE.md` — adds indirection, GitHub doesn't surface sub-directory files automatically
- README.md sections — README is already long; CONTRIBUTING.md is the standard separation

---

## R2: Workflow Conventions (sourced from existing project)

**Decision**: Document conventions as they already exist in CLAUDE.md and the repo's git history.

**Branch naming**: `[ticket-number]-[short-description]` (e.g., `036-local-setup`, `037-contributing-docs`) — matches existing branch history.

**Commit message format**: `[TICKET-NNN] short imperative description` — matches all recent commits (e.g., `[TICKET-035] add structured logging with pino, error IDs, request IDs`).

**PR process**: Branch → implement → `pnpm test` → open PR against `main` → Codex review → address feedback → merge.

---

## R3: Architecture Components (sourced from codebase)

**Decision**: Document all 5 active components with their ports, responsibilities, and communication patterns.

| Component | Entry Point | Port | Role |
|-----------|-------------|------|------|
| API Server | `src/server.ts` | 3000 | Central data store and query engine |
| Next.js Dashboard | `web/` | 3001 | User-facing visualization |
| Electron Desktop Agent | `src/desktop/main.ts` | — | Active window polling → heartbeats |
| Chrome Extension | `browser-extension/src/background.ts` | — | Active tab tracking → heartbeats |
| VS Code Extension | `vscode-extension/src/extension.ts` | — | File/project tracking → heartbeats |

**Data flow** (from tracking client to dashboard):
```
Tracking Client (Desktop / Browser / VS Code)
  → POST /api/events/heartbeat
    headers: Authorization: Bearer pk_xxxxx
    body: { appName, windowTitle, startTime, endTime, duration, deviceId }
  → Fastify API Server (src/server.ts:3000)
  → Prisma ORM
  → SQLite (prisma/prodhub.db)

Next.js Dashboard (web/:3001)
  → GET /api/summary?groupBy=app
  → GET /api/heatmap?year=2026
  → GET /api/events?limit=100
  → Rendered as heatmap, timeline, summary charts
```

**Auth pattern**: API keys (`pk_` prefix, SHA-256 hashed in DB). Generated on first server start. Stored in `~/.prodhub/agent.json` for auto-connect.

---

## R4: Code Conventions (sourced from tsconfig.json and existing code)

**Decision**: Document the 4 most impactful conventions that differ from typical TypeScript projects.

1. **ESM-only**: `"type": "module"` in `package.json`. All files are ES modules.
2. **`.js` import extensions**: Even in `.ts` files, imports use `.js` extension (TypeScript's `nodenext` module resolution requirement): `import { foo } from "./bar.js"` — NOT `"./bar"` or `"./bar.ts"`.
3. **Strict TypeScript trio**: `exactOptionalPropertyTypes` (can't assign `undefined` to optional fields), `noUncheckedIndexedAccess` (array/object index access returns `T | undefined`), `strict: true`.
4. **Prisma scoping**: All queries include `where: { userId: request.userId }` to ensure tenant isolation. Never query without user scope.

---

## R5: Testing Structure (sourced from vitest.config.ts and test directories)

**Decision**: Document 3 separate test suites, each run independently.

| Suite | Command | Config | Location |
|-------|---------|--------|----------|
| Backend (API) | `pnpm test` (root) | `vitest.config.ts` | `src/tests/routes/`, `src/tests/services/` |
| Web Dashboard | `pnpm test` (in `web/`) | `web/vitest.config.ts` | `web/src/` |
| Extensions | Covered by root `pnpm test` | `vitest.config.ts` | `src/tests/browser-extension/`, `src/tests/desktop/` |

**Note**: `fileParallelism: false` in root vitest config — tests run sequentially to avoid SQLite write conflicts.
