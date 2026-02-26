import type { MenuItemConstructorOptions } from "electron";
import {
  DESKTOP_APP_NAME,
  TRAY_QUIT_LABEL,
  TRAY_STATUS_LABEL,
} from "./tray-constants.js";

interface TrayMenuOptions {
  onQuit: () => void;
}

export function buildTrayMenuTemplate({
  onQuit,
}: TrayMenuOptions): MenuItemConstructorOptions[] {
  return [
    { label: DESKTOP_APP_NAME, enabled: false },
    { type: "separator" },
    { label: TRAY_STATUS_LABEL, enabled: false },
    { type: "separator" },
    { label: TRAY_QUIT_LABEL, click: () => onQuit() },
  ];
}
