# TICKET-033: CI/CD with GitHub Actions

## Status
implemented

## What
GitHub Actions workflows for automated testing, building, and Docker image publishing.

## Files Created
- `.github/workflows/ci.yml` — Run on every PR and push to main/dev
- `.github/workflows/docker-publish.yml` — Build & push Docker image on release/tag

## CI Workflow (ci.yml)
1. Trigger: push to main, dev; pull requests to main, dev
2. Matrix: Node 20
3. Services: PostgreSQL 16, Redis 7 (GitHub Actions service containers)
4. Steps:
   - Checkout code
   - Setup Node 20 + pnpm (via pnpm/action-setup)
   - pnpm install --frozen-lockfile
   - pnpm db:generate (Prisma client)
   - pnpm build (tsup backend build)
   - pnpm test (vitest — all tests)
   - cd web && pnpm install --frozen-lockfile && pnpm build (Next.js build check)
   - TypeScript check: npx tsc --noEmit (root) + cd web && npx tsc --noEmit
5. Env vars: DATABASE_URL pointing to service container, REDIS_URL to Redis service

## Docker Publish Workflow (docker-publish.yml)
1. Trigger: push tag v* (e.g., v1.0.0)
2. Steps:
   - Checkout
   - Login to GitHub Container Registry (GHCR)
   - Build Docker image (using existing Dockerfile)
   - Tag with version + latest
   - Push to ghcr.io/<owner>/prodhub

## Verification
- Push a branch, open a PR → CI workflow runs tests, TypeScript checks, builds
- Create a tag v0.1.0 → Docker publish workflow builds and pushes image