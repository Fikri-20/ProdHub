import { describe, expect, it, vi } from "vitest";
import {
  createHeartbeatAgent,
  type ActiveWindowInfo,
} from "../../desktop/heartbeat-agent.js";
import type { HeartbeatPayload } from "../../desktop/heartbeat-sender.js";

describe("createHeartbeatAgent", () => {
  it("flushes heartbeat when active window changes and on stop", async () => {
    let nowMs = Date.parse("2026-02-26T01:00:00.000Z");
    let active: ActiveWindowInfo | null = null;
    const sentPayloads: HeartbeatPayload[] = [];

    const agent = createHeartbeatAgent({
      deviceName: "machine-1",
      os: "Windows",
      pollIntervalMs: 5_000,
      getActiveWindow: async () => active,
      sendHeartbeat: async (payload) => {
        sentPayloads.push(payload);
        return true;
      },
      now: () => new Date(nowMs),
    });

    active = { appName: "VS Code", windowTitle: "server.ts" };
    await agent.pollOnce();
    expect(sentPayloads).toHaveLength(0);

    nowMs += 10_000;
    active = { appName: "Chrome", windowTitle: "Dashboard" };
    await agent.pollOnce();

    expect(sentPayloads).toHaveLength(1);
    expect(sentPayloads[0]).toMatchObject({
      appName: "VS Code",
      windowTitle: "server.ts",
      duration: 10,
    });

    nowMs += 5_000;
    await agent.stop();

    expect(sentPayloads).toHaveLength(2);
    expect(sentPayloads[1]).toMatchObject({
      appName: "Chrome",
      windowTitle: "Dashboard",
      duration: 5,
    });
  });

  it("ignores null or invalid active window payloads", async () => {
    let nowMs = Date.parse("2026-02-26T02:00:00.000Z");
    const sendHeartbeat = vi.fn(async () => true);

    const snapshots: Array<ActiveWindowInfo | null> = [
      null,
      { appName: "   ", windowTitle: "title" },
      { appName: "Terminal", windowTitle: "   " },
    ];
    let index = 0;

    const agent = createHeartbeatAgent({
      deviceName: "machine-2",
      os: "Linux",
      pollIntervalMs: 5_000,
      getActiveWindow: async () => snapshots[index++] ?? null,
      sendHeartbeat,
      now: () => new Date(nowMs),
    });

    await agent.pollOnce();
    nowMs += 5_000;
    await agent.pollOnce();
    nowMs += 5_000;
    await agent.pollOnce();
    await agent.stop();

    expect(sendHeartbeat).not.toHaveBeenCalled();
  });

  it("uses minimum duration of one second for short sessions", async () => {
    let nowMs = Date.parse("2026-02-26T03:00:00.000Z");
    let active: ActiveWindowInfo | null = { appName: "App1", windowTitle: "A" };
    const sentPayloads: HeartbeatPayload[] = [];

    const agent = createHeartbeatAgent({
      deviceName: "machine-3",
      os: "macOS",
      pollIntervalMs: 5_000,
      getActiveWindow: async () => active,
      sendHeartbeat: async (payload) => {
        sentPayloads.push(payload);
        return true;
      },
      now: () => new Date(nowMs),
    });

    await agent.pollOnce();
    nowMs += 100;
    active = { appName: "App2", windowTitle: "B" };
    await agent.pollOnce();

    expect(sentPayloads).toHaveLength(1);
    expect(sentPayloads[0]?.duration).toBe(1);
  });
});
