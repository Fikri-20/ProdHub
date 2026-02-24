import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Rate Limiting + CORS", () => {
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

  describe("CORS", () => {
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

  describe("Rate limiting", () => {
    it("should include rate limit headers on responses", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events",
        headers: { "x-user-id": userId },
      });

      expect(res.headers["x-ratelimit-limit"]).toBeDefined();
      expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    });

    it("should return 429 when rate limit is exceeded", async () => {
      // Build a separate app with a very low rate limit
      const limitedApp = buildApp({ rateLimitMax: 2 });
      await limitedApp.ready();

      try {
        // Send requests up to the limit
        for (let i = 0; i < 2; i++) {
          await limitedApp.inject({
            method: "GET",
            url: "/api/events",
            headers: { "x-user-id": userId },
          });
        }

        // This one should be rate-limited
        const res = await limitedApp.inject({
          method: "GET",
          url: "/api/events",
          headers: { "x-user-id": userId },
        });

        expect(res.statusCode).toBe(429);
      } finally {
        await limitedApp.close();
      }
    });

    it("should not include rate limit headers on health endpoint", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/events/health",
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["x-ratelimit-limit"]).toBeUndefined();
      expect(res.headers["x-ratelimit-remaining"]).toBeUndefined();
    });

    it("should track rate limits independently per user", async () => {
      // Create a second user
      const user2 = await prisma.user.create({
        data: { email: "user2@example.com", name: "User Two" },
      });

      // Build app with low limit
      const limitedApp = buildApp({ rateLimitMax: 2 });
      await limitedApp.ready();

      try {
        // Exhaust user1's limit
        for (let i = 0; i < 2; i++) {
          await limitedApp.inject({
            method: "GET",
            url: "/api/events",
            headers: { "x-user-id": userId },
          });
        }

        // user1 should be rate-limited
        const res1 = await limitedApp.inject({
          method: "GET",
          url: "/api/events",
          headers: { "x-user-id": userId },
        });
        expect(res1.statusCode).toBe(429);

        // user2 should still be allowed
        const res2 = await limitedApp.inject({
          method: "GET",
          url: "/api/events",
          headers: { "x-user-id": user2.id },
        });
        expect(res2.statusCode).toBe(200);
      } finally {
        await limitedApp.close();
      }
    });
  });
});
