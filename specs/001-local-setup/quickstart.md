# Quickstart: One-Command Local Setup

**Feature**: 001-local-setup
**Date**: 2026-03-23

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `scripts/setup.mjs` | CREATE | Setup orchestration script |
| `package.json` | MODIFY | Add `setup`, `start:all` scripts; add `concurrently` devDep |
| `src/lib/seed-default-user.ts` | MODIFY | Return `{ rawKey }` instead of void |
| `src/server.ts` | MODIFY | Print first-run banner using rawKey from seed |
| `src/tests/setup.test.ts` | CREATE | Tests for setup script and first-run banner |

## Implementation Order

1. **Install `concurrently`** — `pnpm add -D concurrently`
2. **`scripts/setup.mjs`** — sequential setup steps with clear console output
3. **`package.json`** — add `setup` and `start:all` scripts
4. **`src/lib/seed-default-user.ts`** — change return type to `{ rawKey: string | null }`
5. **`src/server.ts`** — use rawKey to conditionally print first-run banner
6. **`src/tests/setup.test.ts`** — test seed return value and banner logic

## Key Design Decisions

- **`spawnSync` with args array** in setup.mjs — avoids shell injection, cross-platform safe
- **`concurrently`** for `start:all` — single devDependency, handles Ctrl+C gracefully on all platforms
- **First-run detection** via `seed-default-user.ts` return value — no filesystem flag needed
- **`prisma migrate deploy`** in setup — non-interactive, CI-safe

## Verifying It Works

```bash
# Fresh setup (from repo root)
pnpm setup

# Start everything
pnpm start:all

# Verify API
curl http://localhost:3000/health

# Open dashboard
open http://localhost:3001   # macOS
start http://localhost:3001  # Windows
xdg-open http://localhost:3001  # Linux
```
