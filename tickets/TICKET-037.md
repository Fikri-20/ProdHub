# TICKET-037: Contributing Docs & Architecture Guide

## Status: `draft`
## Priority: P2

## Summary
Create CONTRIBUTING.md with development setup instructions, code conventions, and PR workflow. Add an architecture overview for new contributors to understand how the pieces fit together.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [ ] CONTRIBUTING.md: dev setup, branch naming, commit format, PR process
2. [ ] Architecture section: how API server, dashboard, desktop agent, browser extension, and VS Code extension connect
3. [ ] Data flow diagram or description: heartbeat → API → SQLite → dashboard
4. [ ] Testing guide: how to run backend tests, web tests, extension tests
5. [ ] Code conventions: ESM, .js imports, strict TypeScript, Prisma patterns

## Acceptance Criteria
- [ ] A new contributor can set up the dev environment by following CONTRIBUTING.md
- [ ] Architecture overview explains the relationship between all 5 components
- [ ] Test instructions work on a fresh clone

## Dependencies
- Depends on: None
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket created |
