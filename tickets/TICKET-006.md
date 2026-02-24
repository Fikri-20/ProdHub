# TICKET-006: API Key Auth for Desktop Agents

## Status: `implemented`

## Priority: P0

## Summary

Replace the temporary X-User-Id header with proper API key authentication. Desktop agents authenticate via `Authorization: Bearer <key>`. Keys are hashed (SHA-256) and stored in the database.

## Spec Reference

- Spec: /specs/006-api-key-auth.md

## Requirements

1. [x] Add `ApiKey` model to Prisma (hashed key, prefix, name, user relation)
2. [x] Create key generation utility (crypto.randomBytes + SHA-256 hashing)
3. [x] Add `POST /api/keys` — create API key, return raw key once
4. [x] Add `GET /api/keys` — list user's keys (prefix, name, timestamps)
5. [x] Add `DELETE /api/keys/:id` — soft-revoke a key
6. [x] Update middleware to support `Authorization: Bearer <key>` + fallback to X-User-Id
7. [x] Update tracker to send `Authorization: Bearer` header
8. [x] Integration tests for key CRUD, Bearer auth, revoked key rejection

## Acceptance Criteria

- [x] API key created with `POST /api/keys` returns raw key once
- [x] Subsequent `GET /api/keys` shows prefix but not raw key
- [x] `Authorization: Bearer <key>` resolves to correct userId
- [x] Revoked key returns 401
- [x] Invalid/missing key returns 401
- [x] X-User-Id still works as fallback (for dashboard, tests)
- [x] Tracker sends Bearer header when TRACKER_API_KEY is set

## Dependencies

- Depends on: TICKET-005 (User model)
- Blocks: TICKET-007 (tenant isolation audit)

## Status History

| Date       | From         | To           | By          | Notes                                       |
| ---------- | ------------ | ------------ | ----------- | ------------------------------------------- |
| 2026-02-24 | —            | draft        | Antigravity | Ticket created                              |
| 2026-02-24 | draft        | implementing | Antigravity | Implementation started                      |
| 2026-02-24 | implementing | implemented  | Antigravity | 65 tests pass, tsc 0 errors, build succeeds |
