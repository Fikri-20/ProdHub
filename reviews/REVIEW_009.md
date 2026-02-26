# Review Report: TICKET-009 - Next.js App Router Scaffold + Auth.js

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [ ] Linked spec file exists: Not met - `/specs/009-nextjs-auth-scaffold.md` is missing.
- [x] Auth.js route and config wired: Met - NextAuth handlers and auth config are present.
- [x] Protected dashboard routing in place: Met - proxy/dashboard auth checks redirect unauthenticated users.
- [x] API client scaffolding present: Met - server/client API helpers set `X-User-Id`.

## Test Coverage

- Tests run:
- `pnpm.cmd test` (repo root) - 114 passed, 0 failed.
- `pnpm.cmd build` (repo root) - passed.
- `pnpm.cmd test` (web) - 5 passed, 0 failed.
- `pnpm.cmd build` (web) - passed.
- `pnpm.cmd lint` (web) - failed.

## Issues Found

### Issue 1: Missing required spec artifact for this ticket

- Severity: major
- File: tickets/TICKET-009.md
- Line(s): No linked spec path; `/specs/009-nextjs-auth-scaffold.md` is absent.
- Problem: Required spec-first workflow is not satisfied, so formal approval is blocked.
- Suggested fix: Add and link the spec file, then rerun review.

### Issue 2: Lint gate currently fails in ticket-owned test code

- Severity: major
- File: web/src/__tests__/api-client.test.ts
- Line(s): 26, 44
- Problem: `pnpm.cmd lint` fails with `@typescript-eslint/no-explicit-any` errors. This leaves the web workspace in a failing quality-gate state.
- Suggested fix: Replace `any` in those tests with explicit typed test fixtures/mocks.

## Security Check

- [x] No exposed secrets
- [x] Input validation present in API layer
- [x] No direct injection vulnerability observed in reviewed changes

## Summary

Core scaffold works and builds, but approval is blocked by missing spec documentation and a failing lint gate.
