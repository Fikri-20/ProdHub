# Contract: Error Response with Error ID

**Feature**: 001-monitoring-logging
**Date**: 2026-03-23

## Overview

Defines the API error response format when a 5xx server error occurs. The error ID in the response matches the error ID in the server log, enabling direct correlation.

## Error Response Contract (5xx)

### Response Body

```json
{
  "error": "Internal Server Error",
  "errorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| error | string | Yes | Human-readable error message (generic for 5xx, specific for 4xx) |
| errorId | string (UUID) | Only for 5xx | Unique identifier matching the server log entry |

### Response Headers

| Header | Value | Description |
|--------|-------|-------------|
| X-Request-Id | UUID | The request ID for the current request (always present) |

## Existing Error Responses (unchanged)

### 400 Validation Error

```json
{
  "error": "Validation error message from Zod"
}
```

No `errorId` — validation errors are client-side issues, not server errors.

### 401 Authentication Error

```json
{
  "error": "Missing or invalid authentication"
}
```

No `errorId` — auth failures are expected, not server errors.

## Correlation Flow

1. Client sends request → server assigns `reqId` (UUID)
2. Request fails with 5xx → error handler generates `errorId` (UUID)
3. Response includes both `errorId` in body and `X-Request-Id` in header
4. Server log entry includes both `reqId` and `errorId`
5. User can search logs for `errorId` to find the exact error with full context
