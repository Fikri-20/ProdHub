# ProdHub — Project Plan

> A privacy-first, cross-platform activity tracker with a GitHub-style heatmap dashboard.
> Delivered as a **hosted SaaS** — users download a lightweight desktop agent that reports to the cloud API.
> Built with: **Fastify + PostgreSQL + Prisma + Next.js + Auth.js + Electron + TypeScript**

---

## Tech Stack

| Layer      | Choice               | Why                                                         |
| ---------- | -------------------- | ----------------------------------------------------------- |
| Backend    | Fastify (TS)         | Fast, plugin-based, excellent TypeScript support            |
| Database   | PostgreSQL           | Relational data, time-range queries, multi-tenant ready     |
| ORM        | Prisma               | Type-safe queries, migrations, introspection                |
| Frontend   | Next.js (App Router) | SSR landing page + SPA dashboard, Auth.js integration       |
| Auth       | Auth.js              | OAuth (Google, GitHub) + email/password, session management |
| Desktop    | Electron             | System tray agent, sends heartbeats to hosted API           |
| Validation | Zod                  | Runtime + compile-time type safety for API layer            |

---

## Branching Strategy

```
main ← stable releases
  └── dev ← integration branch
        └── feat/TICKET-XXX-name ← one branch per ticket
```

- All work happens on `feat/` branches off `dev`.
- PRs merge into `dev` after Codex review passes.
- `dev` merges into `main` for releases.

---

## Phase 1: Foundation — Local Activity Tracker CLI ✅

**Goal:** Node.js background service that detects the active window and logs it locally.

- [x] **1.1** Set up TypeScript + Node.js project with `tsx` for dev and `tsup` for building
- [x] **1.2** Poll the active window every 5s using `active-win` — returns app name, window title, PID
- [x] **1.3** Core data model: `Event { id, timestamp, duration, appName, windowTitle }`
- [x] **1.4** Store events in SQLite using `better-sqlite3`
- [x] **1.5** Heartbeat logic: extend current event duration if same window is still active
- [x] **1.6** Run as background process, verify by querying the DB

**Milestone:** `node dist/tracker.js` → use computer → query SQLite → see activity log.

---

## Phase 2: REST API + Database (IN PROGRESS)

**Goal:** Fastify API that reads/writes activity data to PostgreSQL.

| Ticket     | Task                                                           | Status      |
| ---------- | -------------------------------------------------------------- | ----------- |
| —          | 2.1 Fastify server with plugin architecture                    | ✅ Complete |
| —          | 2.2 PostgreSQL (Docker) + Prisma schema                        | ✅ Complete |
| TICKET-001 | 2.3 API endpoints (heartbeat, query, summary, categories CRUD) | Pending     |
| TICKET-002 | 2.4 Zod validation with fastify-type-provider-zod              | Pending     |
| TICKET-003 | 2.5 Categorization engine                                      | ✅ Complete |
| TICKET-004 | 2.6 Migrate tracker to POST heartbeats to API                  | ✅ Complete |

**Endpoints (2.3):**

- `POST /api/events/heartbeat` — receives heartbeat from tracker, upserts event
- `GET /api/events?from=&to=&category=` — query events with time range and filters
- `GET /api/summary?from=&to=&groupBy=app|category` — aggregated summary
- `CRUD /api/categories` — manage categories and their rules

**Milestone:** Tracker → API → Postgres. `GET /api/summary?groupBy=category` returns aggregated time per category.

---

## Phase 3: Auth + Multi-Tenancy

**Goal:** Secure the API for multi-user SaaS. All data scoped to authenticated user.

| Ticket     | Task                                                | Status      |
| ---------- | --------------------------------------------------- | ----------- |
| TICKET-005 | 3.1 User model in Prisma, relate all data to userId | ✅ Complete |
| TICKET-006 | 3.2 API key auth for desktop agents                 | Pending     |
| TICKET-007 | 3.3 Tenant isolation — all queries scoped to user   | Pending     |
| TICKET-008 | 3.4 Rate limiting + CORS configuration              | Pending     |

**Why before the dashboard:** Adding auth after building the UI means retrofitting every query, route, and component. Doing it now keeps the codebase clean.

**Milestone:** Two test users can each track activity to the same API without seeing each other's data.

---

## Phase 4: Next.js Dashboard

**Goal:** Web dashboard for visualizing activity data, with Auth.js login.

