import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Summary Routes", () => {
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
    await prisma.categoryAssignment.deleteMany();
    await prisma.activityEvent.deleteMany();
    await prisma.category.deleteMany();
    await prisma.device.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });
    userId = user.id;
  });

  describe("GET /api/summary", () => {
    it("should return 400 when groupBy is missing", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/summary",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid groupBy value", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/summary?groupBy=invalid",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid date format", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/summary?groupBy=app&from=bad-date",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    describe("groupBy=app", () => {
      beforeEach(async () => {
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
              appName: "VS Code",
              windowTitle: "file2.ts",
              startTime: new Date("2026-02-23T10:05:00Z"),
              endTime: new Date("2026-02-23T10:10:00Z"),
              duration: 300,
            },
            {
              deviceId: device.id,
              appName: "Chrome",
              windowTitle: "Google",
              startTime: new Date("2026-02-23T10:10:00Z"),
              endTime: new Date("2026-02-23T10:12:00Z"),
              duration: 120,
            },
          ],
        });
      });

      it("should aggregate durations by app", async () => {
        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=app&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
          headers: { "x-user-id": userId },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body).toHaveLength(2);

        // VS Code should be first (600s vs 120s)
        expect(body[0].name).toBe("VS Code");
        expect(body[0].totalDuration).toBe(600);
        expect(body[1].name).toBe("Chrome");
        expect(body[1].totalDuration).toBe(120);
      });

      it("should calculate percentages", async () => {
        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=app&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
          headers: { "x-user-id": userId },
        });

        const body = res.json();
        // VS Code: 600/720 = 83.33%, Chrome: 120/720 = 16.67%
        expect(body[0].percentage).toBeCloseTo(83.33, 1);
        expect(body[1].percentage).toBeCloseTo(16.67, 1);
      });

      it("should return empty array for no events in range", async () => {
        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=app&from=2025-01-01T00:00:00Z&to=2025-01-02T00:00:00Z",
          headers: { "x-user-id": userId },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toHaveLength(0);
      });

      it("should not include other user's events in summary", async () => {
        const user2 = await prisma.user.create({
          data: { email: "other@example.com" },
        });

        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=app&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
          headers: { "x-user-id": user2.id },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toHaveLength(0);
      });
    });

    describe("groupBy=category", () => {
      beforeEach(async () => {
        const device = await prisma.device.create({
          data: { name: "test-machine", os: "Windows", userId },
        });

        const event1 = await prisma.activityEvent.create({
          data: {
            deviceId: device.id,
            appName: "VS Code",
            windowTitle: "file1.ts",
            startTime: new Date("2026-02-23T10:00:00Z"),
            endTime: new Date("2026-02-23T10:05:00Z"),
            duration: 300,
          },
        });

        const event2 = await prisma.activityEvent.create({
          data: {
            deviceId: device.id,
            appName: "Chrome",
            windowTitle: "Google",
            startTime: new Date("2026-02-23T10:05:00Z"),
            endTime: new Date("2026-02-23T10:07:00Z"),
            duration: 120,
          },
        });

        const workCat = await prisma.category.create({
          data: { name: "Work", color: "#00FF00", userId },
        });

        const browseCat = await prisma.category.create({
          data: { name: "Browsing", color: "#FF0000", userId },
        });

        await prisma.categoryAssignment.createMany({
          data: [
            { eventId: event1.id, categoryId: workCat.id },
            { eventId: event2.id, categoryId: browseCat.id },
          ],
        });
      });

      it("should aggregate durations by category", async () => {
        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=category&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
          headers: { "x-user-id": userId },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body).toHaveLength(2);

        // Work=300s, Browsing=120s, sorted desc
        const work = body.find((b: { name: string }) => b.name === "Work");
        const browsing = body.find(
          (b: { name: string }) => b.name === "Browsing",
        );
        expect(work.totalDuration).toBe(300);
        expect(browsing.totalDuration).toBe(120);
      });

      it("should return empty array when no events match date range", async () => {
        const res = await app.inject({
          method: "GET",
          url: "/api/summary?groupBy=category&from=2025-01-01T00:00:00Z&to=2025-01-02T00:00:00Z",
          headers: { "x-user-id": userId },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toHaveLength(0);
      });
    });
  });
});
