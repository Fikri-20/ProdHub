# Quickstart: Cross-Platform Desktop Packaging

**Feature**: 001-desktop-cross-platform
**Date**: 2026-03-24

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `electron-builder.json` | MODIFY | Add `mac` and `linux` build targets |
| `scripts/prepare-desktop-installer.mjs` | MODIFY | Upgrade icon from 256×256 to 512×512 |
| `package.json` | MODIFY | Add `dist:desktop:mac` and `dist:desktop:linux` scripts |
| `src/desktop/auto-start.ts` | MODIFY | Add Linux XDG autostart write/remove logic |
| `src/tests/desktop/auto-start.test.ts` | MODIFY | Add Linux XDG autostart tests |

## Implementation Order

1. **Upgrade icon size** in `prepare-desktop-installer.mjs` — change `generateIconPng` call from 256 to 512
2. **Add mac + linux targets** to `electron-builder.json`
3. **Add build scripts** to `package.json`
4. **Add Linux XDG autostart** to `src/desktop/auto-start.ts`
5. **Add tests** for Linux autostart in `src/tests/desktop/auto-start.test.ts`

## Key Implementation Details

### auto-start.ts Linux logic

```typescript
// Linux: XDG autostart desktop file
if (platform === "linux") {
  const configDir = path.join(homedirFn(), ".config", "autostart");
  const desktopFilePath = path.join(configDir, "prodhub-agent.desktop");

  if (enabled) {
    linuxFs.mkdirSync(configDir, { recursive: true });
    linuxFs.writeFileSync(desktopFilePath, [
      "[Desktop Entry]",
      "Type=Application",
      "Name=ProdHub Agent",
      `Exec=${process.execPath} --hidden`,
      "Hidden=false",
      "NoDisplay=false",
      "X-GNOME-Autostart-enabled=true",
    ].join("\n"));
  } else {
    if (linuxFs.existsSync(desktopFilePath)) {
      linuxFs.unlinkSync(desktopFilePath);
    }
  }
  return;
}
```

### Verifying the Build (when on correct platform)

```bash
# macOS (run on macOS machine)
pnpm dist:desktop:mac
# → release/desktop-installer/ProdHub-Agent-*.dmg

# Linux (run on Linux machine or via WSL)
pnpm dist:desktop:linux
# → release/desktop-installer/ProdHub-Agent-*.AppImage
# → release/desktop-installer/ProdHub-Agent-*.deb

# Verify auto-start tests pass (on any platform)
pnpm test
# → all 231+ tests pass
```
