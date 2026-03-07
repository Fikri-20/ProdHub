import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Categorization Integration", () => {
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

  const heartbeatPayload = {
    deviceName: "test-machine",
    os: "Windows",
    appName: "VS Code",
    windowTitle: "server.ts - ProdHub",
    startTime: "2026-02-23T10:00:00.000Z",
    endTime: "2026-02-23T10:05:00.000Z",
    duration: 300,
  };

  describe("Auto-categorization on heartbeat", () => {
    it("should assign matching categories on heartbeat", async () => {
      await prisma.category.create({
        data: { name: "Development", userId, rules: JSON.stringify(["VS Code", "Terminal"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: heartbeatPayload,
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.categories).toBeDefined();
      expect(body.categories).toHaveLength(1);
      expect(body.categories[0].category.name).toBe("Development");
    });

    it("should assign multiple matching categories", async () => {
      await prisma.category.createMany({
        data: [
          { name: "Development", userId, rules: JSON.stringify(["VS Code"]) },
          { name: "ProdHub Work", userId, rules: JSON.stringify(["ProdHub"]) },
        ],
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: heartbeatPayload,
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.categories).toHaveLength(2);

      const categoryNames = body.categories.map(
        (a: { category: { name: string } }) => a.category.name,
      );
      expect(categoryNames).toContain("Development");
      expect(categoryNames).toContain("ProdHub Work");
    });

    it("should return empty categories array when no rules match", async () => {
      await prisma.category.create({
        data: { name: "Gaming", userId, rules: JSON.stringify(["Steam", "Discord"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: heartbeatPayload,
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().categories).toHaveLength(0);
    });

    it("should skip categories with empty rules", async () => {
      await prisma.category.create({
        data: { name: "Uncategorized", userId, rules: JSON.stringify([]) },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: heartbeatPayload,
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().categories).toHaveLength(0);
    });

    it("should not match categories from other users", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      await prisma.category.create({
        data: { name: "Development", userId: user2.id, rules: JSON.stringify(["VS Code"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { "x-user-id": userId },
        payload: heartbeatPayload,
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().categories).toHaveLength(0);
    });
  });

  describe("POST /api/categories/:id/recategorize", () => {
    it("should assign matching events retroactively", async () => {
      const device = await prisma.device.create({
        data: { name: "test-machine", os: "Windows", userId },
      });

      await prisma.activityEvent.createMany({
        data: [
          {
            deviceId: device.id,
            appName: "VS Code",
            windowTitle: "file.ts",
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
            windowTitle: "test.ts",
            startTime: new Date("2026-02-23T10:10:00Z"),
            endTime: new Date("2026-02-23T10:15:00Z"),
            duration: 300,
          },
        ],
      });

      const category = await prisma.category.create({
        data: { name: "Development", userId, rules: JSON.stringify(["VS Code"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/categories/${category.id}/recategorize`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.categoryId).toBe(category.id);
      expect(body.categoryName).toBe("Development");
      expect(body.assignedEvents).toBe(2);
    });

    it("should clear old assignments and re-scan", async () => {
      const device = await prisma.device.create({
        data: { name: "test-machine", os: "Windows", userId },
      });

      const event = await prisma.activityEvent.create({
        data: {
          deviceId: device.id,
          appName: "VS Code",
          windowTitle: "file.ts",
          startTime: new Date("2026-02-23T10:00:00Z"),
          endTime: new Date("2026-02-23T10:05:00Z"),
          duration: 300,
        },
      });

      const category = await prisma.category.create({
        data: { name: "Development", userId, rules: JSON.stringify(["VS Code"]) },
      });

      // Manually create an assignment
      await prisma.categoryAssignment.create({
        data: { eventId: event.id, categoryId: category.id },
      });

      // Update rules so it no longer matches
      await prisma.category.update({
        where: { id: category.id },
        data: { rules: JSON.stringify(["Terminal"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/categories/${category.id}/recategorize`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().assignedEvents).toBe(0);

      const assignments = await prisma.categoryAssignment.findMany({
        where: { categoryId: category.id },
      });
      expect(assignments).toHaveLength(0);
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories/00000000-0000-0000-0000-000000000000/recategorize",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for invalid UUID", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories/not-a-uuid/recategorize",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should not recategorize another user's category", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      const category = await prisma.category.create({
        data: { name: "Development", userId: user2.id, rules: JSON.stringify(["VS Code"]) },
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/categories/${category.id}/recategorize`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("Regex validation on category creation", () => {
    it("should reject invalid regex in rules", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Bad Regex", rules: ["[invalid"] },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should accept valid regex in rules", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Good Regex", rules: ["^VS\\sCode$", "chrome|firefox", ".*\\.ts"] },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().rules).toHaveLength(3);
    });

    it("should reject invalid regex on category update", async () => {
      const cat = await prisma.category.create({
        data: { name: "Test", userId, rules: JSON.stringify(["valid"]) },
      });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
        payload: { rules: ["(unclosed"] },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
