# TICKET-036: One-Command Local Setup

## Status: `implemented`
## Priority: P1

## Summary
Make ProdHub trivially easy to set up. A single command should install dependencies, create the SQLite database, generate an API key, start the API server + dashboard, and open the browser. Reduce first-run friction to near zero.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [ ] Setup script or npm script that runs: install → migrate → seed → start all services
2. [ ] Auto-creates SQLite database on first run
3. [ ] Auto-generates default user and API key
4. [ ] Starts both Fastify API (port 3000) and Next.js dashboard (port 3001)
5. [ ] Prints clear instructions on first run (dashboard URL, API key location)
6. [ ] Works on Windows, macOS, and Linux

## Acceptance Criteria
- [ ] Fresh clone → `pnpm setup && pnpm start:all` → dashboard opens in browser
- [ ] No manual database setup required
- [ ] No manual API key configuration required
- [ ] Clear console output showing what's running and where

## Dependencies
- Depends on: TICKET-032 (CI/CD validates the setup works)
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket created |
| 2026-03-23 | specified | implemented | Claude | All tasks complete: setup.mjs, package.json scripts, seed return type, first-run banner, 13 new tests (231/231 passing) |
