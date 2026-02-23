# TICKET-003: Categorization Engine

## Status: `implemented`
## Priority: P0

## Summary
Implement automatic rule-based categorization so events are assigned to matching categories at ingest time, and category rule changes re-categorize historical events.

## Spec Reference
- Spec: /specs/003-categorization-engine.md

## Requirements
1. [x] Add rule-matching service for category regex against app/window fields
2. [x] Auto-categorize newly created events in `POST /api/events/heartbeat`
3. [x] Backfill assignments after `POST /api/categories`
4. [x] Re-categorize assignments after `PATCH /api/categories/:id` when rules change
5. [x] Reject invalid regex rules in category create/update validation
6. [x] Add integration tests for assignment, backfill, recategorization, and invalid regex

## Acceptance Criteria
- [x] Heartbeat creating a matching event also creates category assignments
- [x] One event can be assigned to multiple matching categories
- [x] Creating a category with rules backfills matching historical events
- [x] Updating a category’s rules removes stale assignments and re-applies new matches
- [x] Invalid regex rules return 400 with existing validation format

## Dependencies
- Depends on: TICKET-001, TICKET-002
- Blocks: TICKET-024 (domain categorization)

## Review Report
- Review: /reviews/REVIEW_003.md

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-02-23 | — | draft | Codex | Ticket created from PLAN scope |
| 2026-02-23 | draft | implementing | Codex | Implementation started |
| 2026-02-23 | implementing | implemented | Codex | Categorization service wired into routes with test coverage additions |
