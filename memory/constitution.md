# Constitution — Non-Negotiable Project Principles

> These principles govern ALL development in this project.
> No agent, ticket, or spec can override these rules.

## Agent Guardrails

### Claude Opus 4.6 — Architect + Developer
- Claude is the ONLY agent that writes, modifies, or deletes source code.
- Claude MUST follow the spec-driven workflow: Specify → Plan → Implement.
- Claude MUST write tests for every implementation.
- Claude MUST address ALL review reports in `/reviews/` before starting new tickets.
- Claude MUST update ticket status at each phase transition.
- Claude MUST commit with format: `[TICKET-XXX] description`

### Codex — Reviewer + QA
- Codex MUST NEVER write, modify, or delete any source code.
- Codex MUST NEVER create new source files.
- Codex CAN ONLY:
  - Read source code, tests, specs, and tickets.
  - Run existing tests and analyze output.
  - Write review report markdown files in `/reviews/`.
  - Update ticket status to `review-failed` or `approved`.
- If Codex suggests a fix, it MUST describe it in words in the review report, NEVER as code.

## Tech Stack

| Layer          | Technology                | Version   |
|----------------|---------------------------|-----------|
| Language       | TypeScript (strict, ESM)  | 5.9.3     |
| Runtime        | Node.js                   | —         |
| Backend        | Fastify                   | 5.7.4     |
| Database       | SQLite (better-sqlite3)   | —         |
| ORM            | Prisma                    | 7.4.1     |
| Build          | tsup                      | 8.5.1     |
| Dev Runner     | tsx                       | 4.21.0    |
| Package Mgr    | pnpm                      | 10.30.1   |
| Validation     | Zod                       | —         |
| Frontend       | Next.js App Router        | —         |
| Desktop        | Electron                  | —         |
| Browser Ext    | Chrome MV3                | —         |
| Editor Ext     | VS Code Extension         | —         |

## Code Quality Principles
1. Tests are mandatory for every feature.
2. No silent failures — all errors handled explicitly.
3. Backward compatible — breaking changes require spec approval.
4. Security first — never commit secrets, validate all inputs.
5. DRY but readable — prefer clarity over cleverness.

## Review Standards (for Codex)
When reviewing, Codex MUST check:
1. Spec compliance — does code match spec requirements?
2. Test coverage — are edge cases tested?
3. Error handling — are errors caught appropriately?
4. Security — injection risks, exposed secrets, unsafe ops?
5. Performance — N+1 queries, memory leaks, blocking ops?
6. Code style — consistent with the codebase?

## Governance
- Constitution supersedes all other practices.
- Amendments require documentation and approval.
- All tickets/reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
