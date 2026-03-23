# Contract: Setup Script & npm Scripts

**Feature**: 001-local-setup
**Date**: 2026-03-23

## `pnpm setup`

**What it does**: Prepares the environment for a fresh clone. Installs all dependencies, generates the Prisma client, and applies database migrations.

**Usage**: `pnpm setup`

**Exit codes**:
- `0` — all steps succeeded
- `1` — a step failed (error printed to stderr)

**Expected console output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ProdHub Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/4] Installing root dependencies...
[2/4] Installing web dependencies...
[3/4] Generating Prisma client...
[4/4] Running database migrations...

✓ Setup complete! Run `pnpm start:all` to start ProdHub.
```

**Idempotency**: Safe to run multiple times. `pnpm install` is idempotent. `prisma migrate deploy` is idempotent (no-ops when all migrations are applied).

---

## `pnpm start:all`

**What it does**: Starts the Fastify API server and Next.js dashboard concurrently.

**Usage**: `pnpm start:all`

**Processes started**:
| Label | Command | Port |
|-------|---------|------|
| `api` | `tsx src/server.ts` | 3000 |
| `web` | `next dev` (in `web/`) | 3001 |

**First-run console output** (printed once when a new API key is generated):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ProdHub is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Dashboard:   http://localhost:3001
  API:         http://localhost:3000
  API Key:     pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  To connect the desktop agent, set:
    TRACKER_API_URL=http://localhost:3000
    TRACKER_API_KEY=pk_xxxxxxxx...

  Open your dashboard: http://localhost:3001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Subsequent runs**: No banner printed (API key already exists).

---

## `seed-default-user` Return Value Contract

```typescript
// Before (returns void)
export async function seedDefaultUser(): Promise<void>

// After (returns rawKey on first run, null on subsequent)
export async function seedDefaultUser(): Promise<{ rawKey: string | null }>
```
