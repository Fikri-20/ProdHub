import { describe, expect, it, vi } from "vitest";
import {
  configureAutoStart,
  parseAllowDevAutoStart,
  parseAutoStartEnabled,
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

describe("configureAutoStart", () => {
  it("no-ops on unsupported platforms", () => {
    const loginItemApi = createLoginApi(false, true);

    configureAutoStart({
      loginItemApi,
      platform: "linux",
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
