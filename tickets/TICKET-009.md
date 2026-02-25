# TICKET-009: Next.js App Router Scaffold + Auth.js

**Phase:** 4 — Next.js Dashboard
**Status:** `implemented`
**Depends On:** TICKET-006

## Description

Scaffold the Next.js dashboard in `web/` with Auth.js for Google, GitHub, and Email (magic link) authentication. The Next.js app runs on port 3001 alongside the Fastify API on port 3000.

## Scope

1. **Prisma schema** — Added `Account`, `Session`, `VerificationToken` models for Auth.js adapter. Updated `User` with `emailVerified`, `image`, `updatedAt`.
2. **Next.js scaffold** — Created via `create-next-app` with TypeScript, Tailwind, App Router, `src/` directory.
3. **Auth.js config** — `PrismaAdapter`, database sessions, Google/GitHub/Resend providers.
4. **Middleware** — Route protection redirecting unauthenticated users away from `/dashboard/*`.
5. **API client** — Server-side `apiClient()` and client-side `createClientApiClient()` for calling Fastify API with `X-User-Id`.
6. **Pages** — Sign-in page, dashboard layout with sidebar + header, placeholder dashboard page.
7. **Components** — `SignOutButton` client component.
8. **Environment** — `.env.example`, `.env.local`, CORS origin updated.

## Files Modified/Created

| File                                                  | Action                            |
| ----------------------------------------------------- | --------------------------------- |
| `prisma/schema.prisma`                                | Modified — Auth.js models         |
| `prisma/migrations/20260224141239_add_authjs_models/` | Created — Migration               |
| `package.json`                                        | Modified — Added `dev:web` script |
| `.env`                                                | Modified — Added `CORS_ORIGIN`    |
| `web/`                                                | Created — Entire Next.js scaffold |
| `web/src/auth.ts`                                     | Created — Auth.js configuration   |
| `web/src/middleware.ts`                               | Created — Route protection        |
| `web/src/lib/prisma.ts`                               | Created — Prisma client singleton |
| `web/src/lib/api-client.ts`                           | Created — API client utility      |
| `web/src/app/layout.tsx`                              | Modified — SessionProvider        |
| `web/src/app/page.tsx`                                | Modified — Auth redirect          |
| `web/src/app/auth/signin/page.tsx`                    | Created — Sign-in page            |
| `web/src/app/dashboard/layout.tsx`                    | Created — Dashboard shell         |
| `web/src/app/dashboard/page.tsx`                      | Created — Dashboard placeholder   |
| `web/src/components/auth/sign-out-button.tsx`         | Created — Sign-out button         |
| `web/src/types/next-auth.d.ts`                        | Created — Type augmentation       |
| `web/.env.example`                                    | Created — Template env            |
| `web/vitest.config.ts`                                | Created — Test config             |
| `web/src/__tests__/api-client.test.ts`                | Created — API client tests        |

## Acceptance Criteria

- [x] Migration applies without errors
- [x] Next.js builds successfully
- [x] Dev server starts on port 3001
- [x] Unauthenticated users redirect to `/auth/signin`
- [x] Sign-in page shows Google, GitHub, Email options
- [x] Dashboard layout has sidebar and header with sign-out
- [x] API client tests pass
