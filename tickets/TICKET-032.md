# TICKET-032: Fix CI/CD — GitHub Actions with SQLite

## Status: `implemented`
## Priority: P0

## Summary
Update GitHub Actions CI workflow to work with SQLite (no Postgres/Redis services). Ensure backend tests, web tests, TypeScript checks, and builds all pass in CI.

> **Note:** This ticket replaces the original TICKET-032 (Docker + Postgres + Redis) which was part of the old SaaS-oriented Phase 8. The project is now open-source and local-first — see ADR-005 in PLAN.md.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [x] `.github/workflows/ci.yml` runs on push to main/dev and PRs
2. [x] No external services (Postgres, Redis) — SQLite is the database
3. [x] Steps: install → generate Prisma → migrate → build → test → TypeScript check
4. [x] Web tests included (install web deps → build → test → tsc)
5. [x] pnpm cache for faster CI runs

## Acceptance Criteria
- [x] CI workflow passes on a clean checkout (SQLite DB created by migration)
- [x] All backend tests pass in CI (218/218)
- [x] All web tests pass in CI (26/26)
- [x] TypeScript checks pass for both root and web

## What was fixed
- **tsconfig.json**: Excluded `browser-extension/`, `vscode-extension/`, `desktop/` and their test dirs from root tsc (they have their own build pipelines)
- **categorization.ts**: Removed `skipDuplicates` from `createMany()` — not supported by Prisma's SQLite adapter (was root cause of 7 failing tests)
- **ci.yml**: Changed `pnpm db:migrate` to `npx prisma migrate deploy` (non-interactive for CI)
- **Test files**: Fixed `FastifyInstance` type mismatch — use `ReturnType<typeof buildApp>` instead of explicit `FastifyInstance` annotation
- **logger.ts**: Fixed `genReqId` type to use `IncomingMessage` instead of `FastifyRequest`

## Dependencies
- Depends on: None
- Blocks: TICKET-036 (One-command setup)

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket rewritten for open-source local-first Phase 8 |
| 2026-03-23 | draft | implemented | Claude | Fixed: tsconfig excludes, skipDuplicates bug, CI migrate command, test types |
