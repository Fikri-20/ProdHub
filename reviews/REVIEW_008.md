# Review Report: TICKET-008 - Rate Limiting + CORS

**Reviewer**: Codex
**Date**: 2026-02-25
**Verdict**: CHANGES_REQUESTED

## Spec Compliance

- [ ] Linked spec file exists: Not met - `/specs/008-rate-limit-cors.md` is missing.
- [x] CORS plugin registered and working: Met - preflight and normal responses include CORS headers.
- [x] Rate limiting configured and enforced: Met - 429 behavior and headers validated in tests.
- [x] Health endpoint exempt from rate limiting: Met - no rate-limit headers on `/api/events/health`.
- [x] Per-user rate-limit keying: Met - counters split by `request.userId`.

## Test Coverage

- Tests run: `pnpm.cmd test` (repo root) - 114 passed, 0 failed.
- Build run: `pnpm.cmd build` (repo root) - passed.
- Targeted evidence: `src/tests/routes/rate-limit-cors.test.ts` (6 tests) passed.

## Issues Found

### Issue 1: Missing required spec artifact for this ticket

- Severity: major
- File: tickets/TICKET-008.md
- Line(s): Spec reference section is missing; corresponding `/specs/008-rate-limit-cors.md` file does not exist.
- Problem: Governance requires spec-backed implementation and review. Without a linked spec, this ticket is not formally approvable.
- Suggested fix: Add a spec file under `/specs`, link it from the ticket, and rerun review.

## Security Check

- [x] No exposed secrets
- [x] Input validation present
- [x] No injection vulnerabilities observed

## Summary

Runtime behavior and tests are good, but approval is blocked until a proper spec artifact exists for this ticket.
