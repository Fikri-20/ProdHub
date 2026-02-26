import { describe, expect, it, vi } from "vitest";
import {
  DESKTOP_APP_NAME,
  TRAY_OPEN_DASHBOARD_LABEL,
  TRAY_OPEN_SETTINGS_LABEL,
  TRAY_QUIT_LABEL,
  TRAY_STATUS_ACTIVE_LABEL,
  TRAY_STATUS_PAUSED_LABEL,
  TRAY_TOGGLE_PAUSE_LABEL,
  TRAY_TOGGLE_RESUME_LABEL,
} from "../../desktop/tray-constants.js";
import { buildTrayMenuTemplate } from "../../desktop/tray-menu.js";

describe("buildTrayMenuTemplate", () => {
  it("builds the expected active-state menu entries", () => {
    const template = buildTrayMenuTemplate({
      isTrackingPaused: false,
      onToggleTracking: vi.fn(),
      onOpenDashboard: vi.fn(),
      onOpenSettings: vi.fn(),
      onQuit: vi.fn(),
    });

    expect(template).toHaveLength(8);
    expect(template[0]).toMatchObject({
      label: DESKTOP_APP_NAME,
      enabled: false,
    });
    expect(template[1]).toMatchObject({ type: "separator" });
    expect(template[2]).toMatchObject({
      label: TRAY_STATUS_ACTIVE_LABEL,
      enabled: false,
    });
    expect(template[3]).toMatchObject({ label: TRAY_TOGGLE_PAUSE_LABEL });
    expect(template[4]).toMatchObject({ label: TRAY_OPEN_DASHBOARD_LABEL });
    expect(template[5]).toMatchObject({ label: TRAY_OPEN_SETTINGS_LABEL });
    expect(template[6]).toMatchObject({ type: "separator" });
    expect(template[7]).toMatchObject({ label: TRAY_QUIT_LABEL });
  });

  it("builds paused-state status and toggle labels", () => {
    const template = buildTrayMenuTemplate({
      isTrackingPaused: true,
      onToggleTracking: vi.fn(),
      onOpenDashboard: vi.fn(),
      onOpenSettings: vi.fn(),
      onQuit: vi.fn(),
    });

    expect(template[2]).toMatchObject({
      label: TRAY_STATUS_PAUSED_LABEL,
      enabled: false,
    });
    expect(template[3]).toMatchObject({ label: TRAY_TOGGLE_RESUME_LABEL });
  });

  it("wires callbacks to menu items", () => {
    const onToggleTracking = vi.fn();
    const onOpenDashboard = vi.fn();
    const onOpenSettings = vi.fn();
    const onQuit = vi.fn();
    const template = buildTrayMenuTemplate({
      isTrackingPaused: false,
      onToggleTracking,
      onOpenDashboard,
      onOpenSettings,
      onQuit,
    });

    const toggleItem = template.find(
      (item) => item.label === TRAY_TOGGLE_PAUSE_LABEL,
    );
    const dashboardItem = template.find(
      (item) => item.label === TRAY_OPEN_DASHBOARD_LABEL,
    );
    const settingsItem = template.find(
      (item) => item.label === TRAY_OPEN_SETTINGS_LABEL,
    );
    const quitItem = template.find((item) => item.label === TRAY_QUIT_LABEL);

    toggleItem?.click?.(
      undefined as never,
      undefined as never,
      undefined as never,
    );
    dashboardItem?.click?.(
      undefined as never,
      undefined as never,
      undefined as never,
    );
    settingsItem?.click?.(
      undefined as never,
      undefined as never,
      undefined as never,
    );
    quitItem?.click?.(undefined as never, undefined as never, undefined as never);

    expect(onToggleTracking).toHaveBeenCalledTimes(1);
    expect(onOpenDashboard).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onQuit).toHaveBeenCalledTimes(1);
  });
});
