# TICKET-035: Structured Logging — Pino JSON Logs + Error IDs

## Status: `implemented`
## Priority: P2

## Summary
Add structured JSON logging via Fastify's built-in pino logger, unique request IDs, and error ID correlation for debugging. No Prometheus metrics — this is a local-first app.

## Spec Reference
- Spec: `/specs/001-monitoring-logging/spec.md`
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [x] Structured JSON log entries for every HTTP request (timestamp, request ID, method, path, status, duration)
2. [x] Error logs with message, stack trace, request context, user ID
3. [x] Unique error IDs in both client response and server log for 5xx errors
4. [x] Configurable log level via LOG_LEVEL env var
5. [x] Server lifecycle logging (startup, shutdown)
6. [x] Non-blocking logging (pino default)

## Acceptance Criteria
- [x] Every API request produces a structured JSON log entry
- [x] 5xx errors include error ID in response body and matching log entry
- [x] LOG_LEVEL=warn suppresses info-level logs
- [x] Tests verify logging behavior (23 tests)

## Dependencies
- Depends on: None
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-22 | — | draft | Claude | Ticket created with Prometheus metrics |
| 2026-03-23 | draft | specified | Claude | Descoped: removed Prometheus /metrics, kept structured logging + error IDs |
| 2026-03-23 | specified | implemented | Claude | Implementation complete: logger.ts, server.ts enhanced, 23 tests passing |
