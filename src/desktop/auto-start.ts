export interface LoginItemApi {
  isPackaged: boolean;
  getLoginItemSettings: () => { openAtLogin: boolean };
  setLoginItemSettings: (settings: {
    openAtLogin: boolean;
    openAsHidden?: boolean;
  }) => void;
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
}

export function configureAutoStart({
  loginItemApi,
  platform,
  enabled,
  allowInDev,
}: ConfigureAutoStartOptions): void {
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
