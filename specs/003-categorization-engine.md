# Spec: Categorization Engine

> Ticket: TICKET-003 | Status: final

## Problem Statement
Events are ingested successfully, but category assignment is currently manual and not automatically derived from category rule patterns. The system needs deterministic, rule-based event categorization to power category summaries and downstream features.

## User Stories
### Story 1
As an API consumer, I want new heartbeats to be auto-categorized using category rules, so that category summaries are immediately useful.

### Story 2
As a user managing categories, I want creating or updating category rules to re-categorize existing events, so historical data remains consistent with current rules.

## Functional Requirements

### FR-1: Rule Matching
- Description: Match category rules against event `appName` and `windowTitle`.
- Input: Event strings + category `rules` string array.
- Output: Boolean match per category and zero-to-many assignments per event.
- Constraints: Rules are interpreted as case-insensitive regular expressions; invalid regex rules are rejected at validation time.

### FR-2: Auto-Categorize on Heartbeat
- Description: After `POST /api/events/heartbeat` creates an event, assign matching categories.
- Input: Newly created event (`id`, `appName`, `windowTitle`).
- Output: `CategoryAssignment` rows for all matching categories.
- Constraints: Duplicate assignments must not be created.

### FR-3: Backfill and Recategorize
- Description: Category rule changes re-apply assignments to existing events.
- Triggers:
  - `POST /api/categories`: run backfill for the new category.
  - `PATCH /api/categories/:id` when `rules` is provided: remove old assignments for that category, then re-scan all events.
- Output: Category assignments reflect latest rule set.
- Constraints: Works when rules are empty (results in zero assignments).

### FR-4: Validation
- Description: Category rules must be syntactically valid regex patterns.
- Input: `rules` in create/update category requests.
- Output: 400 validation error for invalid regex.
- Constraints: Existing validation contract remains `{ error: "..." }`.

## Non-Functional Requirements
- Performance: Recategorization must process events in batches to avoid loading all rows at once.
- Security: Use Prisma parameterized operations only; no string-interpolated SQL.
- Scalability: Use `createMany` with `skipDuplicates` for idempotent bulk assignment writes.

## Edge Cases
1. Multiple categories match the same event → all matching assignments are created.
2. Empty `rules` array → no assignments.
3. Invalid regex rule payload (e.g. `"("`) → request fails with 400.
4. Updating rules should remove stale assignments from old patterns.

## Out of Scope
- Rule priority/ordering or weighted scoring.
- User-level custom conflict resolution.
- Manual event-to-category override endpoints.

## Success Criteria
1. Matching categories are auto-assigned on heartbeat ingestion.
2. Category create/update keeps historical assignments in sync with rules.
3. Integration tests cover matching, recategorization, and invalid-regex validation.
