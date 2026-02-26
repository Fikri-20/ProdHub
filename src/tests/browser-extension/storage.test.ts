import { describe, it, expect, beforeEach } from "vitest";
import { installChromeMock } from "./chrome-mock.js";
import { loadConfig, saveConfig, loadSession, saveSession, loadDailyStats, saveDailyStats } from "../../../browser-extension/src/storage.js";
import { DEFAULT_CONFIG } from "../../../browser-extension/src/types.js";
import type { ExtensionConfig, TabSession, DailyStats } from "../../../browser-extension/src/types.js";

const mock = installChromeMock();

beforeEach(() => {
  mock._resetAll();
});

describe("loadConfig / saveConfig", () => {
  it("returns default config when nothing is stored", async () => {
    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("saves and loads config", async () => {
    const config: ExtensionConfig = {
      apiBaseUrl: "https://example.com",
      apiKey: "test-key-123",
      deviceName: "My Browser",
      trackingEnabled: false,
    };

    await saveConfig(config);
    const loaded = await loadConfig();
    expect(loaded).toEqual(config);
  });

  it("merges saved config with defaults for missing fields", async () => {
    await chrome.storage.sync.set({
      config: { apiKey: "partial-key" },
    });

    const loaded = await loadConfig();
    expect(loaded.apiKey).toBe("partial-key");
    expect(loaded.apiBaseUrl).toBe(DEFAULT_CONFIG.apiBaseUrl);
    expect(loaded.deviceName).toBe(DEFAULT_CONFIG.deviceName);
    expect(loaded.trackingEnabled).toBe(DEFAULT_CONFIG.trackingEnabled);
  });
});

describe("loadSession / saveSession", () => {
  it("returns null when no session stored", async () => {
    const session = await loadSession();
    expect(session).toBeNull();
  });

  it("saves and loads a session", async () => {
    const session: TabSession = {
      tabId: 1,
      url: "https://example.com",
      title: "Example",
      domain: "example.com",
      startTime: Date.now(),
    };

    await saveSession(session);
    const loaded = await loadSession();
    expect(loaded).toEqual(session);
  });

  it("clears session when saving null", async () => {
    const session: TabSession = {
      tabId: 1,
      url: "https://example.com",
      title: "Example",
      domain: "example.com",
      startTime: Date.now(),
    };

    await saveSession(session);
    await saveSession(null);
    const loaded = await loadSession();
    expect(loaded).toBeNull();
  });
});

describe("loadDailyStats / saveDailyStats", () => {
  it("returns empty stats for today when nothing stored", async () => {
    const stats = await loadDailyStats();
    expect(stats.date).toBe(new Date().toISOString().slice(0, 10));
    expect(stats.domains).toEqual({});
  });

  it("saves and loads daily stats", async () => {
    const stats: DailyStats = {
      date: new Date().toISOString().slice(0, 10),
      domains: { "example.com": 300 },
    };

    await saveDailyStats(stats);
    const loaded = await loadDailyStats();
    expect(loaded).toEqual(stats);
  });

  it("resets stats if stored date is different", async () => {
    const stats: DailyStats = {
      date: "2020-01-01",
      domains: { "old.com": 100 },
    };

    await saveDailyStats(stats);
    const loaded = await loadDailyStats();
    expect(loaded.date).toBe(new Date().toISOString().slice(0, 10));
    expect(loaded.domains).toEqual({});
  });
});
