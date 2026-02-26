import { describe, expect, it, vi } from "vitest";
import {
  buildHeartbeatHeaders,
  createHeartbeatSender,
  type HeartbeatPayload,
} from "../../desktop/heartbeat-sender.js";

const payload: HeartbeatPayload = {
  deviceName: "test-device",
  os: "Windows",
  appName: "VS Code",
  windowTitle: "main.ts",
  startTime: "2026-02-26T01:00:00.000Z",
  endTime: "2026-02-26T01:00:05.000Z",
  duration: 5,
};

describe("buildHeartbeatHeaders", () => {
  it("includes authorization header when api key is present", () => {
    const headers = buildHeartbeatHeaders("abc123");

    expect(headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer abc123",
    });
  });

  it("omits authorization header when api key is empty", () => {
    const headers = buildHeartbeatHeaders("   ");

    expect(headers).toEqual({
      "Content-Type": "application/json",
    });
  });
});

describe("createHeartbeatSender", () => {
  it("posts heartbeat payload with bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("{}", { status: 201 }),
    );
    const sendHeartbeat = createHeartbeatSender({
      apiBaseUrl: "http://localhost:3000/",
      apiKey: "key-1",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const ok = await sendHeartbeat(payload);

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/events/heartbeat",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer key-1",
        },
      }),
    );
  });

  it("returns false when server responds with non-2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("bad request", { status: 400 }),
    );
    const sendHeartbeat = createHeartbeatSender({
      apiBaseUrl: "http://localhost:3000",
      apiKey: "",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const ok = await sendHeartbeat(payload);

    expect(ok).toBe(false);
  });

  it("returns false when request throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const sendHeartbeat = createHeartbeatSender({
      apiBaseUrl: "http://localhost:3000",
      apiKey: "",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const ok = await sendHeartbeat(payload);

    expect(ok).toBe(false);
  });
});
