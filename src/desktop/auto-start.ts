import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface LoginItemApi {
  isPackaged: boolean;
  getLoginItemSettings: () => { openAtLogin: boolean };
  setLoginItemSettings: (settings: {
    openAtLogin: boolean;
    openAsHidden?: boolean;
  }) => void;
}

export interface LinuxAutoStartFs {
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  writeFileSync: (path: string, content: string) => void;
  unlinkSync: (path: string) => void;
  existsSync: (path: string) => boolean;
}

export function parseAutoStartEnabled(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  if (["0", "false", "off", "no"].includes(normalized)) {
    return false;
  }

  if (["1", "true", "on", "yes"].includes(normalized)) {
    return true;
  }

  return true;
}

export function parseAllowDevAutoStart(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ["1", "true", "on", "yes"].includes(normalized);
}

interface ConfigureAutoStartOptions {
  loginItemApi: LoginItemApi;
  platform: NodeJS.Platform;
  enabled: boolean;
  allowInDev: boolean;
  linuxFs?: LinuxAutoStartFs;
  homedirFn?: () => string;
}

const XDG_DESKTOP_FILENAME = "prodhub-agent.desktop";

function buildDesktopFileContent(execPath: string): string {
  return [
    "[Desktop Entry]",
    "Type=Application",
    "Name=ProdHub Agent",
    `Exec=${execPath} --hidden`,
    "Hidden=false",
    "NoDisplay=false",
    "X-GNOME-Autostart-enabled=true",
  ].join("\n");
}

function configureLinuxAutoStart(
  enabled: boolean,
  execPath: string,
  linuxFs: LinuxAutoStartFs,
  homedirFn: () => string,
): void {
  const autoStartDir = path.join(homedirFn(), ".config", "autostart");
  const desktopFilePath = path.join(autoStartDir, XDG_DESKTOP_FILENAME);

  if (enabled) {
    linuxFs.mkdirSync(autoStartDir, { recursive: true });
    linuxFs.writeFileSync(desktopFilePath, buildDesktopFileContent(execPath));
  } else {
    if (linuxFs.existsSync(desktopFilePath)) {
      linuxFs.unlinkSync(desktopFilePath);
    }
  }
}

export function configureAutoStart({
  loginItemApi,
  platform,
  enabled,
  allowInDev,
  linuxFs = fs,
  homedirFn = os.homedir,
}: ConfigureAutoStartOptions): void {
  if (platform === "linux") {
    configureLinuxAutoStart(enabled, process.execPath, linuxFs, homedirFn);
    return;
  }

  if (platform !== "win32" && platform !== "darwin") {
    return;
  }

  if (!loginItemApi.isPackaged && !allowInDev) {
    return;
  }

  const current = loginItemApi.getLoginItemSettings().openAtLogin;
  if (current === enabled) {
    return;
  }

  loginItemApi.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true,
  });
}
