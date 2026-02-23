# Spec: Zod Validation with fastify-type-provider-zod

> Ticket: TICKET-002 | Status: final

## Problem Statement
All route files use manual validation with `as Record<string, unknown>` casts, inline type checks, and ad-hoc error messages. This is error-prone, provides no compile-time type safety for request/response shapes, and duplicates validation logic across routes.

## User Stories
### Story 1
As a developer, I want request bodies/params/querystrings to be automatically validated by Zod schemas, so that handlers receive fully typed, validated data without manual checks.

### Story 2
As an API consumer, I want validation errors to return a consistent `{ error: "message" }` format with 400 status, so that I can programmatically handle errors.

## Functional Requirements

### FR-1: Shared Zod Schemas
- Description: Create reusable Zod schemas for all route inputs
- Schemas:
  - `heartbeatBodySchema` — validates deviceName, os, appName, windowTitle (non-empty trimmed strings), startTime/endTime (coerced dates), duration (positive int)
  - `eventsQuerySchema` — from/to (optional coerced dates), limit (optional int 1-1000, default 100), offset (optional int ≥0, default 0), appName (optional string)
  - `createCategoryBodySchema` — name (non-empty trimmed string), color (optional hex regex), rules (optional string array)
  - `updateCategoryBodySchema` — all fields optional
  - `categoryParamsSchema` — id (UUID string)
  - `summaryQuerySchema` — groupBy (enum "app"|"category"), from/to (optional coerced dates)

### FR-2: Fastify Type Provider Integration
- Description: Wire `validatorCompiler` and `serializerCompiler` from `fastify-type-provider-zod` into the Fastify instance
- Both server.ts and test helper must use the same configuration

### FR-3: Custom Error Handler
- Description: Catch Zod validation errors and format them as `{ error: "message" }` with 400 status
- Uses `hasZodFastifySchemaValidationErrors()` to detect Zod errors
- Extracts the first issue message for the error field
- Preserves existing API contract (same error response shape as manual validation)

### FR-4: Route Refactoring
- Description: Replace all manual validation in route handlers with `schema` options
- All `as Record<string, unknown>` casts removed
- All inline type checks removed
- Business logic validation preserved (404 not found, 409 duplicate name)

## Non-Functional Requirements

### NFR-1: Type Safety
- Route handlers must receive fully typed request objects via Zod inference
- No `as` casts for request body/params/querystring

### NFR-2: Backward Compatibility
- All existing tests must pass without changes to assertions
- API response format unchanged

## Edge Cases
- Whitespace-only string fields (e.g., `"   "`) must be trimmed then rejected as empty
- Invalid UUID params on category routes must return 400
- Extra fields in request body should be stripped by Zod

## Dependencies
- Depends on: TICKET-001 (API endpoints must exist to refactor)
- Blocks: TICKET-003 (categorization engine), TICKET-004 (tracker migration)
