# Spec: API Key Auth for Desktop Agents

> Ticket: TICKET-006 | Status: final

## Problem Statement

The API currently uses a temporary `X-User-Id` header for user identification. This is insecure for production — anyone can impersonate any user. Desktop agents need proper API key authentication.

## Functional Requirements

### FR-1: ApiKey Model

- Fields: id, userId, name, key (SHA-256 hash), prefix (first 8 chars), lastUsedAt, revokedAt, createdAt
- Raw key shown once at creation, stored as irreversible hash.

### FR-2: Key Management API

- `POST /api/keys` — generate key, return `{ id, name, prefix, rawKey }`. Requires X-User-Id.
- `GET /api/keys` — list user's keys (no raw key). Requires X-User-Id.
- `DELETE /api/keys/:id` — set `revokedAt`, returns 204. Requires X-User-Id.

### FR-3: Bearer Token Auth

- Middleware checks `Authorization: Bearer <rawKey>` first.
- Hashes the raw key, looks up `api_keys` where `key = hash AND revokedAt IS NULL`.
- Sets `request.userId` from the matched key's userId.
- Updates `lastUsedAt` on each successful auth.

### FR-4: Fallback to X-User-Id

- If no Bearer token, falls back to X-User-Id header (existing behavior).
- Both auth methods set `request.userId` identically.

### FR-5: Tracker Integration

- Reads `TRACKER_API_KEY` env var.
- Sends `Authorization: Bearer <key>` header on all heartbeat requests.

## Edge Cases

1. Revoked key → 401.
2. Invalid key format → 401.
3. Key belongs to deleted user → 401.
4. Multiple keys per user → all work independently.

## Success Criteria

1. Tracker authenticates via Bearer token.
2. Raw key never stored, only hash.
3. Existing X-User-Id flow continues to work.
4. All tests pass with both auth methods.
