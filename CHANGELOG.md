# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-28

### Added

- **Activity Tracker CLI** — Polls active window every 5s, logs to SQLite
- **REST API** — Fastify server with Zod validation, heartbeat ingestion, events query, summary, and categories CRUD
- **SQLite + Prisma** — Local-first database, no Docker required
- **Dashboard** — Next.js App Router with Timeline View, Summary View (pie/bar charts), GitHub-style Heatmap
- **Category Manager** — CRUD for user-defined categories with regex rules and color picker
- **Live Status Indicator** — Real-time current activity polling
- **Electron Desktop Agent** — System tray app with auto-start, heartbeat sender, tray menu (pause, open dashboard, settings)
- **Windows Installer** — NSIS installer for Windows desktop agent
- **Browser Extension** — Chrome MV3 extension tracking active tabs, domain categorization, popup UI with daily stats
- **VS Code Extension** — Editor plugin tracking file, language, and project with heartbeat sender and status bar
- **Projects Dimension** — Data model and dashboard support for project-level tracking
- **WebSocket Support** — Real-time dashboard updates via WS broadcast
- **Data Export/Import** — JSON and CSV export, import functionality
- **Goals Feature** — Daily targets with progress tracking
- **Reports Page** — Weekly/monthly summary generation
- **Structured Logging** — pino JSON logs with error IDs and request IDs
- **CI/CD** — GitHub Actions with SQLite (no Postgres/Redis)
- **Cross-Platform Packaging** — macOS DMG and Linux AppImage/deb builds
- **Landing Page** — Open-source project page with hero, features, architecture flow
- **One-Command Setup** — `pnpm setup` installs deps, generates Prisma client, runs migrations
- **Contributing Docs** — CONTRIBUTING.md with architecture guide and code conventions

[1.0.0]: https://github.com/anomaly/prodhub/releases/tag/v1.0.0
