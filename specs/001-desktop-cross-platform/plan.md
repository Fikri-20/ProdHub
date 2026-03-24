# Implementation Plan: Cross-Platform Desktop Packaging

**Branch**: `001-desktop-cross-platform` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-desktop-cross-platform/spec.md`

## Summary

Add macOS (.dmg) and Linux (.AppImage + .deb) build targets to the Electron desktop agent. The Windows NSIS installer already works. Changes span the electron-builder config, build scripts, icon generation, and auto-start logic (Linux needs XDG autostart since Electron's `setLoginItemSettings` is unreliable on Linux).

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js ESM (backend); vanilla JS (MJS script)
**Primary Dependencies**: electron-builder 26.x (already installed), electron 40.6.1
**Storage**: N/A (packaging config only; no new data storage)
**Testing**: Vitest (existing test runner at repo root)
**Target Platform**: macOS (x64 + arm64), Linux (x64); Windows already done
**Project Type**: Desktop app packaging + auto-start configuration
**Performance Goals**: Build completes in < 5 minutes
**Constraints**: No new npm dependencies; macOS builds require macOS host; icon generated procedurally
**Scale/Scope**: 5 files changed, ~60 lines of new production code, ~30 lines of new tests

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven | ✅ Pass | spec.md → plan.md → tasks.md → implement |
| Tests Mandatory | ✅ Pass | Linux XDG autostart requires new tests in `auto-start.test.ts` |
| Security First | ✅ Pass | No secrets; CSC disabled for unsigned dev builds |
| Simplicity | ✅ Pass | No new dependencies; procedural icon reuse |
| Agent Separation | ✅ Pass | Claude authors code; Codex reviews |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-desktop-cross-platform/
├── plan.md              ← this file
├── research.md          ← Phase 0 complete
├── quickstart.md        ← Phase 1 complete
└── tasks.md             ← Phase 2 (speckit.tasks)
```

### Source Code Changes

```text
electron-builder.json                      ← add mac + linux targets
scripts/prepare-desktop-installer.mjs      ← icon size 256→512
package.json                               ← add dist:desktop:mac, dist:desktop:linux
src/desktop/auto-start.ts                  ← add Linux XDG autostart logic
src/tests/desktop/auto-start.test.ts       ← add Linux XDG autostart tests
```

## Architecture

### electron-builder.json additions

```json
"mac": {
  "target": [{ "target": "dmg", "arch": ["x64", "arm64"] }],
  "icon": "icon.png",
  "artifactName": "ProdHub-Agent-${version}-${arch}.${ext}",
  "category": "public.app-category.productivity"
},
"dmg": {
  "title": "ProdHub Agent",
  "window": { "width": 540, "height": 380 }
},
"linux": {
  "target": [
    { "target": "AppImage", "arch": ["x64"] },
    { "target": "deb", "arch": ["x64"] }
  ],
  "icon": "icon.png",
  "artifactName": "ProdHub-Agent-${version}-${arch}.${ext}",
  "category": "Utility",
  "maintainer": "ProdHub Contributors"
}
```

### package.json additions

```json
"dist:desktop:mac":   "pnpm prepare:desktop:installer && CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --projectDir dist/desktop-installer --config ../../electron-builder.json --mac dmg",
"dist:desktop:linux": "pnpm prepare:desktop:installer && CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --projectDir dist/desktop-installer --config ../../electron-builder.json --linux AppImage deb"
```

### auto-start.ts Linux additions

Linux uses XDG autostart: write/remove `~/.config/autostart/prodhub-agent.desktop`.

**Write** (enable):
```ini
[Desktop Entry]
Type=Application
Name=ProdHub Agent
Exec=/path/to/executable --hidden
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

**Remove** (disable): `fs.unlinkSync(desktopFilePath)` (with existence check).

The function signature stays the same (`configureAutoStart(options)`). Linux is added as a new branch alongside `win32`/`darwin`. The `LoginItemApi` interface is only used for win32/darwin; Linux has its own implementation using injected `fs` and `homedir` dependencies for testability.

### Interface for Linux auto-start (injectable for tests)

```typescript
interface LinuxAutoStartFs {
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  writeFileSync: (path: string, content: string) => void;
  unlinkSync: (path: string) => void;
  existsSync: (path: string) => boolean;
}
```

`configureAutoStart` gets an optional `linuxFs` parameter (defaults to `fs` from `node:fs`) and an optional `homedirFn` (defaults to `os.homedir()`). This keeps Linux auto-start fully unit-testable without touching the real filesystem.

## Complexity Tracking

No constitution violations — no complexity tracking needed.
