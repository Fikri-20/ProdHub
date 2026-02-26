# TICKET-005: User Model in Prisma + Relate All Data to userId

## Status: `approved`

## Priority: P0

## Summary

Add a User model to the Prisma schema and relate Device and Category to userId, enabling multi-tenant data scoping where each user's activity data is isolated.

## Spec Reference

- Spec: /specs/005-user-model.md

## Requirements

1. [x] Add `User` model with id, email (unique), name, createdAt
2. [x] Add `userId` FK to `Device` and `Category`
3. [x] Update `Device` unique constraint to `@@unique([name, os, userId])`
4. [x] Update `Category` unique constraint to `@@unique([name, userId])`
5. [x] Create user-extraction middleware (`X-User-Id` header, temporary pre-auth)
6. [x] Scope all route queries by `request.userId`
7. [x] Scope categorization service by user's categories/events
8. [x] Update all tests with user isolation verification

## Acceptance Criteria

- [x] User model exists with email uniqueness
- [x] Devices are scoped per user (same device name, different users = no conflict)
- [x] Categories are scoped per user (same category name, different users = no conflict)
- [x] Events query only returns the requesting user's data
- [x] Summary only aggregates the requesting user's data
- [x] Categorization only matches the user's own categories
- [x] Missing/invalid X-User-Id header returns 401

## Dependencies

- Depends on: TICKET-002 (Zod validation)
- Blocks: TICKET-006 (API key auth), TICKET-007 (tenant isolation), TICKET-008 (rate limiting)

## Review Report

- Review: /reviews/REVIEW_005.md

## Status History

| Date       | From         | To           | By          | Notes                                           |
| ---------- | ------------ | ------------ | ----------- | ----------------------------------------------- |
| 2026-02-24 | —            | draft        | Antigravity | Ticket created from PLAN scope                  |
| 2026-02-24 | draft        | implementing | Antigravity | Implementation started                          |
| 2026-02-24 | implementing | implemented  | Antigravity | All 52 tests pass, tsc 0 errors, build succeeds |
| 2026-02-25 | implemented  | approved     | Codex      | See /reviews/REVIEW_005.md |
