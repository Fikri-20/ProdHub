# TICKET-032: Fix CI/CD — GitHub Actions with SQLite

## Status: `draft`
## Priority: P0

## Summary
Update GitHub Actions CI workflow to work with SQLite (no Postgres/Redis services). Ensure backend tests, web tests, TypeScript checks, and builds all pass in CI.

> **Note:** This ticket replaces the original TICKET-032 (Docker + Postgres + Redis) which was part of the old SaaS-oriented Phase 8. The project is now open-source and local-first — see ADR-005 in PLAN.md.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [ ] `.github/workflows/ci.yml` runs on push to main/dev and PRs
2. [ ] No external services (Postgres, Redis) — SQLite is the database
3. [ ] Steps: install → generate Prisma → migrate → build → test → TypeScript check
4. [ ] Web tests included (install web deps → build → test → tsc)
5. [ ] pnpm cache for faster CI runs

## Acceptance Criteria
- [ ] CI workflow passes on a clean checkout (SQLite DB created by migration)
- [ ] All backend tests pass in CI
- [ ] All web tests pass in CI
- [ ] TypeScript checks pass for both root and web

## Dependencies
- Depends on: None
- Blocks: TICKET-036 (One-command setup)

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket rewritten for open-source local-first Phase 8 |
