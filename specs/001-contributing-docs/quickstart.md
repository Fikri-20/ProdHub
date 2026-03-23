# Quickstart: Contributing Docs & Architecture Guide

**Feature**: 001-contributing-docs
**Date**: 2026-03-23

## Files to Create

| File | Action | Purpose |
|------|--------|---------|
| `CONTRIBUTING.md` | CREATE | Full contributor guide at repository root |

## Implementation Order

1. **Read existing sources** — CLAUDE.md, package.json, tsconfig.json for accurate command and convention details
2. **Write `CONTRIBUTING.md`** — 6 sections in contributor-journey order

## Sections in CONTRIBUTING.md

1. **Prerequisites** — Node.js 20+, pnpm 10+, Git
2. **Dev Environment Setup** — `git clone`, `pnpm setup`, `pnpm start:all`, verify URLs
3. **Development Workflow** — Branch naming, commit format, `pnpm test`, opening a PR
4. **Testing** — Backend tests, web tests, what the test suites cover
5. **Architecture Overview** — 5 components, data flow diagram, auth pattern
6. **Code Conventions** — ESM, `.js` imports, strict TypeScript, Prisma scoping

## Verifying It Works

```bash
# On a fresh clone, follow CONTRIBUTING.md setup section:
git clone <repo>
cd ProdHub
pnpm setup
pnpm start:all

# Verify API
curl http://localhost:3000/health

# Verify dashboard
# Open http://localhost:3001

# Verify tests
pnpm test
# Expected: all tests pass
```
