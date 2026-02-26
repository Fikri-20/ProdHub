# TICKET-008: Rate Limiting + CORS

## Status: `review-failed`

## Priority: P0

## Summary

Add rate limiting and CORS configuration to protect the API from abuse and prepare for the Next.js dashboard (Phase 4).

## Requirements

1. [x] Register `@fastify/cors` with configurable origins via `CORS_ORIGIN` env var
2. [x] Register `@fastify/rate-limit` with 100 req/min default per user (or per IP)
3. [x] Health endpoint exempt from rate limiting
4. [x] Heartbeat endpoint has higher limit (200 req/min) for frequent desktop agent pings
5. [x] Per-user rate limit counters (authenticated users tracked by userId, not IP)
6. [x] Test suite covering CORS headers, rate limit headers, 429 responses, and per-user isolation

## Acceptance Criteria

- [x] `OPTIONS` preflight returns CORS headers
- [x] Normal responses include CORS headers
- [x] Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) present on responses
- [x] Returns 429 when rate limit exceeded
- [x] Health endpoint has no rate limit headers
- [x] Different users have independent rate limit counters
- [x] All existing tests continue to pass

## Implementation Details

### Plugin Registration Order (server.ts)

1. CORS (`@fastify/cors`) — before auth so OPTIONS preflight works
2. User middleware — sets `request.userId`
3. Rate limit (`@fastify/rate-limit`) — after user middleware with `hook: "preHandler"` so `request.userId` is available for the key generator

### Configuration

- `CORS_ORIGIN` env var: comma-separated allowed origins (default: `http://localhost:3000`)
- `credentials: true` for cookie-based auth (Auth.js in Phase 4)
- Global rate limit: 100 req/min per user
- Heartbeat override: 200 req/min
- Health endpoint: rate limit disabled

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added `@fastify/rate-limit`, `@fastify/cors` |
| `src/server.ts` | Registered CORS + rate-limit plugins |
| `src/routes/events.ts` | Health: disabled rate limit; Heartbeat: raised to 200/min |
| `src/tests/helpers.ts` | Registered CORS + rate-limit with configurable max |
| `src/tests/routes/rate-limit-cors.test.ts` | 6 test cases |

## Test Coverage

6 tests in `src/tests/routes/rate-limit-cors.test.ts`:

1. OPTIONS preflight returns CORS headers
2. Normal GET includes CORS headers
3. Rate limit headers present on responses
4. Returns 429 when rate limit exceeded
5. Health endpoint has no rate limit headers
6. Different users have independent rate limit counters

## Dependencies

- Depends on: TICKET-005, TICKET-006, TICKET-007

## Review Report

- Review: /reviews/REVIEW_008.md

## Status History

| Date       | From         | To           | By     | Notes                              |
| ---------- | ------------ | ------------ | ------ | ---------------------------------- |
| 2026-02-24 | —            | implementing | Claude | Rate limiting + CORS implementation |
| 2026-02-24 | implementing | implemented  | Claude | All 6 tests passing                |
| 2026-02-25 | implemented  | review-failed | Codex | See /reviews/REVIEW_008.md (missing linked spec file) |
