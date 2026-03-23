# Data Model: Structured Logging & Error Tracking

**Feature**: 001-monitoring-logging
**Date**: 2026-03-23

## Overview

This feature does not add database models. All entities are transient log structures emitted to stdout/stderr. No Prisma schema changes required.

## Log Entry Entities

### Request Log Entry

Emitted for every HTTP request/response cycle.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| level | number | pino | Log level (30=info, 40=warn, 50=error) |
| time | number | pino | Unix timestamp in milliseconds |
| reqId | string (UUID) | genReqId | Unique request identifier |
| req.method | string | Fastify serializer | HTTP method (GET, POST, etc.) |
| req.url | string | Fastify serializer | Request URL path |
| res.statusCode | number | Fastify serializer | HTTP response status code |
| responseTime | number | Fastify | Response duration in milliseconds |
| msg | string | Fastify | "request completed" |

### Error Log Entry

Emitted when a 5xx error occurs. Extends the request context.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| level | number | pino | 50 (error) |
| time | number | pino | Unix timestamp in milliseconds |
| reqId | string (UUID) | genReqId | Request ID from the originating request |
| errorId | string (UUID) | error handler | Unique error identifier (also in response body) |
| err.message | string | Error object | Error message |
| err.stack | string | Error object | Stack trace |
| req.method | string | request context | HTTP method |
| req.url | string | request context | Request URL path |
| userId | string | request context | User ID if authenticated (from middleware) |

### Lifecycle Log Entry

Emitted at server start and shutdown.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| level | number | pino | 30 (info) |
| time | number | pino | Unix timestamp |
| msg | string | app code | "Server started" / "Server shutting down" / "Server stopped" |
| port | number | startup only | Listening port |
| environment | string | startup only | NODE_ENV value |
| logLevel | string | startup only | Configured log level |

## State Transitions

N/A — log entries are write-once, immutable, and transient.

## Validation Rules

- `errorId` must be a valid UUID v4
- `reqId` must be a valid UUID v4 (or honor incoming `X-Request-Id` header if valid)
- `LOG_LEVEL` env var must be one of: fatal, error, warn, info, debug, trace (default: info)
