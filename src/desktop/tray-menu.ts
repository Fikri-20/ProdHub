import type { MenuItemConstructorOptions } from "electron";
import {
  DESKTOP_APP_NAME,
  TRAY_OPEN_DASHBOARD_LABEL,
  TRAY_OPEN_SETTINGS_LABEL,
  TRAY_QUIT_LABEL,
  TRAY_STATUS_ACTIVE_LABEL,
  TRAY_STATUS_PAUSED_LABEL,
  TRAY_TOGGLE_PAUSE_LABEL,
  TRAY_TOGGLE_RESUME_LABEL,
} from "./tray-constants.js";

interface TrayMenuOptions {
  isTrackingPaused: boolean;
  onToggleTracking: () => void;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}

export function buildTrayMenuTemplate({
  isTrackingPaused,
  onToggleTracking,
  onOpenDashboard,
  onOpenSettings,
  onQuit,
}: TrayMenuOptions): MenuItemConstructorOptions[] {
  const statusLabel = isTrackingPaused
    ? TRAY_STATUS_PAUSED_LABEL
    : TRAY_STATUS_ACTIVE_LABEL;
  const toggleLabel = isTrackingPaused
    ? TRAY_TOGGLE_RESUME_LABEL
    : TRAY_TOGGLE_PAUSE_LABEL;

  return [
    { label: DESKTOP_APP_NAME, enabled: false },
    { type: "separator" },
    { label: statusLabel, enabled: false },
    { label: toggleLabel, click: () => onToggleTracking() },
    { label: TRAY_OPEN_DASHBOARD_LABEL, click: () => onOpenDashboard() },
    { label: TRAY_OPEN_SETTINGS_LABEL, click: () => onOpenSettings() },
    { type: "separator" },
    { label: TRAY_QUIT_LABEL, click: () => onQuit() },
  ];
}
