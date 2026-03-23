import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Heatmap Routes", () => {
  let app: ReturnType<typeof buildApp>;
  let userId: string;
  let deviceId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.categoryAssignment.deleteMany();
    await prisma.activityEvent.deleteMany();
    await prisma.category.deleteMany();
    await prisma.device.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { email: "heatmap@example.com", name: "Heatmap User" },
    });
    userId = user.id;

    const device = await prisma.device.create({
      data: { name: "test-machine", os: "Windows", userId },
    });
    deviceId = device.id;
  });

  describe("GET /api/heatmap", () => {
    it("returns 200 with empty array when no events exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("returns 400 for invalid from date", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?from=not-a-date",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 for invalid to date", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?to=bad-date",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("aggregates daily durations correctly", async () => {
      await prisma.activityEvent.createMany({
        data: [
          {
            deviceId,
            appName: "VS Code",
            windowTitle: "main.ts",
            startTime: new Date("2026-03-01T09:00:00Z"),
            endTime: new Date("2026-03-01T09:30:00Z"),
            duration: 1800,
          },
          {
            deviceId,
            appName: "Chrome",
            windowTitle: "GitHub",
            startTime: new Date("2026-03-01T10:00:00Z"),
            endTime: new Date("2026-03-01T10:15:00Z"),
            duration: 900,
          },
          {
            deviceId,
            appName: "VS Code",
            windowTitle: "main.ts",
            startTime: new Date("2026-03-02T09:00:00Z"),
            endTime: new Date("2026-03-02T09:10:00Z"),
            duration: 600,
          },
        ],
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?from=2026-03-01T00:00:00Z&to=2026-03-02T23:59:59Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<Array<{ date: string; totalDuration: number }>>();

      expect(body).toHaveLength(2);

      const day1 = body.find((d) => d.date === "2026-03-01");
      const day2 = body.find((d) => d.date === "2026-03-02");

      expect(day1?.totalDuration).toBe(2700); // 1800 + 900
      expect(day2?.totalDuration).toBe(600);
    });

    it("returns results in ascending date order", async () => {
      await prisma.activityEvent.createMany({
        data: [
          {
            deviceId,
            appName: "VS Code",
            windowTitle: "a.ts",
            startTime: new Date("2026-03-03T10:00:00Z"),
            endTime: new Date("2026-03-03T10:05:00Z"),
            duration: 300,
          },
          {
            deviceId,
            appName: "VS Code",
            windowTitle: "b.ts",
            startTime: new Date("2026-03-01T10:00:00Z"),
            endTime: new Date("2026-03-01T10:05:00Z"),
            duration: 300,
          },
          {
            deviceId,
            appName: "VS Code",
            windowTitle: "c.ts",
            startTime: new Date("2026-03-02T10:00:00Z"),
            endTime: new Date("2026-03-02T10:05:00Z"),
            duration: 300,
          },
        ],
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?from=2026-03-01T00:00:00Z&to=2026-03-03T23:59:59Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<Array<{ date: string; totalDuration: number }>>();

      expect(body).toHaveLength(3);
      expect(body[0]!.date).toBe("2026-03-01");
      expect(body[1]!.date).toBe("2026-03-02");
      expect(body[2]!.date).toBe("2026-03-03");
    });

    it("does not include another user's events", async () => {
      const otherUser = await prisma.user.create({
        data: { email: "other@example.com" },
      });
      const otherDevice = await prisma.device.create({
        data: { name: "other-machine", os: "Linux", userId: otherUser.id },
      });

      await prisma.activityEvent.create({
        data: {
          deviceId: otherDevice.id,
          appName: "Slack",
          windowTitle: "General",
          startTime: new Date("2026-03-01T10:00:00Z"),
          endTime: new Date("2026-03-01T10:30:00Z"),
          duration: 1800,
        },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap?from=2026-03-01T00:00:00Z&to=2026-03-01T23:59:59Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("uses default 1-year range when no params provided", async () => {
      await prisma.activityEvent.create({
        data: {
          deviceId,
          appName: "VS Code",
          windowTitle: "recent.ts",
          startTime: new Date(),
          endTime: new Date(Date.now() + 300_000),
          duration: 300,
        },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/heatmap",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json<Array<{ date: string; totalDuration: number }>>();
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
