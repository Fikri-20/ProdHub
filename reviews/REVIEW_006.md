# Review Report: TICKET-006 - API Key Auth for Desktop Agents

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [x] FR-1 ApiKey model and hashed storage: Met.
- [x] FR-2 Key CRUD endpoints implemented: Met.
- [x] FR-3 Bearer auth resolution + hash lookup + revocation checks: Met.
- [x] FR-4 Fallback to `X-User-Id`: Met.
- [x] FR-5 Tracker sends Bearer when key is configured: Met.
- [ ] FR-2 "requires X-User-Id" for key-management endpoints: Not met as implemented.

## Test Coverage

- Tests run: `pnpm.cmd test` (repo root) - 114 passed, 0 failed.
- Build run: `pnpm.cmd build` (repo root) - passed.
- Existing key tests focus on happy-path CRUD, revocation, and bearer auth on protected data routes.
- Missing coverage: no test asserts key-management routes reject Bearer auth.

## Issues Found

### Issue 1: Key-management routes are accessible with Bearer API keys

- Severity: major
- File: src/middleware/user.ts:38
- File: src/routes/keys.ts:11
- Problem: Middleware authenticates any route via Bearer and sets `request.userId`; key routes rely only on `request.userId`, so API keys can create/list/revoke keys. Ticket spec states key management requires `X-User-Id` (dashboard flow).
- Suggested fix: Restrict `/api/keys*` to header-based dashboard auth, or add explicit auth-strategy checks in key routes.

## Security Check

- [x] No exposed secrets
- [x] Input validation present
- [x] No injection vulnerabilities observed

## Summary

Most API-key functionality is correct, but authorization scope for key-management endpoints does not match the ticket spec and should be tightened.
