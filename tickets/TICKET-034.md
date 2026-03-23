# TICKET-034: Project Landing Page

## Status: `implemented`
## Priority: P2

## Summary
Rework the landing page as an open-source project page: what ProdHub does, screenshots, install instructions, link to GitHub. Not a SaaS signup funnel.

> **Note:** This ticket replaces the original TICKET-034 (SaaS marketing page). Reframed for open-source.

## Spec Reference
- Part of Phase 8: Open-Source Distribution & Polish

## Requirements
1. [x] Hero section: tagline, one-line description, "Get Started" links to install instructions
2. [x] Features section: cross-platform tracking, heatmap, privacy-first, local SQLite
3. [x] Screenshots/demo: dashboard preview, heatmap, timeline
4. [x] Install section: quick start commands for each platform
5. [x] Footer: GitHub link, license, version

## Acceptance Criteria
- [x] Landing page renders at `/` for first-time visitors
- [x] Page clearly communicates open-source + local-first + privacy-first
- [x] Install instructions are prominent and accurate
- [x] Responsive on mobile

## Dependencies
- Depends on: TICKET-009 (Next.js scaffold)
- Blocks: None

## Status History
| Date | From | To | By | Notes |
|------|------|----|----|-------|
| 2026-03-23 | — | draft | Claude | Ticket rewritten for open-source project page |
| 2026-03-23 | draft | implemented | Claude | Landing page complete: Navigation, HeroSection (MockDashboard + MockHeatmap), PlatformMarquee, ValueProps, ArchitectureFlow, BentoGrid, FooterCTA, Footer — all in web/src/components/landing/ |
