# TICKET-007: Tenant Isolation — All Queries Scoped to User

## Status: `implemented`

## Priority: P0

## Summary

Audit and harden tenant isolation across all API endpoints. Ensure no query can leak data across users. Exclude health check endpoint from auth middleware.

## Requirements

1. [x] Exclude health endpoint from auth
2. [x] Comprehensive cross-tenant integration test suite
3. [x] Audit confirmation: all routes already scope by userId (TICKET-005)

## Acceptance Criteria

- [x] `/api/events/health` returns 200 without auth headers
- [x] Dedicated isolation test file covers all endpoints cross-tenant
- [x] All existing tests continue to pass

## Tenant Isolation Audit

| Route | Method | Scoping | Status |
|-------|--------|---------|--------|
| `/api/events/health` | GET | Public (no auth) | Verified |
| `/api/events/heartbeat` | POST | `request.userId` → device upsert compound key includes `userId` | Verified |
| `/api/events` | GET | `device: { userId }` filter | Verified |
| `/api/categories` | GET | `where: { userId }` | Verified |
| `/api/categories` | POST | `userId` in create data + `name_userId` unique constraint | Verified |
| `/api/categories/:id` | GET | `findFirst({ where: { id, userId } })` | Verified |
| `/api/categories/:id` | PATCH | `findFirst({ where: { id, userId } })` | Verified |
| `/api/categories/:id` | DELETE | `findFirst({ where: { id, userId } })` | Verified |
| `/api/categories/:id/recategorize` | POST | `findFirst({ where: { id, userId } })` + service scoped | Verified |
| `/api/summary?groupBy=app` | GET | Raw SQL `WHERE d.user_id = ${userId}` | Verified |
| `/api/summary?groupBy=category` | GET | Raw SQL `WHERE c.user_id = ${userId}` | Verified |
| `/api/keys` | GET | `where: { userId }` | Verified |
| `/api/keys` | POST | `userId` in create data | Verified |
| `/api/keys/:id` | DELETE | `findFirst({ where: { id, userId } })` | Verified |
| `categorizeEvent()` | Service | `where: { userId }` for category lookup | Verified |
| `recategorizeForCategory()` | Service | `where: { userId }` for event lookup via device | Verified |

## Test Coverage

18 cross-tenant isolation tests in `src/tests/routes/isolation.test.ts`:

1. Health endpoint without auth → 200
2. Health endpoint with auth → 200
3. Heartbeat creates device scoped to user
4. Same device name for different users → separate records
5. GET events returns only requesting user's events
6. GET events returns empty for user with no events
7. GET categories returns only requesting user's categories
8. Same category name allowed for different users
9. GET category by ID → 404 for other user's category
10. PATCH category → 404 for other user's category
11. DELETE category → 404 for other user's category (still exists)
12. Recategorize → 404 for other user's category
13. Summary groupBy=app → only requesting user's data
14. Summary groupBy=category → only requesting user's data
15. GET keys → only requesting user's keys
16. DELETE key → 404 for other user's key
17. Auto-categorize uses only requesting user's rules
18. All protected endpoints return 401 without auth

## Dependencies

- Depends on: TICKET-005, TICKET-006

## Status History

| Date       | From         | To           | By          | Notes                       |
| ---------- | ------------ | ------------ | ----------- | --------------------------- |
| 2026-02-24 | —            | implementing | Antigravity | Audit + isolation hardening |
| 2026-02-24 | implementing | implemented  | Claude      | Health exclusion + 18 isolation tests |
