import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Category Routes", () => {
  let app: FastifyInstance;

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
  });

  describe("GET /api/categories", () => {
    it("should return empty array when no categories exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/categories",
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it("should return all categories sorted by name", async () => {
      await prisma.category.createMany({
        data: [
          { name: "Work", color: "#00FF00" },
          { name: "Browsing", color: "#FF0000" },
        ],
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/categories",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(2);
      expect(body[0].name).toBe("Browsing");
      expect(body[1].name).toBe("Work");
    });
  });

  describe("POST /api/categories", () => {
    it("should create a category and return 201", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Work", color: "#00FF00", rules: ["VS Code", "Terminal"] },
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
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.color).toBe("#6B7280"); // default from schema
      expect(body.rules).toEqual([]);
    });

    it("should return 400 for missing name", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { color: "#FF0000" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 409 for duplicate name", async () => {
      await prisma.category.create({ data: { name: "Work" } });

      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(409);
    });

    it("should return 400 for invalid color", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Test", color: "red" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 for invalid rules", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Test", rules: "not-array" },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("should return a single category", async () => {
      const cat = await prisma.category.create({ data: { name: "Work" } });

      const res = await app.inject({
        method: "GET",
        url: `/api/categories/${cat.id}`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe("Work");
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/categories/00000000-0000-0000-0000-000000000000",
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PATCH /api/categories/:id", () => {
    it("should update category fields", async () => {
      const cat = await prisma.category.create({ data: { name: "Work" } });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat.id}`,
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
        payload: { name: "Test" },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should return 409 for duplicate name on update", async () => {
      await prisma.category.create({ data: { name: "Work" } });
      const cat2 = await prisma.category.create({ data: { name: "Play" } });

      const res = await app.inject({
        method: "PATCH",
        url: `/api/categories/${cat2.id}`,
        payload: { name: "Work" },
      });

      expect(res.statusCode).toBe(409);
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete a category and return 204", async () => {
      const cat = await prisma.category.create({ data: { name: "Work" } });

      const res = await app.inject({
        method: "DELETE",
        url: `/api/categories/${cat.id}`,
      });

      expect(res.statusCode).toBe(204);

      const found = await prisma.category.findUnique({ where: { id: cat.id } });
      expect(found).toBeNull();
    });

    it("should return 404 for non-existent category", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/categories/00000000-0000-0000-0000-000000000000",
      });

      expect(res.statusCode).toBe(404);
    });

    it("should cascade delete assignments", async () => {
      const cat = await prisma.category.create({ data: { name: "Work" } });
      const device = await prisma.device.create({ data: { name: "test", os: "Windows" } });
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
      });

      const assignments = await prisma.categoryAssignment.findMany({
        where: { categoryId: cat.id },
      });
      expect(assignments).toHaveLength(0);
    });
  });
});
