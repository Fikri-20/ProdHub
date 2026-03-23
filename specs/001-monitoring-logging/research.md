# Research: Structured Logging & Error Tracking

**Feature**: 001-monitoring-logging
**Date**: 2026-03-23

## R1: Fastify Pino Logger Configuration

**Decision**: Use Fastify's built-in pino logger options object instead of `logger: true`.

**Rationale**: Fastify natively integrates pino. Passing `logger: true` uses defaults. Passing a config object gives us control over log level, serializers, request ID generation, and redaction — all without adding dependencies.

**Alternatives considered**:
- `pino` standalone + manual request hooks — duplicates what Fastify already provides
- `winston` — different API, not native to Fastify, adds a dependency
- `bunyan` — unmaintained, no advantage over pino

**Key config options**:
```typescript
Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, hostname: req.hostname }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    redact: ["req.headers.authorization"],
  },
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
})
```

## R2: Request ID Generation & Propagation

**Decision**: Use `genReqId` Fastify option with `crypto.randomUUID()` as default, honoring incoming `X-Request-Id` header.

**Rationale**: Fastify's `genReqId` is called once per request and the ID is attached to `request.id` and included in every pino log line automatically. No manual propagation needed.

**Alternatives considered**:
- `uuid` npm package — unnecessary, `crypto.randomUUID()` is built-in since Node 19
- `cuid2` / `nanoid` — shorter IDs but UUID is standard and recognizable
- Custom middleware — unnecessary, `genReqId` is the Fastify-native approach

## R3: Error ID Generation for 5xx Responses

**Decision**: Generate a separate error ID (`crypto.randomUUID()`) in the error handler for 5xx errors. Include it in both the response body and the log entry.

**Rationale**: Error IDs are distinct from request IDs — a request may have multiple errors or retries. The error ID lets users correlate "Error ID: abc-123" in the browser to the exact log entry. The request ID is still logged alongside for full context.

**Alternatives considered**:
- Reuse request ID as error ID — conflates two concepts; a single request might generate multiple logged errors
- Sequential error counter — not unique across restarts, not useful for lookup
- Sentry-style fingerprinting — overkill for local-first app

## R4: Lifecycle Logging

**Decision**: Log startup (port, environment, log level) and shutdown events using `app.log.info()` at the appropriate lifecycle points.

**Rationale**: Already partially exists (`app.log.info("Connected to SQLite")`). Enhance with structured fields (port, env, logLevel) and add graceful shutdown logging via Fastify's `onClose` hook.

**Alternatives considered**:
- Process-level event listeners only — misses Fastify-specific lifecycle events
- Separate lifecycle logger — unnecessary complexity

## R5: Uncaught Exception / Unhandled Rejection Handling

**Decision**: Register `process.on("uncaughtException")` and `process.on("unhandledRejection")` handlers that log with full context then exit with code 1.

**Rationale**: Spec FR requires these to be logged before process exits. Pino's `pino.final()` ensures the last log entries are flushed synchronously before exit.

**Alternatives considered**:
- Let Node.js default handler crash without logging — violates spec
- Try to recover from uncaught exceptions — unsafe, Node.js docs recommend exit

## R6: Test Strategy

**Decision**: Test via `app.inject()` using the existing `buildApp()` helper pattern. Capture pino output by passing a writable stream (pino.destination) to the logger config.

**Rationale**: Fastify's inject method simulates HTTP requests without opening a port. To assert on log output, we configure pino to write to a test stream we can read back.

**Alternatives considered**:
- Spy on console.log — pino doesn't use console.log
- Read stdout in subprocess — complex, flaky in CI
- Mock pino — loses integration confidence
