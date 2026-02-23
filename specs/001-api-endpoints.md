# Spec: API Endpoints (heartbeat, query, summary, categories CRUD)

> Ticket: TICKET-001 | Status: final

## Problem Statement
The tracker (Phase 1) logs to local SQLite. To support multi-device sync, a web dashboard, and future auth, we need a REST API that can ingest heartbeats, query events, aggregate summaries, and manage categories.

## User Stories
### Story 1
As a tracker agent, I want to POST heartbeats to the API, so that activity data is stored in PostgreSQL with device tracking.

### Story 2
As a dashboard consumer, I want to GET events with date range and pagination, so that I can display activity timelines.

### Story 3
As a dashboard consumer, I want to GET summary data grouped by app or category, so that I can render heatmaps and charts.

### Story 4
As a user, I want to manage categories (CRUD), so that I can organize my activity data.

## Functional Requirements

### FR-1: POST /api/events/heartbeat
- Description: Ingest a single activity event with device info
- Input: `{ deviceName, os, appName, windowTitle, startTime, endTime, duration }`
- Output: Created event with 201 status
- Constraints: All fields required, duration > 0, valid ISO dates, device upserted by (name, os)

### FR-2: GET /api/events
- Description: Query events with optional filters and pagination
- Input: Query params `?from=ISO&to=ISO&appName=string&limit=100&offset=0`
- Output: Array of events with device info, ordered by startTime desc
- Constraints: Defaults to last 24h, limit 100, offset 0

### FR-3: Categories CRUD
- Description: Full CRUD on categories
- Routes:
  - GET /api/categories — list all
  - POST /api/categories — create `{ name, color?, rules? }`
  - GET /api/categories/:id — get one
  - PATCH /api/categories/:id — update fields
  - DELETE /api/categories/:id — delete (cascades assignments)
- Constraints: Name required + unique (409 on duplicate), color is hex string, rules is string array

### FR-4: GET /api/summary
- Description: Aggregate event durations
- Input: Query params `?from=ISO&to=ISO&groupBy=app|category`
- Output: `[{ name, totalDuration, percentage }]` sorted by duration desc
- Constraints: groupBy required, defaults to last 24h for date range

## Non-Functional Requirements
- Performance: Queries should use database indexes (already defined in schema)
- Security: Manual input validation on all endpoints (Zod in TICKET-002)
- Scalability: Prisma client singleton to manage connection pool

## Edge Cases
1. Heartbeat with same device name/os — should upsert, not duplicate
2. GET events with no matching results — return empty array, not error
3. DELETE category that has assignments — cascade delete assignments
4. Summary with no events in range — return empty array
5. Invalid date formats in query params — return 400
6. Category name with leading/trailing whitespace — trim before uniqueness check

## Out of Scope
- Zod schema validation (TICKET-002)
- Automatic categorization engine (TICKET-003)
- Authentication/authorization (TICKET-005+)
- WebSocket real-time updates

## Success Criteria
1. All four endpoint groups functional and returning correct data
2. Integration tests pass for all routes
3. Server starts cleanly with Prisma connection
4. Manual curl verification succeeds
