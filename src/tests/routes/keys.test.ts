import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";
import { hashApiKey } from "../../lib/api-key.js";

describe("API Key Routes", () => {
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

  describe("POST /api/keys", () => {
    it("should create an API key and return 201 with raw key", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Work Laptop" },
      });

      expect(res.statusCode).toBe(201);

      const body = res.json();
      expect(body.name).toBe("Work Laptop");
      expect(body.prefix).toBeDefined();
      expect(body.rawKey).toBeDefined();
      expect(body.rawKey).toMatch(/^pk_/);
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it("should store the key as a hash, not raw", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Test Key" },
      });

      const { rawKey, id } = res.json();
      const storedKey = await prisma.apiKey.findUnique({ where: { id } });

      expect(storedKey).toBeDefined();
      expect(storedKey!.key).not.toBe(rawKey);
      expect(storedKey!.key).toBe(hashApiKey(rawKey));
    });

    it("should return 400 for missing name", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
    });

    it("should return 401 without auth", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/keys",
        payload: { name: "No Auth" },
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /api/keys", () => {
    it("should list user's keys without raw key", async () => {
      // Create two keys
      await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Key 1" },
      });
      await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Key 2" },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/keys",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(2);

      // Should NOT contain rawKey or key hash
      for (const key of body) {
        expect(key.rawKey).toBeUndefined();
        expect(key.key).toBeUndefined();
        expect(key.prefix).toBeDefined();
        expect(key.name).toBeDefined();
      }
    });

    it("should not list other user's keys", async () => {
      const user2 = await prisma.user.create({
        data: { email: "other@example.com" },
      });

      await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "User 1 Key" },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/keys",
        headers: { "x-user-id": user2.id },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(0);
    });
  });

  describe("DELETE /api/keys/:id", () => {
    it("should revoke a key and return 204", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "To Revoke" },
      });
      const { id } = createRes.json();

      const res = await app.inject({
        method: "DELETE",
        url: `/api/keys/${id}`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(204);

      // Verify revokedAt is set
      const key = await prisma.apiKey.findUnique({ where: { id } });
      expect(key!.revokedAt).not.toBeNull();
    });

    it("should return 404 for non-existent key", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/keys/00000000-0000-0000-0000-000000000000",
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for already revoked key", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Already Revoked" },
      });
      const { id } = createRes.json();

      // Revoke it
      await app.inject({
        method: "DELETE",
        url: `/api/keys/${id}`,
        headers: { "x-user-id": userId },
      });

      // Try revoking again
      const res = await app.inject({
        method: "DELETE",
        url: `/api/keys/${id}`,
        headers: { "x-user-id": userId },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("Bearer token authentication", () => {
    it("should authenticate heartbeat with Bearer token", async () => {
      // Create a key
      const createRes = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Agent Key" },
      });
      const { rawKey } = createRes.json();

      // Use the raw key to send a heartbeat
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { authorization: `Bearer ${rawKey}` },
        payload: {
          deviceName: "test-machine",
          os: "Windows",
          appName: "VS Code",
          windowTitle: "server.ts",
          startTime: "2026-02-24T10:00:00.000Z",
          endTime: "2026-02-24T10:05:00.000Z",
          duration: 300,
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().appName).toBe("VS Code");
    });

    it("should return 401 for invalid Bearer token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { authorization: "Bearer pk_invalid_key_here" },
        payload: {
          deviceName: "test",
          os: "Windows",
          appName: "Test",
          windowTitle: "Test",
          startTime: "2026-02-24T10:00:00.000Z",
          endTime: "2026-02-24T10:05:00.000Z",
          duration: 300,
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it("should return 401 for revoked Bearer token", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Revoke Me" },
      });
      const { id, rawKey } = createRes.json();

      // Revoke the key
      await app.inject({
        method: "DELETE",
        url: `/api/keys/${id}`,
        headers: { "x-user-id": userId },
      });

      // Try to use revoked key
      const res = await app.inject({
        method: "POST",
        url: "/api/events/heartbeat",
        headers: { authorization: `Bearer ${rawKey}` },
        payload: {
          deviceName: "test",
          os: "Windows",
          appName: "Test",
          windowTitle: "Test",
          startTime: "2026-02-24T10:00:00.000Z",
          endTime: "2026-02-24T10:05:00.000Z",
          duration: 300,
        },
      });

      expect(res.statusCode).toBe(401);
    });

    it("should update lastUsedAt on successful Bearer auth", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/keys",
        headers: { "x-user-id": userId },
        payload: { name: "Track Usage" },
      });
      const { id, rawKey } = createRes.json();

      // Verify lastUsedAt is null initially
      const before = await prisma.apiKey.findUnique({ where: { id } });
      expect(before!.lastUsedAt).toBeNull();

      // Use the key
      await app.inject({
        method: "GET",
        url: "/api/events?from=2026-02-24T00:00:00Z&to=2026-02-25T00:00:00Z",
        headers: { authorization: `Bearer ${rawKey}` },
      });

      // Wait briefly for fire-and-forget update
      await new Promise((r) => setTimeout(r, 100));

      const after = await prisma.apiKey.findUnique({ where: { id } });
      expect(after!.lastUsedAt).not.toBeNull();
    });
  });
});
