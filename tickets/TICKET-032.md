# TICKET-032: Production Docker Compose (API + Postgres + Redis)

## Status: `implemented`
## Priority: P0

## Summary
Create production-ready Docker deployment with multi-stage builds, Redis for rate limiting, and proper health checks for all services.

## Spec Reference
- Part of Phase 8: Deployment + SaaS Infrastructure

## Requirements
1. [x] Multi-stage Dockerfile (builder → runner) using Node 20 Alpine
2. [x] docker-compose.prod.yml with API, PostgreSQL 16, Redis 7 services
3. [x] Redis persistence with AOF and memory limits
4. [x] @fastify/rate-limit configured with Redis backend
5. [x] Health checks on all services
6. [x] Network isolation (prodhub-network)
7. [x] Non-root user in production container
8. [x] Environment template (.env.production.example)
9. [x] Detailed health endpoint returning database and redis status
10. [x] README.md with deployment documentation

## Acceptance Criteria
- [x] Dockerfile builds successfully with multi-stage approach
- [x] docker-compose.prod.yml starts all services with health checks
- [x] Rate limiting uses Redis instead of memory
- [x] GET /health returns { status, timestamp, uptime, database, redis }
- [x] All services restart unless-stopped
- [x] Environment variables configurable via .env file

## Dependencies
- Depends on: Phase 1-7 (all core features complete)
- Blocks: TICKET-033 (CI/CD), TICKET-034 (Landing Page), TICKET-035 (Monitoring)

## Files Created
| File | Purpose |
|------|---------|
| Dockerfile | Multi-stage API build (Node 20 Alpine) |
| docker-compose.prod.yml | Production stack: API + PostgreSQL + Redis |
| .env.production.example | Environment variable template |
| src/lib/redis.ts | Redis client singleton with ioredis |
| src/routes/health.ts | Detailed health check endpoint |
| README.md | Deployment documentation |

## Files Modified
| File | Change |
|------|--------|
| package.json | Added ioredis dependency |
| src/server.ts | Redis rate limiter, health route, graceful shutdown |

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-02-28 | — | draft | Claude | Ticket created |
| 2026-02-28 | draft | implementing | Claude | Implementation started |
| 2026-02-28 | implementing | implemented | Claude | All files created, ready for review |
