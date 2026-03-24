# Research: Cross-Platform Desktop Packaging

**Feature**: 001-desktop-cross-platform
**Date**: 2026-03-24

---

## R1: electron-builder macOS Target

**Decision**: Use `dmg` target for `x64` and `arm64` architectures. Point `mac.icon` at `icon.png` (512x512).

**Rationale**: electron-builder's `dmg` target is the standard macOS distribution format and the only one that produces a drag-to-Applications installer without code signing. electron-builder accepts a PNG for `mac.icon` and converts it internally — no `.icns` file needed if the PNG is ≥ 512×512.

**Alternatives considered**:
- `.pkg` installer — more complex, requires code signing for modern macOS Gatekeeper
- `.zip` — raw app bundle, no drag-to-install UX; worse for new users

---

## R2: electron-builder Linux Targets

**Decision**: Use both `AppImage` (x64) and `deb` (x64) targets.

**Rationale**: AppImage is distribution-agnostic (runs on any Linux with FUSE) and is the most portable single-file format. `.deb` covers Debian/Ubuntu users who prefer native package managers. Both can be built from the same staging directory in one command.

**Alternatives considered**:
- `.rpm` — covers Fedora/RHEL; excluded from MVP to keep scope minimal; can be added later
- Snap/Flatpak — require separate packaging manifests and store submissions; out of scope

---

## R3: Icon Size Upgrade

**Decision**: Update `prepare-desktop-installer.mjs` to generate a 512×512 PNG instead of 256×256.

**Rationale**: electron-builder requires ≥ 512×512 for macOS `.icns` conversion and emits a warning for smaller sizes. A 512×512 PNG works for all three platforms — electron-builder resizes it to the needed formats (tray: 16px, dock/taskbar: 256px, installer: 512px). The existing procedural PNG generator already accepts a `size` parameter.

**Alternatives considered**:
- Keeping 256×256 — works for Linux but triggers electron-builder warnings on macOS
- Shipping a pre-designed `.icns` — unnecessary complexity for a developer tool; the procedural icon is sufficient

---

## R4: Linux Auto-Start via XDG Autostart

**Decision**: Implement Linux auto-start by writing/removing an XDG autostart `.desktop` entry at `~/.config/autostart/prodhub-agent.desktop`.

**Rationale**: Electron's `app.setLoginItemSettings()` is unreliable on Linux (behavior varies by desktop environment and Electron version). The XDG autostart specification is supported by GNOME, KDE, and XFCE — the three most common developer desktop environments. The file is written using Node.js `fs` and can be removed cleanly.

**Desktop file format**:
```ini
[Desktop Entry]
Type=Application
Name=ProdHub Agent
Exec=/path/to/executable --hidden
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

The `Exec` path uses `process.execPath` at runtime, which gives the correct path for both AppImage and deb installs.

**Alternatives considered**:
- `app.setLoginItemSettings()` on Linux — unreliable; tested on Electron 40 and confirmed non-functional on GNOME
- `systemd --user` service — more robust but requires privileged setup and is overly complex for a tray app
- `cron @reboot` — no standard way to add via application code

---

## R5: Build Script Platform Handling

**Decision**: macOS and Linux build scripts use `cross-env CSC_IDENTITY_AUTO_DISCOVERY=false` (or shell-appropriate syntax) to disable code signing. macOS builds require running on a macOS host; Linux builds can run on Linux or Windows (electron-builder supports Linux cross-compilation from Windows via WSL or native).

**Windows scripts** use `set VAR=value&&` syntax (existing, unchanged).
**macOS/Linux scripts** use shell `VAR=value` prefix syntax or `cross-env` for portability.

**Decision**: Use `cross-env` if available, otherwise use shell-appropriate syntax. Since `cross-env` is already a common pattern, we check if it's in devDeps first. It is NOT currently in devDeps, so use shell syntax: `CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder ...` — this works on macOS and Linux bash/zsh natively.

**Rationale**: Keeps the macOS/Linux scripts free of Windows-specific `set` syntax. The Windows scripts are unchanged.

---

## R6: Files Changed

| File | Change |
|------|--------|
| `electron-builder.json` | Add `mac` (dmg, x64+arm64) and `linux` (AppImage+deb, x64) targets |
| `scripts/prepare-desktop-installer.mjs` | Upgrade generated icon from 256×256 to 512×512 |
| `package.json` | Add `dist:desktop:mac` and `dist:desktop:linux` scripts |
| `src/desktop/auto-start.ts` | Add Linux XDG autostart write/remove logic |
| `src/tests/desktop/auto-start.test.ts` | Add Linux XDG autostart tests |
