import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock electron's app module before importing config
const mockUserDataDir = path.join(
  process.cwd(),
  "test-tmp",
  "config-test-userdata",
);

vi.mock("electron", () => ({
  app: {
    getPath: (name: string) => {
      if (name === "userData") return mockUserDataDir;
      return "";
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let configModule: typeof import("../../desktop/config.js");

beforeEach(async () => {
  // Clean up test directory
  rmSync(mockUserDataDir, { recursive: true, force: true });
  mkdirSync(mockUserDataDir, { recursive: true });

  // Clear env vars
  delete process.env.TRACKER_API_URL;
  delete process.env.TRACKER_API_KEY;
  delete process.env.TRACKER_DASHBOARD_URL;
  delete process.env.TRACKER_POLL_INTERVAL_MS;
  delete process.env.TRACKER_AUTO_START;

  // Re-import to get fresh module state
  configModule = await import("../../desktop/config.js");
});

afterEach(() => {
  rmSync(mockUserDataDir, { recursive: true, force: true });
});

describe("getConfigPath", () => {
  it("returns path within userData directory", () => {
    const configPath = configModule.getConfigPath();
    expect(configPath).toBe(path.join(mockUserDataDir, "config.json"));
  });
});

describe("loadConfig", () => {
  it("returns defaults when no config file and no env vars exist", () => {
    const config = configModule.loadConfig();

    expect(config).toEqual({
      apiUrl: "http://localhost:3000",
      apiKey: "",
      dashboardUrl: "http://localhost:3001/dashboard",
      pollIntervalMs: 5_000,
      autoStartEnabled: true,
    });
  });

  it("reads values from existing config file", () => {
    const customConfig = {
      apiUrl: "http://custom:4000",
      apiKey: "pk_test123",
      dashboardUrl: "http://custom:4001/dashboard",
      pollIntervalMs: 10_000,
      autoStartEnabled: false,
    };
    writeFileSync(
      configModule.getConfigPath(),
      JSON.stringify(customConfig, null, 2),
    );

    const config = configModule.loadConfig();

    expect(config.apiUrl).toBe("http://custom:4000");
    expect(config.apiKey).toBe("pk_test123");
    expect(config.dashboardUrl).toBe("http://custom:4001/dashboard");
    expect(config.pollIntervalMs).toBe(10_000);
    expect(config.autoStartEnabled).toBe(false);
  });

  it("env vars override config file values", () => {
    const fileConfig = {
      apiUrl: "http://file:4000",
      apiKey: "pk_file",
      dashboardUrl: "http://file:4001/dashboard",
      pollIntervalMs: 10_000,
      autoStartEnabled: false,
    };
    writeFileSync(
      configModule.getConfigPath(),
      JSON.stringify(fileConfig, null, 2),
    );

    process.env.TRACKER_API_URL = "http://env:5000";
    process.env.TRACKER_API_KEY = "pk_env";
    process.env.TRACKER_POLL_INTERVAL_MS = "3000";
    process.env.TRACKER_AUTO_START = "true";

    const config = configModule.loadConfig();

    expect(config.apiUrl).toBe("http://env:5000");
    expect(config.apiKey).toBe("pk_env");
    // dashboardUrl not overridden by env, should come from file
    expect(config.dashboardUrl).toBe("http://file:4001/dashboard");
    expect(config.pollIntervalMs).toBe(3_000);
    expect(config.autoStartEnabled).toBe(true);
  });

  it("creates config.json on first launch", () => {
    // Ensure no config file exists
    const configPath = configModule.getConfigPath();
    expect(existsSync(configPath)).toBe(false);

    configModule.loadConfig();

    expect(existsSync(configPath)).toBe(true);
    const written = JSON.parse(readFileSync(configPath, "utf8"));
    expect(written.apiUrl).toBe("http://localhost:3000");
  });
});

describe("saveConfig", () => {
  it("writes valid JSON to config path", () => {
    const config = {
      apiUrl: "http://saved:6000",
      apiKey: "pk_saved",
      dashboardUrl: "http://saved:6001/dashboard",
      pollIntervalMs: 7_000,
      autoStartEnabled: false,
    };

    configModule.saveConfig(config);

    const configPath = configModule.getConfigPath();
    expect(existsSync(configPath)).toBe(true);

    const written = JSON.parse(readFileSync(configPath, "utf8"));
    expect(written).toEqual(config);
  });
});
