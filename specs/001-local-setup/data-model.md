# Data Model: One-Command Local Setup

**Feature**: 001-local-setup
**Date**: 2026-03-23

## Overview

This feature does not add or modify database models. It orchestrates existing infrastructure (Prisma migrations, seed logic) and adds npm scripts + a setup helper script.

## Script Entities

### Setup Script (`scripts/setup.mjs`)

A Node.js ESM module with a single responsibility: run setup steps in order and exit with a clear success/failure message.

| Property | Value |
|----------|-------|
| Runtime | Node.js (no TypeScript compile step needed) |
| Format | ESM (.mjs) |
| Side effects | Runs pnpm install, prisma generate, prisma migrate deploy |
| Exit code | 0 on success, 1 on any step failure |

**Steps executed in order:**
1. `pnpm install --frozen-lockfile` — root dependencies
2. `pnpm install --frozen-lockfile --filter web` — web dashboard dependencies
3. `pnpm db:generate` — generate Prisma client
4. `npx prisma migrate deploy` — apply DB migrations (non-interactive)

### Seed Return Value (modified)

`seed-default-user.ts` currently returns `void`. After this change it returns `{ rawKey: string | null }` where `rawKey` is only populated when a new API key was just created (first run).

| Field | Type | Description |
|-------|------|-------------|
| rawKey | string \| null | The plaintext API key if newly generated; null on subsequent runs |

## State Transitions

```
Fresh clone
  → pnpm setup → DB created, client generated, migrations applied
  → pnpm start:all → Server starts, seed runs, API key printed (first run only)
  → pnpm start:all (again) → Server starts, no API key printed (idempotent)
```
