# Feature Specification: Contributing Docs & Architecture Guide

**Feature Branch**: `001-contributing-docs`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "Contributing docs and architecture guide"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Contributor Onboarding (Priority: P1)

A developer discovers ProdHub on GitHub and wants to contribute. They read CONTRIBUTING.md and can set up a working dev environment, understand the branch and commit conventions, and successfully open a pull request — all without asking for help.

**Why this priority**: Without clear onboarding docs, the project cannot grow a contributor base. This is the highest-value piece of open-source readiness.

**Independent Test**: Read only CONTRIBUTING.md on a fresh clone. Follow the setup steps. Result: dev environment running, branch created with correct naming, commit made with correct format.

**Acceptance Scenarios**:

1. **Given** a fresh clone with no prior setup, **When** a contributor follows the dev setup section of CONTRIBUTING.md, **Then** the API server and dashboard start without errors.
2. **Given** a contributor has made a code change, **When** they follow the PR workflow section, **Then** they know the correct branch naming convention, commit message format, and how to open a PR.
3. **Given** a contributor wants to run tests, **When** they follow the testing section, **Then** all test commands are documented and produce clear pass/fail output.

---

### User Story 2 — Architecture Understanding (Priority: P2)

A new contributor wants to understand how the 5 components (API server, dashboard, desktop agent, browser extension, VS Code extension) interact before making changes. They read the architecture section and can answer: "if I change the heartbeat schema, what else do I need to update?"

**Why this priority**: Without architecture context, contributors make isolated changes without understanding cascading effects, leading to bugs and wasted review cycles.

**Independent Test**: Read only the architecture section. A contributor can correctly describe the end-to-end data flow from heartbeat to dashboard without consulting any source code.

**Acceptance Scenarios**:

1. **Given** a contributor unfamiliar with the codebase, **When** they read the architecture overview, **Then** they can name all 5 components, their roles, and how they communicate.
2. **Given** a contributor wants to trace a heartbeat event, **When** they follow the data flow description, **Then** they can map: tracking client → API endpoint → database → dashboard query.
3. **Given** a contributor is modifying the API schema, **When** they consult the architecture section, **Then** they know which other components consume that schema and need updating.

---

### User Story 3 — Code Conventions Reference (Priority: P3)

A contributor is writing a new feature and wants to follow ProdHub's coding conventions. They consult the conventions section and write code consistent with the rest of the codebase.

**Why this priority**: Consistent code is easier to review and maintain. Conventions prevent common mistakes specific to this codebase's strict TypeScript configuration.

**Independent Test**: Read only the conventions section. A contributor can write a new source file that matches existing code patterns without guessing.

**Acceptance Scenarios**:

1. **Given** a contributor is writing a new TypeScript file, **When** they follow the conventions section, **Then** they use the correct import extension style, avoid banned patterns, and handle strict type checks correctly.
2. **Given** a contributor is adding a database query, **When** they consult the conventions section, **Then** they know how to scope queries to the correct user and handle the strict null-safety rules.

---

### Edge Cases

- What if a contributor's machine has a conflicting Node.js or pnpm version?
- What if the architecture description becomes stale as the codebase evolves?
- What if a contributor is on Windows and a documented command uses Unix-only syntax?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CONTRIBUTING.md MUST include a prerequisites section listing the required software and minimum versions (Node.js 20+, pnpm 10+).
- **FR-002**: CONTRIBUTING.md MUST include a dev environment setup section that documents the one-command setup (`pnpm setup`) and start commands (`pnpm start:all`).
- **FR-003**: CONTRIBUTING.md MUST document the branch naming convention, commit message format, and step-by-step PR submission process.
- **FR-004**: CONTRIBUTING.md MUST include a testing section showing how to run backend tests, web dashboard tests, and where test files live.
- **FR-005**: CONTRIBUTING.md MUST include an architecture overview section describing the role and responsibilities of all 5 components: API server, Next.js dashboard, Electron desktop agent, Chrome browser extension, and VS Code extension.
- **FR-006**: The architecture section MUST describe the end-to-end data flow: tracking client sends a heartbeat → API ingests and stores in the database → dashboard queries and displays the data.
- **FR-007**: CONTRIBUTING.md MUST include a code conventions section documenting: module format, import style, TypeScript strictness settings in effect, and database query patterns.
- **FR-008**: All shell commands documented in CONTRIBUTING.md MUST work on Windows, macOS, and Linux using cross-platform tooling.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor with no prior ProdHub knowledge can complete the dev setup and have a running environment by following only CONTRIBUTING.md, with no external help required.
- **SC-002**: The architecture section answers "what does each component do and how does data flow?" in under 5 minutes of reading.
- **SC-003**: 100% of the commands documented in CONTRIBUTING.md execute successfully on a fresh clone on all supported platforms.
- **SC-004**: A contributor can identify the correct branch naming and commit message format from CONTRIBUTING.md without ambiguity.

## Assumptions

- CONTRIBUTING.md lives at the repository root (standard GitHub location).
- Architecture content is a section within CONTRIBUTING.md, not a separate file.
- Data flow diagrams are text-based (ASCII art or prose) — no external diagram tools required.
- The document targets developers already comfortable with TypeScript and Node.js, but new to this specific codebase.
- Version requirements are sourced from the existing project configuration (CLAUDE.md and package.json).
