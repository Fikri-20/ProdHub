# Tasks: Cross-Platform Desktop Packaging

**Input**: Design documents from `/specs/001-desktop-cross-platform/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Upgrade the shared icon asset from 256×256 to 512×512 — required by both macOS and Linux electron-builder targets.

- [x] T001 Upgrade icon size in `scripts/prepare-desktop-installer.mjs` — change the `generateIconPng` size argument from 256 to 512 so electron-builder gets a 512×512 PNG for macOS and Linux packaging

---

## Phase 2: User Story 1 — macOS Installer (Priority: P1) 🎯 MVP

**Goal**: Running `pnpm dist:desktop:mac` on a macOS host produces a `.dmg` installer with the ProdHub Agent. macOS auto-start already works via the existing `setLoginItemSettings` call in `auto-start.ts`.

**Independent Test**: Add `mac` target to electron-builder.json, add script to package.json, run `pnpm dist:desktop:mac` on macOS → `.dmg` file appears in `release/desktop-installer/`.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add `mac` target section to `electron-builder.json` — add `"mac": { "target": [{"target": "dmg", "arch": ["x64", "arm64"]}], "icon": "icon.png", "artifactName": "ProdHub-Agent-${version}-${arch}.${ext}", "category": "public.app-category.productivity" }` and `"dmg": { "title": "ProdHub Agent", "window": {"width": 540, "height": 380} }`
- [x] T003 [P] [US1] Add `dist:desktop:mac` script to `package.json` — `"dist:desktop:mac": "pnpm prepare:desktop:installer && CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --projectDir dist/desktop-installer --config ../../electron-builder.json --mac dmg"`

**Checkpoint**: US1 complete — `pnpm dist:desktop:mac` is a valid command; macOS DMG build is configured.

---

## Phase 3: User Story 2 — Linux Installer (Priority: P2)

**Goal**: Running `pnpm dist:desktop:linux` produces both an `.AppImage` and a `.deb`. The agent auto-starts on Linux login via an XDG autostart desktop entry file written to `~/.config/autostart/`.

**Independent Test**: Add `linux` target, add script, implement XDG autostart in `auto-start.ts`, run tests → all pass. On Linux: run `pnpm dist:desktop:linux` → AppImage and .deb appear in `release/desktop-installer/`.

### Implementation for User Story 2

- [x] T004 [P] [US2] Add `linux` target section to `electron-builder.json` — add `"linux": { "target": [{"target": "AppImage", "arch": ["x64"]}, {"target": "deb", "arch": ["x64"]}], "icon": "icon.png", "artifactName": "ProdHub-Agent-${version}-${arch}.${ext}", "category": "Utility", "maintainer": "ProdHub Contributors" }`
- [x] T005 [P] [US2] Add `dist:desktop:linux` script to `package.json` — `"dist:desktop:linux": "pnpm prepare:desktop:installer && CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --projectDir dist/desktop-installer --config ../../electron-builder.json --linux AppImage deb"`
- [x] T006 [US2] Add Linux XDG autostart to `src/desktop/auto-start.ts` — add injectable `LinuxAutoStartFs` interface (`mkdirSync`, `writeFileSync`, `unlinkSync`, `existsSync`) and optional `linuxFs`/`homedirFn` params to `configureAutoStart`; add Linux platform branch that writes `~/.config/autostart/prodhub-agent.desktop` when enabled, removes it when disabled
- [x] T007 [US2] Add Linux XDG autostart tests to `src/tests/desktop/auto-start.test.ts` — add a `configureAutoStart — Linux` describe block with tests: (1) writes desktop file when enabled, (2) removes file when disabled and file exists, (3) no-op when disabled and file does not exist, (4) no-ops in dev environment unless allowInDev is true

**Checkpoint**: US2 complete — Linux builds are configured and XDG autostart is tested.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T008 Update `tickets/TICKET-033.md` status to `implemented` and check all requirements as complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 first — no dependencies
- **US1 (Phase 2)**: Depends on T001 (icon must be 512px before mac build works); T002 and T003 can run in parallel (different files)
- **US2 (Phase 3)**: Depends on T001; T004 and T005 can run in parallel (different files); T006 before T007
- **Polish (Phase 4)**: Depends on all phases complete

### Parallel Opportunities

- T002 + T003 can run in parallel (electron-builder.json vs package.json)
- T004 + T005 can run in parallel (electron-builder.json vs package.json)

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001: Upgrade icon
2. T002–T003: macOS config
3. **STOP and VALIDATE**: Verify `pnpm dist:desktop:mac` command exists and electron-builder.json has mac target

### Incremental Delivery

1. T001 → T002–T003: macOS DMG buildable (US1)
2. T004–T007: Linux AppImage+deb buildable, XDG autostart implemented and tested (US2)
3. T008: Ticket update

---

## Notes

- T001 is prerequisite for both stories (512px icon needed by electron-builder for macOS)
- T002 and T004 both modify `electron-builder.json` — do NOT run in parallel across stories
- T003 and T005 both modify `package.json` — do NOT run in parallel across stories
- macOS build can only be verified on a macOS host machine
- Linux build can be verified on Linux or via WSL on Windows
