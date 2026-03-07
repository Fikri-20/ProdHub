import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("CORS", () => {
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

  it("should return CORS headers on OPTIONS preflight", async () => {
    const res = await app.inject({
      method: "OPTIONS",
      url: "/api/events",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("should return CORS headers on normal GET", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/events/health",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });
});
