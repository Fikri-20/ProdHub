# Implementation Plan: Structured Logging & Error Tracking

**Branch**: `001-monitoring-logging` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-monitoring-logging/spec.md`

## Summary

Enhance the Fastify API server's existing basic pino logger (`logger: true`) into a fully configured structured logging system with JSON output, request IDs, error IDs, configurable log levels, and lifecycle event logging. The implementation leverages Fastify's native pino integration — no new dependencies required.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict, ESM-only)
**Primary Dependencies**: Fastify 5.7.4 (ships with pino), `crypto.randomUUID()` (Node.js built-in)
**Storage**: N/A (logs go to stdout/stderr, no persistence layer)
**Testing**: Vitest (existing test harness with `buildApp()` helper)
**Target Platform**: Node.js (local-first, runs on user's machine)
**Project Type**: Web service (Fastify API server)
**Performance Goals**: Non-blocking logging (pino default), zero measurable impact on API response times
**Constraints**: No new npm dependencies; must use Fastify's native pino integration; ESM-only with `.js` import extensions
**Scale/Scope**: Single-user local server; structured logs for debugging, not high-volume log aggregation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Tests mandatory | PASS | Will write tests for logger config, request ID propagation, error ID generation, lifecycle logging |
| No silent failures | PASS | Error handler enhanced with error IDs; uncaught exceptions logged before exit |
| Security first | PASS | No secrets in logs; request headers sanitized; user IDs included only from auth context |
| DRY but readable | PASS | Logger config centralized; error handler in one place |
| Spec-driven workflow | PASS | Spec complete, plan in progress |
| Constitution tech stack | PASS | Fastify + pino (native), TypeScript strict ESM, Vitest |

**Gate result: PASS** — No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-monitoring-logging/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── error-response.md
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── logger.ts            # NEW — pino logger config factory
├── server.ts                # MODIFY — use configured logger, add lifecycle logging
├── middleware/
│   └── user.ts              # READ ONLY — userId already on request, no changes needed
└── tests/
    └── routes/
        └── logging.test.ts  # NEW — tests for structured logging, error IDs, request IDs
```

**Structure Decision**: Minimal footprint — one new lib file for logger config, modify existing server.ts error handler, one new test file. No new directories needed.

## Complexity Tracking

No violations to justify — implementation uses only Fastify's built-in pino features and Node.js `crypto.randomUUID()`.
