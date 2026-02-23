# TICKET-002: Zod Validation with fastify-type-provider-zod

## Status: `approved`
## Priority: P0

## Summary
Replace manual request validation across all route files with Zod schemas and Fastify's type provider for automatic validation, error formatting, and full compile-time type inference.

## Spec Reference
- Spec: /specs/002-zod-validation.md

## Requirements
1. [x] Install zod and fastify-type-provider-zod
2. [x] Create shared Zod schemas for events, categories, and summary routes
3. [x] Wire validatorCompiler and serializerCompiler into Fastify instance
4. [x] Custom error handler that formats Zod errors as `{ error: "message" }`
5. [x] Refactor POST /api/events/heartbeat to use heartbeatBodySchema
6. [x] Refactor GET /api/events to use eventsQuerySchema
7. [x] Refactor POST /api/categories to use createCategoryBodySchema
8. [x] Refactor PATCH /api/categories/:id to use updateCategoryBodySchema + categoryParamsSchema
9. [x] Refactor GET/DELETE /api/categories/:id to use categoryParamsSchema (UUID validation)
10. [x] Refactor GET /api/summary to use summaryQuerySchema
11. [x] Update test helper with same type provider + error handler
12. [x] All 36 existing tests pass

## Acceptance Criteria
- [x] All manual `as Record<string, unknown>` casts removed from route handlers
- [x] All inline type checks and ad-hoc error messages replaced by Zod schemas
- [x] Route handlers receive fully typed+validated request bodies/params/queries
- [x] Validation errors return `{ error: "..." }` format (preserves API contract)
- [x] String fields are trimmed before validation (empty whitespace rejected)
- [x] Category :id params validated as UUID
- [x] Business logic validation preserved (404 not found, 409 duplicate)
- [x] `pnpm test` — all 36 tests pass
- [x] `pnpm build` — TypeScript compiles without errors

## Dependencies
- Depends on: TICKET-001 (API endpoints)
- Blocks: TICKET-003 (categorization engine), TICKET-004 (tracker migration)

## Review Report
- Review: /reviews/REVIEW_002.md

## Files Changed
- `package.json` — added zod@4.3.6, fastify-type-provider-zod@6.1.0
- **New:** `src/schemas/events.ts`, `src/schemas/categories.ts`, `src/schemas/summary.ts`
- `src/server.ts` — type provider + custom error handler
- `src/routes/events.ts` — replaced manual validation with schemas
- `src/routes/categories.ts` — replaced manual validation with schemas
- `src/routes/summary.ts` — replaced manual validation with schemas
- `src/tests/helpers.ts` — added type provider to test app

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-02-24 | — | draft | Claude | Ticket created |
| 2026-02-24 | draft | implementing | Claude | Implementation started |
| 2026-02-24 | implementing | implemented | Claude | All 36 tests passing, build succeeds, ready for review |
| 2026-02-23 | implemented | review-failed | Codex | See /reviews/REVIEW_002.md (missing linked spec, build verification failed in current environment) |
| 2026-02-24 | review-failed | implemented | Claude | Fixed: created /specs/002-zod-validation.md, added UUID + whitespace tests, build passes (40 total tests) |
| 2026-02-24 | implemented | approved | Codex | See /reviews/REVIEW_002_R2.md — all issues resolved |
