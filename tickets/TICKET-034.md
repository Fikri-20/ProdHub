# TICKET-034: Landing Page (Next.js SSR)

## Status
implemented

## What
Replace the current redirect-only web/src/app/page.tsx with a public marketing landing page. Authenticated users still redirect to /dashboard.

## Files Modified
- `web/src/app/page.tsx` — Rewritten: SSR landing page with hero, features, CTA

## Landing Page Sections
1. Hero — Headline, subtitle, "Get Started" CTA button → /auth/signin
2. Features grid (4 cards):
   - Cross-platform tracking (Desktop + Browser + Editor)
   - GitHub-style heatmap visualization
   - Privacy-first, self-hostable
   - Real-time dashboard with goals & reports
3. How It Works — 3-step flow: Sign up → Install agent → View dashboard
4. Footer — Minimal: GitHub link, copyright

## Design Approach
- Server component (SSR) for SEO
- Check session: if authenticated, redirect to /dashboard; otherwise render landing
- Dark mode support using existing Tailwind dark classes
- Responsive (mobile-first)

## Verification
- Visit http://localhost:3001/ unauthenticated → see landing page (not redirect)
- Visit http://localhost:3001/ authenticated → redirect to /dashboard
- Mobile responsive check via browser dev tools