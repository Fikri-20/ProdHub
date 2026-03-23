import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Category Routes", () => {
  let app: ReturnType<typeof buildApp>;
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

  describe("GET /api/categories", () => {
    it("should return empty array when no categories exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/categories",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("should return all categories sorted by name", async () => {
      await prisma.category.createMany({
        data: [
          { name: "Work", color: "#00FF00", userId },
          { name: "Browsing", color: "#FF0000", userId },
        ],
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/categories",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(2);
      expect(body[0].name).toBe("Browsing");
      expect(body[1].name).toBe("Work");
    });

    it("should not return other user's categories", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/categories",
        headers: { "x-user-id": user2.id },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(0);
    });
  });

  describe("POST /api/categories", () => {
    it("should create a category and return 201", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: {
          name: "Work",
          color: "#00FF00",
          rules: ["VS Code", "Terminal"],
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.name).toBe("Work");
      expect(body.color).toBe("#00FF00");
      expect(body.rules).toEqual(["VS Code", "Terminal"]);
    });

    it("should create with defaults when optional fields are omitted", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.color).toBe("#6B7280");
      expect(body.rules).toEqual([]);
    });

    it("should return 400 for missing name", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { color: "#FF0000" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 409 for duplicate name within same user", async () => {
      await prisma.category.create({ data: { name: "Work", userId } });

      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(409);
    });

    it("should allow same category name for different users", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      await prisma.category.create({ data: { name: "Work", userId } });

      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": user2.id },
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(201);
    });

    it("should return 400 for invalid color", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Test", color: "red" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid rules", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Test", rules: "not-array" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid regex rule", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "InvalidRuleCategory", rules: ["("] },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for whitespace-only name", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "   " },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should backfill assignments for existing matching events", async () => {
      const device = await prisma.device.create({
        data: { name: "dev-machine", os: "Windows", userId },
      });
      const event = await prisma.activityEvent.create({
        data: {
          deviceId: device.id,
          appName: "VS Code",
          windowTitle: "index.ts",
          startTime: new Date("2026-02-23T10:00:00Z"),
          endTime: new Date("2026-02-23T10:05:00Z"),
          duration: 300,
        },
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        headers: { "x-user-id": userId },
        payload: { name: "Coding", rules: ["VS\\sCode"] },
      });

      expect(res.statusCode).toBe(201);
      const categoryId = res.json().id as string;

      const assignments = await prisma.categoryAssignment.findMany({
        where: { eventId: event.id },
      });
      expect(assignments).toHaveLength(1);
      expect(assignments[0]!.categoryId).toBe(categoryId);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("should return a single category", async () => {
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "GET",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe("Work");
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/categories/00000000-0000-0000-0000-000000000000",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for invalid UUID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/categories/not-a-uuid",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 for another user's category", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "GET",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": user2.id },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should update category fields", async () => {
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
        payload: { name: "Development", color: "#0000FF" },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe("Development");
      expect(res.json().color).toBe("#0000FF");
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/categories/00000000-0000-0000-0000-000000000000",
        headers: { "x-user-id": userId },
        payload: { name: "Test" },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should return 409 for duplicate name on update", async () => {
      await prisma.category.create({ data: { name: "Work", userId } });
      const cat2 = await prisma.category.create({
        data: { name: "Play", userId },
      });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat2.id}`,
        headers: { "x-user-id": userId },
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(409);
    });

    it("should return 400 for invalid regex rule on update", async () => {
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
        payload: { rules: ["("] },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should recategorize assignments when rules are updated", async () => {
      const device = await prisma.device.create({
        data: { name: "dev-machine", os: "Windows", userId },
      });
      const vscodeEvent = await prisma.activityEvent.create({
        data: {
          deviceId: device.id,
          appName: "VS Code",
          windowTitle: "server.ts",
          startTime: new Date("2026-02-23T10:00:00Z"),
          endTime: new Date("2026-02-23T10:05:00Z"),
          duration: 300,
        },
      });
      const chromeEvent = await prisma.activityEvent.create({
        data: {
          deviceId: device.id,
          appName: "Chrome",
          windowTitle: "Search",
          startTime: new Date("2026-02-23T10:06:00Z"),
          endTime: new Date("2026-02-23T10:10:00Z"),
          duration: 240,
        },
      });

      const category = await prisma.category.create({
        data: { name: "Focus", userId, rules: JSON.stringify(["Chrome"]) },
      });
      await prisma.categoryAssignment.create({
        data: { eventId: chromeEvent.id, categoryId: category.id },
      });

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/api/categories/${category.id}`,
        headers: { "x-user-id": userId },
        payload: { rules: ["VS\\sCode"] },
      });

      expect(patchRes.statusCode).toBe(200);

      const assignments = await prisma.categoryAssignment.findMany({
        where: { categoryId: category.id },
        orderBy: { eventId: "asc" },
      });
      expect(assignments).toHaveLength(1);
      expect(assignments[0]!.eventId).toBe(vscodeEvent.id);
      expect(assignments[0]!.eventId).not.toBe(chromeEvent.id);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete a category and return 204", async () => {
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });

      const res = await app.inject({
        method: "DELETE",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(204);

      const found = await prisma.category.findUnique({ where: { id: cat.id } });
      expect(found).toBeNull();
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/categories/00000000-0000-0000-0000-000000000000",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should cascade delete assignments", async () => {
      const cat = await prisma.category.create({
        data: { name: "Work", userId },
      });
      const device = await prisma.device.create({
        data: { name: "test", os: "Windows", userId },
      });
      const event = await prisma.activityEvent.create({
        data: {
          deviceId: device.id,
          appName: "VS Code",
          windowTitle: "test.ts",
          startTime: new Date(),
          endTime: new Date(),
          duration: 60,
        },
      });
      await prisma.categoryAssignment.create({
        data: { eventId: event.id, categoryId: cat.id },
      });

      await app.inject({
        method: "DELETE",
        url: `/api/categories/${cat.id}`,
        headers: { "x-user-id": userId },
      });

      const assignments = await prisma.categoryAssignment.findMany({
        where: { categoryId: cat.id },
      });
      expect(assignments).toHaveLength(0);
    });
  });
});
