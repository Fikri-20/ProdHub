import { describe, it, expect, beforeEach, vi } from "vitest";
import { installChromeMock } from "./chrome-mock.js";

const mock = installChromeMock();

// Dynamic import to ensure chrome mock is in place
let sessionManager: typeof import("../../../browser-extension/src/session-manager.js");
let storage: typeof import("../../../browser-extension/src/storage.js");

beforeEach(async () => {
  mock._resetAll();

  // Reset module cache to get fresh state
  vi.resetModules();

  // Re-install mock after module reset
  (globalThis as Record<string, unknown>).chrome = mock;

  sessionManager = await import("../../../browser-extension/src/session-manager.js");
  storage = await import("../../../browser-extension/src/storage.js");

  sessionManager.invalidateConfigCache();
});

describe("handleTabChange", () => {
  it("creates a new session for valid tab", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    expect(session).not.toBeNull();
    expect(session!.domain).toBe("example.com");
    expect(session!.title).toBe("Example");
    expect(session!.tabId).toBe(1);
  });

  it("flushes previous session and starts new one", async () => {
    await sessionManager.handleTabChange(1, "https://a.com", "Site A");

    // Simulate time passing
    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 10_000;
      await storage.saveSession(session);
    }

    await sessionManager.handleTabChange(2, "https://b.com", "Site B");

    const newSession = await storage.loadSession();
    expect(newSession!.domain).toBe("b.com");

    // Check daily stats recorded time for a.com
    const stats = await storage.loadDailyStats();
    expect(stats.domains["a.com"]).toBeGreaterThan(0);
  });

  it("clears session for invalid URL", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");
    await sessionManager.handleTabChange(2, "not-a-url", "Invalid");

    const session = await storage.loadSession();
    expect(session).toBeNull();
  });

  it("does nothing when tracking is disabled", async () => {
    await storage.saveConfig({
      apiBaseUrl: "http://localhost:3000",
      apiKey: "",
      deviceName: "Test",
      trackingEnabled: false,
    });
    sessionManager.invalidateConfigCache();

    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    expect(session).toBeNull();
  });
});

describe("handleWindowBlur", () => {
  it("flushes session on window blur", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 5000;
      await storage.saveSession(session);
    }

    await sessionManager.handleWindowBlur();

    const afterBlur = await storage.loadSession();
    expect(afterBlur).toBeNull();

    const stats = await storage.loadDailyStats();
    expect(stats.domains["example.com"]).toBeGreaterThan(0);
  });

  it("does nothing when no active session", async () => {
    await sessionManager.handleWindowBlur();
    const session = await storage.loadSession();
    expect(session).toBeNull();
  });
});

describe("handleAlarmFlush", () => {
  it("flushes and restarts session on alarm", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 60_000;
      await storage.saveSession(session);
    }

    await sessionManager.handleAlarmFlush();

    // Session should still exist but with updated startTime
    const afterFlush = await storage.loadSession();
    expect(afterFlush).not.toBeNull();
    expect(afterFlush!.domain).toBe("example.com");
    expect(afterFlush!.startTime).toBeGreaterThan(session!.startTime);

    const stats = await storage.loadDailyStats();
    expect(stats.domains["example.com"]).toBeGreaterThan(0);
  });

  it("does nothing when no active session", async () => {
    await sessionManager.handleAlarmFlush();
    const session = await storage.loadSession();
    expect(session).toBeNull();
  });
});
