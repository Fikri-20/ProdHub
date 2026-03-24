# Feature Specification: Cross-Platform Desktop Packaging

**Feature Branch**: `001-desktop-cross-platform`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "TICKET-033"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — macOS Installer (Priority: P1)

A macOS developer downloads a .dmg file, drags the ProdHub Agent to Applications, launches it, and sees the tray icon in the menu bar. The agent auto-starts on subsequent logins without any additional configuration.

**Why this priority**: macOS is the primary platform for developers and the most likely first non-Windows audience for this open-source tool.

**Independent Test**: Run the macOS build command on a macOS host → a .dmg file is produced → install it → tray icon appears in the menu bar → agent starts tracking → reboot → agent appears automatically.

**Acceptance Scenarios**:

1. **Given** a developer runs the macOS build command, **When** the build completes, **Then** a .dmg installer file is produced in the release output directory
2. **Given** the .dmg is installed and the agent launched, **When** the user logs into macOS, **Then** the agent starts automatically in the menu bar tray
3. **Given** the agent is running on macOS, **When** the user right-clicks the tray icon, **Then** they see the standard tray menu (open dashboard, pause tracking, quit)

---

### User Story 2 — Linux Installer (Priority: P2)

A Linux developer downloads an AppImage or .deb package, installs the desktop agent, and has it start automatically with their desktop session via the XDG autostart standard.

**Why this priority**: Linux is a common developer OS but auto-start is desktop-environment-dependent, making it more complex than macOS.

**Independent Test**: Run the Linux build command → an AppImage and .deb are produced → install on Linux → tray icon appears → on next login the agent starts automatically.

**Acceptance Scenarios**:

1. **Given** a developer runs the Linux build command, **When** the build completes, **Then** an AppImage and a .deb file are both produced in the release output directory
2. **Given** the agent is installed on Linux, **When** the user logs into a desktop session (GNOME, KDE, or XFCE), **Then** the agent starts automatically via the XDG autostart mechanism
3. **Given** the agent is running on Linux, **When** the user interacts with the system tray, **Then** the tray icon and context menu function correctly
4. **Given** the user disables auto-start via the tray menu on Linux, **When** they reboot, **Then** the agent does not auto-start

---

### Edge Cases

- What happens when the macOS build is attempted on Windows? The build command fails with a clear error message explaining that macOS builds require a macOS host.
- What if a Linux user's desktop environment doesn't support system tray icons? The agent still runs as a background process; tracking continues even if the tray icon is not visible.
- What if the XDG autostart directory doesn't exist on a Linux system? The agent creates the directory before writing the autostart file, or skips gracefully without crashing.
- What if the user disables auto-start? The autostart file is removed on all platforms when the user opts out via the tray menu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build tooling MUST produce a macOS .dmg installer when the macOS build command is run on a macOS host
- **FR-002**: The build tooling MUST produce a Linux AppImage when the Linux build command is run
- **FR-003**: The build tooling MUST produce a Linux .deb package when the Linux build command is run
- **FR-004**: The desktop agent MUST register itself for auto-start on login on macOS using the native login items mechanism
- **FR-005**: The desktop agent MUST register itself for auto-start on login on Linux by writing an XDG autostart desktop entry file to `~/.config/autostart/`
- **FR-006**: The tray icon MUST render correctly in the macOS menu bar (retina-aware, adapts to light/dark menu bar)
- **FR-007**: The tray icon MUST render correctly in common Linux desktop environments (GNOME, KDE, XFCE)
- **FR-008**: Disabling auto-start via the tray menu MUST remove the autostart registration on all platforms (login item on macOS/Windows, XDG desktop file on Linux)
- **FR-009**: Dedicated build commands (`dist:desktop:mac`, `dist:desktop:linux`) MUST be available to build for each platform independently

### Assumptions

- macOS builds are performed on a macOS host machine (this is an electron-builder requirement, not a project limitation)
- Linux builds can be cross-compiled from Windows or Linux hosts
- The existing Windows build pipeline and configuration remain unchanged
- Icon assets are generated programmatically from the existing icon generation code; no separately designed icon files are required
- XDG autostart targets GNOME, KDE, and XFCE; Wayland-only compositors without XDG support are out of scope

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The macOS build command produces a valid, installable .dmg file (verified by file existence and non-zero size)
- **SC-002**: The Linux build command produces both a valid AppImage and a valid .deb file
- **SC-003**: The installed agent appears in the system tray within 5 seconds of logging in on macOS and Linux
- **SC-004**: Auto-start survives a full reboot on macOS and Linux — the agent appears in the tray without any manual action from the user
- **SC-005**: Disabling auto-start via the tray menu prevents the agent from starting on the next login on all 3 platforms
- **SC-006**: All existing auto-start tests continue to pass; new tests cover Linux XDG autostart behaviour
