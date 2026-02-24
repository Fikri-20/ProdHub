import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Event Routes", () => {
  let app: FastifyInstance;
  let userId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean tables in correct order (foreign key constraints)
    await prisma.categoryAssignment.deleteMany();
    await prisma.activityEvent.deleteMany();
    await prisma.category.deleteMany();
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });
    userId = user.id;
  });

  describe("POST /api/events/heartbeat", () => {
    const validPayload = {
      deviceName: "test-machine",
      os: "Windows",
      appName: "VS Code",
      windowTitle: "server.ts - ProdHub",
      startTime: "2026-02-23T10:00:00.000Z",
      endTime: "2026-02-23T10:05:00.000Z",
      duration: 300,
    };

    it("should create an event and return 201", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: validPayload,
      });

      expect(res.statusCode).toBe(201);

      const body = res.json();
      expect(body.appName).toBe("VS Code");
      expect(body.windowTitle).toBe("server.ts - ProdHub");
      expect(body.duration).toBe(300);
      expect(body.device).toBeDefined();
      expect(body.device.name).toBe("test-machine");
      expect(body.device.os).toBe("Windows");
    });

    it("should upsert device (not create duplicates)", async () => {
      await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: validPayload,
      });

      await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: { ...validPayload, appName: "Chrome" },
      });

      const devices = await prisma.device.findMany();
      expect(devices).toHaveLength(1);

      const events = await prisma.activityEvent.findMany();
      expect(events).toHaveLength(2);
    });

    it("should return 400 for missing fields", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: { deviceName: "test" },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error).toBeDefined();
    });

    it("should return 400 for empty string fields", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: { ...validPayload, appName: "  " },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid duration", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: { ...validPayload, duration: -5 },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid date", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: { ...validPayload, startTime: "not-a-date" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should auto-assign matching categories from rules", async () => {
      const category = await prisma.category.create({
        data: { name: "Coding", userId, rules: ["VS\\sCode"] },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: validPayload,
      });

      expect(res.statusCode).toBe(201);

      const createdEventId = res.json().id as string;
      const assignments = await prisma.categoryAssignment.findMany({
        where: { eventId: createdEventId },
      });

      expect(assignments).toHaveLength(1);
      expect(assignments[0]!.categoryId).toBe(category.id);
    });

    it("should handle concurrent heartbeats for the same device without duplicates", async () => {
      const results = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          app.inject({
            method: "POST",
            url: "/api/events/heartbeat",
            headers: { "x-user-id": userId },
            payload: { ...validPayload, appName: `App-${i}` },
          }),
        ),
      );

      for (const res of results) {
        expect(res.statusCode).toBe(201);
      }

      const devices = await prisma.device.findMany();
      expect(devices).toHaveLength(1);

      const events = await prisma.activityEvent.findMany();
      expect(events).toHaveLength(5);
    });

    it("should return 401 without X-User-Id header", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        payload: validPayload,
      });

      expect(res.statusCode).toBe(401);
    });

    it("should isolate devices per user", async () => {
      const user2 = await prisma.user.create({
        data: { email: "user2@example.com" },
      });

      await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: validPayload,
      });

      await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": user2.id },
        payload: validPayload,
      });

      // Same device name, but different users = 2 device records
      const devices = await prisma.device.findMany();
      expect(devices).toHaveLength(2);
    });
  });

  describe("GET /api/events", () => {
    beforeEach(async () => {
      // Seed some events for the test user
      const device = await prisma.device.create({
        data: { name: "test-machine", os: "Windows", userId },
      });

      await prisma.activityEvent.createMany({
        data: [
          {
            deviceId: device.id,
            appName: "VS Code",
            windowTitle: "file1.ts",
            startTime: new Date("2026-02-23T10:00:00Z"),
            endTime: new Date("2026-02-23T10:05:00Z"),
            duration: 300,
          },
          {
            deviceId: device.id,
            appName: "Chrome",
            windowTitle: "Google",
            startTime: new Date("2026-02-23T10:05:00Z"),
            endTime: new Date("2026-02-23T10:10:00Z"),
            duration: 300,
          },
          {
            deviceId: device.id,
            appName: "VS Code",
            windowTitle: "file2.ts",
            startTime: new Date("2026-02-22T10:00:00Z"),
            endTime: new Date("2026-02-22T10:05:00Z"),
            duration: 300,
          },
        ],
      });
    });

    it("should return events with device info", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(3);
      expect(body[0].device).toBeDefined();
    });

    it("should filter by date range", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(2);
    });

    it("should filter by appName", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z&appName=Chrome",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(1);
      expect(res.json()[0].appName).toBe("Chrome");
    });

    it("should support pagination", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z&limit=2&offset=0",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(2);

      const res2 = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z&limit=2&offset=2",
        headers: { "x-user-id": userId },
      });

      expect(res2.json()).toHaveLength(1);
    });

    it("should order by startTime desc", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z",
        headers: { "x-user-id": userId },
      });

      const body = res.json();
      const times = body.map((e: { startTime: string }) =>
        new Date(e.startTime).getTime(),
      );
      for (let i = 1; i < times.length; i++) {
        expect(times[i - 1]).toBeGreaterThanOrEqual(times[i]);
      }
    });

    it("should return empty array for no matches", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2025-01-01T00:00:00Z&to=2025-01-02T00:00:00Z",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(0);
    });

    it("should return 400 for invalid date format", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=not-a-date",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should not return other user's events", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-22T00:00:00Z&to=2026-02-24T00:00:00Z",
        headers: { "x-user-id": user2.id },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(0);
    });
  });
});
