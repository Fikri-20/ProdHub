# Quickstart: Structured Logging & Error Tracking

**Feature**: 001-monitoring-logging
**Date**: 2026-03-23

## What This Feature Does

Enhances the Fastify API server with:
- **Structured JSON logs** for every request (method, path, status, duration, request ID)
- **Error IDs** in 5xx responses that match server log entries for easy debugging
- **Configurable log levels** via `LOG_LEVEL` environment variable
- **Lifecycle logging** (startup with port/env, shutdown events)
- **Uncaught exception handling** with logged context before graceful exit

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/logger.ts` | CREATE | Logger configuration factory (pino options, serializers, redaction) |
| `src/server.ts` | MODIFY | Use configured logger, enhance error handler with error IDs, add lifecycle logging |
| `src/tests/routes/logging.test.ts` | CREATE | Tests for all logging features |
| `src/tests/helpers.ts` | MODIFY | Update `buildApp()` to use configured logger for test parity |

## Implementation Order

1. **`src/lib/logger.ts`** — Logger config factory (no dependencies on other new code)
2. **`src/server.ts`** — Integrate logger config, enhance error handler, add lifecycle/process handlers
3. **`src/tests/helpers.ts`** — Update test helper to match server logger setup
4. **`src/tests/routes/logging.test.ts`** — Write tests

## Key Design Decisions

- **Zero new dependencies** — uses Fastify's built-in pino and Node.js `crypto.randomUUID()`
- **Request IDs** via `genReqId` option — honors incoming `X-Request-Id` or generates UUID
- **Error IDs** are separate from request IDs — generated in error handler, included in both response and log
- **Log output** goes to stdout only — users pipe/redirect as needed
- **Non-blocking** — pino's async nature is the default, no special configuration needed

## Configuration

```bash
# Set log level (default: info)
LOG_LEVEL=debug pnpm dev:server

# Valid levels: fatal, error, warn, info, debug, trace
```

## Verifying It Works

```bash
# Start server
pnpm dev:server

# Send a request — see structured JSON log
curl http://localhost:3000/api/events?from=2024-01-01

# Trigger a 5xx — see errorId in both response and log
# (Force an error by stopping the database mid-request, or add a test route)

# Check request ID in response header
curl -v http://localhost:3000/health 2>&1 | grep x-request-id
```
