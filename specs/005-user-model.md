# Spec: User Model + Data Relations

> Ticket: TICKET-005 | Status: final

## Problem Statement

All data (devices, categories, events) is currently global — any API consumer sees all data. For a multi-user SaaS, each user's data must be isolated. This requires a User model and userId foreign keys on all owned entities.

## User Stories

### Story 1

As a user, I want my activity data to be private, so that other users cannot see my tracked events or categories.

### Story 2

As a user, I want to create categories with names that might already be used by other users, without conflicts.

## Functional Requirements

### FR-1: User Model

- Fields: `id` (UUID), `email` (unique), `name` (optional), `createdAt`
- Constraints: Email must be unique across the system.

### FR-2: Device Ownership

- Add `userId` FK to Device model.
- Unique constraint becomes `(name, os, userId)` — same device on different users is distinct.

### FR-3: Category Ownership

- Add `userId` FK to Category model.
- Unique constraint becomes `(name, userId)` — same category name allowed across users.

### FR-4: User Identification (Pre-Auth)

- Temporary `X-User-Id` header required on all API requests.
- Middleware validates UUID format, checks user exists, returns 401 if missing/invalid.
- Will be replaced by API key auth in TICKET-006.

### FR-5: Query Scoping

- All event queries filter by `device.userId`.
- All category queries filter by `userId`.
- Summary aggregation scoped to user's data only.

### FR-6: Categorization Scoping

- `categorizeEvent` only matches against the user's categories.
- `recategorizeForCategory` only scans the user's events.

## Non-Functional Requirements

- Migration must handle existing data (existing rows get a default user or migration is run on empty DB).
- No breaking changes to API response format — only userId scoping is added.

## Edge Cases

1. Request without X-User-Id header → 401.
2. X-User-Id is valid UUID but user doesn't exist → 401.
3. Two users create category with same name → both succeed (scoped uniqueness).
4. Device shared across users → separate device records per user.

## Success Criteria

1. All routes require and respect X-User-Id.
2. User A's data is invisible to User B.
3. All existing tests updated and passing with user context.
