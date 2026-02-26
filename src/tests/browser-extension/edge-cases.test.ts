import { describe, it, expect, beforeEach, vi } from "vitest";
import { installChromeMock } from "./chrome-mock.js";

const mock = installChromeMock();

let sessionManager: typeof import("../../../browser-extension/src/session-manager.js");
let storage: typeof import("../../../browser-extension/src/storage.js");

beforeEach(async () => {
  mock._resetAll();
  vi.resetModules();
  (globalThis as Record<string, unknown>).chrome = mock;

  sessionManager = await import("../../../browser-extension/src/session-manager.js");
  storage = await import("../../../browser-extension/src/storage.js");
  sessionManager.invalidateConfigCache();
});

describe("incognito handling", () => {
  it("handleTabChange works normally for non-incognito", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");
    const session = await storage.loadSession();
    expect(session).not.toBeNull();
    expect(session!.domain).toBe("example.com");
  });

  it("handleWindowBlur clears session (simulating incognito switch)", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    // Simulate: background.ts detects incognito window and calls handleWindowBlur
    await sessionManager.handleWindowBlur();

    const session = await storage.loadSession();
    expect(session).toBeNull();
  });
});

describe("idle detection", () => {
  it("handleWindowBlur flushes session on idle (simulating idle event)", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 30_000;
      await storage.saveSession(session);
    }

    // idle → handleWindowBlur is called by background.ts
    await sessionManager.handleWindowBlur();

    const afterIdle = await storage.loadSession();
    expect(afterIdle).toBeNull();

    const stats = await storage.loadDailyStats();
    expect(stats.domains["example.com"]).toBeGreaterThan(0);
  });

  it("handleTabChange resumes tracking after idle return", async () => {
    // idle return → background.ts detects active tab and calls handleTabChange
    await sessionManager.handleTabChange(1, "https://example.com", "Back to work");
    const session = await storage.loadSession();
    expect(session).not.toBeNull();
    expect(session!.title).toBe("Back to work");
  });
});

describe("multiple windows", () => {
  it("switching between windows flushes previous session", async () => {
    // Window 1: working on github
    await sessionManager.handleTabChange(1, "https://github.com", "GitHub");

    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 15_000;
      await storage.saveSession(session);
    }

    // Switch to Window 2: docs
    await sessionManager.handleTabChange(2, "https://docs.google.com/doc/123", "My Document");

    const newSession = await storage.loadSession();
    expect(newSession!.domain).toBe("docs.google.com");
    expect(newSession!.tabId).toBe(2);

    // github.com should have been recorded
    const stats = await storage.loadDailyStats();
    expect(stats.domains["github.com"]).toBeGreaterThan(0);
  });

  it("losing all window focus flushes session", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");

    const session = await storage.loadSession();
    if (session) {
      session.startTime = Date.now() - 5_000;
      await storage.saveSession(session);
    }

    // All windows lose focus (WINDOW_ID_NONE)
    await sessionManager.handleWindowBlur();

    const afterBlur = await storage.loadSession();
    expect(afterBlur).toBeNull();

    const stats = await storage.loadDailyStats();
    expect(stats.domains["example.com"]).toBeGreaterThan(0);
  });
});

describe("skipped URLs", () => {
  it("clears session for chrome:// URLs", async () => {
    await sessionManager.handleTabChange(1, "https://example.com", "Example");
    await sessionManager.handleTabChange(2, "chrome://settings", "Settings");

    const session = await storage.loadSession();
    expect(session).toBeNull();
  });

  it("clears session for about: URLs", async () => {
    await sessionManager.handleTabChange(1, "about:blank", "");
    const session = await storage.loadSession();
    expect(session).toBeNull();
  });

  it("clears session for extension URLs", async () => {
    await sessionManager.handleTabChange(1, "chrome-extension://abc/popup.html", "Extension");
    const session = await storage.loadSession();
    expect(session).toBeNull();
  });
});

describe("heartbeat windowTitle includes domain", () => {
  it("domain is prepended to title in heartbeat", async () => {
    // Set up config with API key to trigger heartbeat
    const fetchCalls: Array<{ url: string; body: string }> = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url: url.toString(), body: init?.body as string });
      return new Response(JSON.stringify({ id: "test" }), { status: 200 });
    }) as typeof fetch;

    try {
      await storage.saveConfig({
        apiBaseUrl: "http://localhost:3000",
        apiKey: "test-key",
        deviceName: "Test Browser",
        trackingEnabled: true,
      });
      sessionManager.invalidateConfigCache();

      await sessionManager.handleTabChange(1, "https://github.com/user/repo", "user/repo - GitHub");

      // Manipulate session startTime to ensure flush produces meaningful duration
      const session = await storage.loadSession();
      if (session) {
        session.startTime = Date.now() - 10_000;
        await storage.saveSession(session);
      }

      // Trigger flush by switching tabs
      await sessionManager.handleTabChange(2, "https://example.com", "Example");

      // Find the heartbeat call
      const heartbeatCall = fetchCalls.find(c => c.url.includes("/heartbeat"));
      expect(heartbeatCall).toBeDefined();

      const payload = JSON.parse(heartbeatCall!.body);
      expect(payload.windowTitle).toContain("github.com");
      expect(payload.windowTitle).toContain("user/repo - GitHub");
      expect(payload.appName).toBe("Chrome");
      expect(payload.os).toBe("Browser");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