| Ticket     | Task                                                                         | Status  |
| ---------- | ---------------------------------------------------------------------------- | ------- |
| TICKET-009 | 4.1 Next.js App Router scaffold + Auth.js (Google, GitHub, email)            | Pending |
| TICKET-010 | 4.2 Timeline View — vertical timeline, color-coded by category               | Pending |
| TICKET-011 | 4.3 Summary View — pie chart + bar chart with date range picker              | Pending |
| TICKET-012 | 4.4 GitHub-style Heatmap — calendar grid, category filter, intensity shading | Pending |
| TICKET-013 | 4.5 Category Manager — CRUD categories, regex rules, color picker            | Pending |
| TICKET-014 | 4.6 Live Status indicator — poll every 10s for current activity              | Pending |
| TICKET-015 | 4.7 TanStack Query for all data fetching                                     | Pending |

**Milestone:** Authenticated dashboard showing timeline, summary, heatmap, categories, and live status.

---

## Phase 5: Desktop Agent (Electron)

**Goal:** Lightweight system tray app that sends heartbeats to the hosted API.

| Ticket     | Task                                                    | Status  |
| ---------- | ------------------------------------------------------- | ------- |
| TICKET-016 | 5.1 Electron app — system tray only, no embedded server | Pending |
| TICKET-017 | 5.2 Heartbeat sender — POST to hosted API via API key   | Pending |
| TICKET-018 | 5.3 Auto-start on OS login                              | Pending |
| TICKET-019 | 5.4 Tray menu: pause tracking, open dashboard, settings | Pending |
| TICKET-020 | 5.5 Windows installer (macOS/Linux later)               | Pending |

**Milestone:** Install agent → auto-starts in tray → tracks activity → data appears in web dashboard.

---

## Phase 6: Browser Extension

**Goal:** Chrome extension that tracks active tab URL and title.

| Ticket     | Task                                                    | Status  |
| ---------- | ------------------------------------------------------- | ------- |
| TICKET-021 | 6.1 Chrome extension scaffold (Manifest V3, TypeScript) | Pending |
| TICKET-022 | 6.2 Active tab detection + heartbeat to API             | Pending |
| TICKET-023 | 6.3 Popup UI — today's top sites and time spent         | Pending |
| TICKET-024 | 6.4 URL domain categorization                           | Pending |
| TICKET-025 | 6.5 Edge cases — incognito, idle, multiple windows      | Pending |

**Milestone:** Browse normally → browser activity appears in dashboard alongside desktop activity.

---

## Phase 7: Editor Plugins + Polish

**Goal:** Track coding at the project/file level. Real-time updates. Data export.

| Ticket     | Task                                                            | Status  |
| ---------- | --------------------------------------------------------------- | ------- |
| TICKET-026 | 7.1 VS Code extension — heartbeats with file, language, project | Pending |
| TICKET-027 | 7.2 Projects dimension in data model + dashboard                | Pending |
| TICKET-028 | 7.3 WebSocket support for real-time dashboard                   | Pending |
| TICKET-029 | 7.4 Data export (JSON, CSV) and import                          | Pending |
| TICKET-030 | 7.5 Goals feature — daily targets + progress tracking           | Pending |
| TICKET-031 | 7.6 Reports page — weekly/monthly summaries                     | Pending |

**Milestone:** Desktop + browser + editor tracking, real-time dashboard, goals, and reports.

---

## Phase 8: Deployment + SaaS Infrastructure

**Goal:** Production deployment for real users.

| Ticket     | Task                                                       | Status  |
| ---------- | ---------------------------------------------------------- | ------- |
| TICKET-032 | 8.1 Docker Compose for production (API + Postgres + Redis) | Pending |
| TICKET-033 | 8.2 CI/CD with GitHub Actions                              | Pending |
| TICKET-034 | 8.3 Landing page (Next.js SSR)                             | Pending |
| TICKET-035 | 8.4 Monitoring, logging, error tracking                    | Pending |

**Milestone:** Live SaaS — users sign up, download agent, track activity, view dashboard.

---

## Architecture Overview

| Layer       | Technology              | Notes                                     |
| ----------- | ----------------------- | ----------------------------------------- |
| Language    | TypeScript 5.9 (strict) | ESM-only, `.js` import extensions         |
| Runtime     | Node.js                 | Long-running process + HTTP server        |
| Backend     | Fastify 5.x             | Plugin architecture, prefix-based routing |
| Database    | PostgreSQL 16 (Docker)  | Primary store from Phase 2 onward         |
| ORM         | Prisma 7.x              | Type-safe queries, migrations             |
| Auth        | Auth.js                 | OAuth + email, session management         |
| Legacy DB   | SQLite (better-sqlite3) | Phase 1 local storage                     |
| Build       | tsup                    | ESM bundling                              |
| Dev         | tsx                     | Watch mode for development                |
| Package Mgr | pnpm 10.30.1            | Workspace-aware                           |
| Validation  | Zod (planned)           | Runtime + compile-time safety             |
| Frontend    | Next.js (planned)       | App Router + TanStack Query               |
| Desktop     | Electron (planned)      | System tray agent, heartbeats to API      |

