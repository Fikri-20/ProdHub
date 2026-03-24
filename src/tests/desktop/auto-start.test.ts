import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  configureAutoStart,
  parseAllowDevAutoStart,
  parseAutoStartEnabled,
  type LinuxAutoStartFs,
  type LoginItemApi,
} from "../../desktop/auto-start.js";

function createLoginApi(
  openAtLogin: boolean,
  isPackaged: boolean,
): LoginItemApi & { setLoginItemSettings: ReturnType<typeof vi.fn> } {
  return {
    isPackaged,
    getLoginItemSettings: () => ({ openAtLogin }),
    setLoginItemSettings: vi.fn(),
  };
}

describe("parseAutoStartEnabled", () => {
  it("defaults to enabled when value is missing", () => {
    expect(parseAutoStartEnabled(undefined)).toBe(true);
  });

  it("parses false-like values as disabled", () => {
    expect(parseAutoStartEnabled("false")).toBe(false);
    expect(parseAutoStartEnabled("0")).toBe(false);
    expect(parseAutoStartEnabled("off")).toBe(false);
    expect(parseAutoStartEnabled("no")).toBe(false);
  });

  it("parses true-like values as enabled", () => {
    expect(parseAutoStartEnabled("true")).toBe(true);
    expect(parseAutoStartEnabled("1")).toBe(true);
    expect(parseAutoStartEnabled("on")).toBe(true);
    expect(parseAutoStartEnabled("yes")).toBe(true);
  });

  it("falls back to enabled for unknown values", () => {
    expect(parseAutoStartEnabled("maybe")).toBe(true);
  });
});

describe("parseAllowDevAutoStart", () => {
  it("defaults to disabled when value is missing", () => {
    expect(parseAllowDevAutoStart(undefined)).toBe(false);
  });

  it("enables only for explicit true-like values", () => {
    expect(parseAllowDevAutoStart("true")).toBe(true);
    expect(parseAllowDevAutoStart("1")).toBe(true);
    expect(parseAllowDevAutoStart("yes")).toBe(true);
    expect(parseAllowDevAutoStart("false")).toBe(false);
  });
});

function createLinuxFs(): LinuxAutoStartFs & {
  mkdirSync: ReturnType<typeof vi.fn>;
  writeFileSync: ReturnType<typeof vi.fn>;
  unlinkSync: ReturnType<typeof vi.fn>;
  existsSync: ReturnType<typeof vi.fn>;
} {
  return {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(false),
  };
}

describe("configureAutoStart — Linux (XDG autostart)", () => {
  it("writes desktop file to ~/.config/autostart/ when enabled", () => {
    const linuxFs = createLinuxFs();
    const homedirFn = () => "/home/user";

    configureAutoStart({
      loginItemApi: createLoginApi(false, true),
      platform: "linux",
      enabled: true,
      allowInDev: false,
      linuxFs,
      homedirFn,
    });

    const expectedDir = path.join("/home/user", ".config", "autostart");
    const expectedFile = path.join(expectedDir, "prodhub-agent.desktop");
    expect(linuxFs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(linuxFs.writeFileSync).toHaveBeenCalledTimes(1);
    const [filePath, content] = linuxFs.writeFileSync.mock.calls[0] as [string, string];
    expect(filePath).toBe(expectedFile);
    expect(content).toContain("[Desktop Entry]");
    expect(content).toContain("Type=Application");
    expect(content).toContain("Name=ProdHub Agent");
    expect(content).toContain("X-GNOME-Autostart-enabled=true");
  });

  it("removes desktop file when disabled and file exists", () => {
    const linuxFs = createLinuxFs();
    linuxFs.existsSync.mockReturnValue(true);
    const homedirFn = () => "/home/user";

    configureAutoStart({
      loginItemApi: createLoginApi(false, true),
      platform: "linux",
      enabled: false,
      allowInDev: false,
      linuxFs,
      homedirFn,
    });

    const expectedFile = path.join("/home/user", ".config", "autostart", "prodhub-agent.desktop");
    expect(linuxFs.unlinkSync).toHaveBeenCalledWith(expectedFile);
    expect(linuxFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("no-ops when disabled and desktop file does not exist", () => {
    const linuxFs = createLinuxFs();
    linuxFs.existsSync.mockReturnValue(false);
    const homedirFn = () => "/home/user";

    configureAutoStart({
      loginItemApi: createLoginApi(false, true),
      platform: "linux",
      enabled: false,
      allowInDev: false,
      linuxFs,
      homedirFn,
    });

    expect(linuxFs.unlinkSync).not.toHaveBeenCalled();
    expect(linuxFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("does not call loginItemApi on Linux (uses XDG instead)", () => {
    const loginItemApi = createLoginApi(false, true);
    const linuxFs = createLinuxFs();

    configureAutoStart({
      loginItemApi,
      platform: "linux",
      enabled: true,
      allowInDev: false,
      linuxFs,
      homedirFn: () => "/home/user",
    });

    expect(loginItemApi.setLoginItemSettings).not.toHaveBeenCalled();
  });
});

describe("configureAutoStart", () => {
  it("no-ops on truly unsupported platforms", () => {
    const loginItemApi = createLoginApi(false, true);

    configureAutoStart({
      loginItemApi,
      platform: "freebsd",
      enabled: true,
      allowInDev: false,
    });

    expect(loginItemApi.setLoginItemSettings).not.toHaveBeenCalled();
  });

  it("no-ops in development by default", () => {
    const loginItemApi = createLoginApi(false, false);

    configureAutoStart({
      loginItemApi,
      platform: "win32",
      enabled: true,
      allowInDev: false,
    });

    expect(loginItemApi.setLoginItemSettings).not.toHaveBeenCalled();
  });

  it("configures login item when packaged and state differs", () => {
    const loginItemApi = createLoginApi(false, true);

    configureAutoStart({
      loginItemApi,
      platform: "darwin",
      enabled: true,
      allowInDev: false,
    });

    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it("configures login item in development when override is enabled", () => {
    const loginItemApi = createLoginApi(false, false);

    configureAutoStart({
      loginItemApi,
      platform: "win32",
      enabled: true,
      allowInDev: true,
    });

    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: true,
      openAsHidden: true,
    });
  });

  it("is idempotent when state already matches target", () => {
    const loginItemApi = createLoginApi(true, true);

    configureAutoStart({
      loginItemApi,
      platform: "win32",
      enabled: true,
      allowInDev: false,
    });

    expect(loginItemApi.setLoginItemSettings).not.toHaveBeenCalled();
  });

  it("can disable auto-start when currently enabled", () => {
    const loginItemApi = createLoginApi(true, true);

    configureAutoStart({
      loginItemApi,
      platform: "darwin",
      enabled: false,
      allowInDev: false,
    });

    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledTimes(1);
    expect(loginItemApi.setLoginItemSettings).toHaveBeenCalledWith({
      openAtLogin: false,
      openAsHidden: true,
    });
  });
});