## Active Feature Plans

<!-- Sections added per ticket during planning phase -->

## Architecture Decision Records

### ADR-001: SQLite → PostgreSQL Migration (Phase 2)

- **Context:** Phase 1 used SQLite for simplicity. Phase 2 needs relational queries, time-range aggregations, and multi-device support.
- **Decision:** Move to PostgreSQL via Docker with Prisma ORM. SQLite layer kept for backward compatibility during transition.
- **Status:** Accepted, migration complete.

### ADR-002: Next.js over React + Vite (Phase 4)

- **Context:** Original plan used React + Vite for the frontend. As a SaaS product, we need SSR for the landing page, built-in API routes for Auth.js callbacks, and a unified deployment target.
- **Decision:** Use Next.js with App Router. Auth.js integrates natively. TanStack Query for client-side data fetching.
- **Status:** Accepted.

### ADR-003: Auth Before Dashboard (Phase 3)

- **Context:** Building the dashboard first would require retrofitting auth into every component and query later.
- **Decision:** Add auth + multi-tenancy in Phase 3, before the dashboard. All API queries scoped to authenticated user from the start.
- **Status:** Accepted.

### ADR-004: Desktop Agent as Thin Client (Phase 5)

- **Context:** Original plan bundled tracker + API + dashboard into a single Electron app. For SaaS, the desktop app should be a lightweight agent.
- **Decision:** Electron app is system tray only — polls active window, sends heartbeats to hosted API via API key. No embedded server or dashboard.
- **Status:** Accepted.

---

## Ticket Roadmap

| Ticket     | Phase | Task                       | Depends On |
| ---------- | ----- | -------------------------- | ---------- |
| TICKET-001 | 2     | API endpoints              | —          |
| TICKET-002 | 2     | Zod validation             | TICKET-001 |
| TICKET-003 | 2     | Categorization engine      | TICKET-001 |
| TICKET-004 | 2     | Migrate tracker to API     | TICKET-001 |
| TICKET-005 | 3     | User model + relations     | TICKET-002 |
| TICKET-006 | 3     | API key auth for agents    | TICKET-005 |
| TICKET-007 | 3     | Tenant isolation           | TICKET-005 |
| TICKET-008 | 3     | Rate limiting + CORS       | TICKET-005 |
| TICKET-009 | 4     | Next.js + Auth.js scaffold | TICKET-006 |
| TICKET-010 | 4     | Timeline View              | TICKET-009 |
| TICKET-011 | 4     | Summary View               | TICKET-009 |
| TICKET-012 | 4     | Heatmap                    | TICKET-009 |
| TICKET-013 | 4     | Category Manager           | TICKET-009 |
| TICKET-014 | 4     | Live Status                | TICKET-009 |
| TICKET-015 | 4     | TanStack Query integration | TICKET-009 |
| TICKET-016 | 5     | Electron tray app          | TICKET-006 |
| TICKET-017 | 5     | Heartbeat sender           | TICKET-016 |
| TICKET-018 | 5     | Auto-start                 | TICKET-016 |
| TICKET-019 | 5     | Tray menu                  | TICKET-016 |
| TICKET-020 | 5     | Windows installer          | TICKET-019 |
| TICKET-021 | 6     | Extension scaffold         | TICKET-006 |
| TICKET-022 | 6     | Tab tracking + heartbeat   | TICKET-021 |
| TICKET-023 | 6     | Popup UI                   | TICKET-021 |
| TICKET-024 | 6     | Domain categorization      | TICKET-003 |
| TICKET-025 | 6     | Edge cases                 | TICKET-022 |
| TICKET-026 | 7     | VS Code extension          | TICKET-006 |
| TICKET-027 | 7     | Projects dimension         | TICKET-026 |
| TICKET-028 | 7     | WebSocket support          | TICKET-009 |
| TICKET-029 | 7     | Data export/import         | TICKET-009 |
| TICKET-030 | 7     | Goals feature              | TICKET-009 |
| TICKET-031 | 7     | Reports page               | TICKET-011 |
| TICKET-032 | 8     | Production Docker Compose  | TICKET-008 |
| TICKET-033 | 8     | CI/CD                      | TICKET-032 |
| TICKET-034 | 8     | Landing page               | TICKET-009 |
| TICKET-035 | 8     | Monitoring + logging       | TICKET-032 |
