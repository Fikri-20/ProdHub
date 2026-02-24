import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../helpers.js";
import prisma from "../../lib/prisma.js";

describe("Tenant Isolation", () => {
  let app: FastifyInstance;
  let userA: string;
  let userB: string;

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

    const a = await prisma.user.create({
      data: { email: "tenant-a@example.com", name: "Tenant A" },
    });
    const b = await prisma.user.create({
      data: { email: "tenant-b@example.com", name: "Tenant B" },
    });
    userA = a.id;
    userB = b.id;
  });

  // Helper: seed devices, events, and categories for both tenants
  async function seedBothTenants() {
    const deviceA = await prisma.device.create({
      data: { name: "laptop", os: "Windows", userId: userA },
    });
    const deviceB = await prisma.device.create({
      data: { name: "laptop", os: "macOS", userId: userB },
    });

    await prisma.activityEvent.createMany({
      data: [
        {
          deviceId: deviceA.id,
          appName: "VS Code",
          windowTitle: "file-a.ts",
          startTime: new Date("2026-02-23T10:00:00Z"),
          endTime: new Date("2026-02-23T10:05:00Z"),
          duration: 300,
        },
        {
          deviceId: deviceA.id,
          appName: "Chrome",
          windowTitle: "Google",
          startTime: new Date("2026-02-23T10:05:00Z"),
          endTime: new Date("2026-02-23T10:10:00Z"),
          duration: 300,
        },
      ],
    });

    await prisma.activityEvent.createMany({
      data: [
        {
          deviceId: deviceB.id,
          appName: "IntelliJ",
          windowTitle: "file-b.java",
          startTime: new Date("2026-02-23T11:00:00Z"),
          endTime: new Date("2026-02-23T11:10:00Z"),
          duration: 600,
        },
      ],
    });

    const catA = await prisma.category.create({
      data: { name: "Coding", userId: userA, rules: ["VS\\sCode"] },
    });
    const catB = await prisma.category.create({
      data: { name: "Coding", userId: userB, rules: ["IntelliJ"] },
    });

    return { deviceA, deviceB, catA, catB };
  }

  // ─── Health endpoint (public) ────────────────────────────────

  it("1. GET /api/events/health returns 200 without auth headers", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/events/health",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("2. GET /api/events/health returns 200 with auth headers too", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/events/health",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  // ─── Heartbeat isolation ─────────────────────────────────────

  it("3. POST /api/events/heartbeat creates device scoped to requesting user", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/events/heartbeat",
      headers: { "x-user-id": userA },
      payload: {
        deviceName: "work-pc",
        os: "Windows",
        appName: "VS Code",
        windowTitle: "test.ts",
        startTime: "2026-02-23T10:00:00.000Z",
        endTime: "2026-02-23T10:05:00.000Z",
        duration: 300,
      },
    });

    expect(res.statusCode).toBe(201);

    const device = await prisma.device.findFirst({
      where: { name: "work-pc" },
    });
    expect(device!.userId).toBe(userA);
  });

  it("4. Same device name for different users creates separate records", async () => {
    const payload = {
      deviceName: "shared-name",
      os: "Windows",
      appName: "VS Code",
      windowTitle: "test.ts",
      startTime: "2026-02-23T10:00:00.000Z",
      endTime: "2026-02-23T10:05:00.000Z",
      duration: 300,
    };

    await app.inject({
      method: "POST",
      url: "/api/events/heartbeat",
      headers: { "x-user-id": userA },
      payload,
    });

    await app.inject({
      method: "POST",
      url: "/api/events/heartbeat",
      headers: { "x-user-id": userB },
      payload,
    });

    const devices = await prisma.device.findMany({
      where: { name: "shared-name" },
    });
    expect(devices).toHaveLength(2);
    expect(devices.map((d) => d.userId).sort()).toEqual(
      [userA, userB].sort(),
    );
  });

  // ─── Events isolation ────────────────────────────────────────

  it("5. GET /api/events returns only requesting user's events", async () => {
    await seedBothTenants();

    const res = await app.inject({
      method: "GET",
      url: "/api/events?from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(2);
    for (const event of body) {
      expect(event.device.userId).toBe(userA);
    }
  });

  it("6. GET /api/events returns empty for user with no events", async () => {
    await seedBothTenants();

    // Create a third user with no data
    const userC = await prisma.user.create({
      data: { email: "tenant-c@example.com" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/events?from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
      headers: { "x-user-id": userC.id },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(0);
  });

  // ─── Categories isolation ────────────────────────────────────

  it("7. GET /api/categories returns only requesting user's categories", async () => {
    const { catA } = await seedBothTenants();

    const res = await app.inject({
      method: "GET",
      url: "/api/categories",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(catA.id);
  });

  it("8. POST /api/categories allows same name for different users", async () => {
    const resA = await app.inject({
      method: "POST",
      url: "/api/categories",
      headers: { "x-user-id": userA },
      payload: { name: "Work" },
    });

    const resB = await app.inject({
      method: "POST",
      url: "/api/categories",
      headers: { "x-user-id": userB },
      payload: { name: "Work" },
    });

    expect(resA.statusCode).toBe(201);
    expect(resB.statusCode).toBe(201);
    expect(resA.json().id).not.toBe(resB.json().id);
  });

  it("9. GET /api/categories/:id returns 404 for another user's category", async () => {
    const { catA } = await seedBothTenants();

    const res = await app.inject({
      method: "GET",
      url: `/api/categories/${catA.id}`,
      headers: { "x-user-id": userB },
    });

    expect(res.statusCode).toBe(404);
  });

  it("10. PATCH /api/categories/:id returns 404 for another user's category", async () => {
    const { catA } = await seedBothTenants();

    const res = await app.inject({
      method: "PATCH",
      url: `/api/categories/${catA.id}`,
      headers: { "x-user-id": userB },
      payload: { name: "Hacked" },
    });

    expect(res.statusCode).toBe(404);

    // Verify category unchanged
    const cat = await prisma.category.findUnique({ where: { id: catA.id } });
    expect(cat!.name).toBe("Coding");
  });

  it("11. DELETE /api/categories/:id returns 404 for another user's category (category still exists)", async () => {
    const { catA } = await seedBothTenants();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/categories/${catA.id}`,
      headers: { "x-user-id": userB },
    });

    expect(res.statusCode).toBe(404);

    // Verify category still exists
    const cat = await prisma.category.findUnique({ where: { id: catA.id } });
    expect(cat).not.toBeNull();
  });

  it("12. POST /api/categories/:id/recategorize returns 404 for another user's category", async () => {
    const { catA } = await seedBothTenants();

    const res = await app.inject({
      method: "POST",
      url: `/api/categories/${catA.id}/recategorize`,
      headers: { "x-user-id": userB },
    });

    expect(res.statusCode).toBe(404);
  });

  // ─── Summary isolation ───────────────────────────────────────

  it("13. GET /api/summary?groupBy=app returns only requesting user's data", async () => {
    await seedBothTenants();

    const res = await app.inject({
      method: "GET",
      url: "/api/summary?groupBy=app&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    const appNames = body.map((r: { name: string }) => r.name);
    expect(appNames).toContain("VS Code");
    expect(appNames).toContain("Chrome");
    expect(appNames).not.toContain("IntelliJ");
  });

  it("14. GET /api/summary?groupBy=category returns only requesting user's data", async () => {
    const { catA } = await seedBothTenants();

    // Auto-categorize user A's events
    await app.inject({
      method: "POST",
      url: `/api/categories/${catA.id}/recategorize`,
      headers: { "x-user-id": userA },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/summary?groupBy=category&from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    // User A's "Coding" category should only match VS Code events
    for (const entry of body) {
      expect(entry.name).toBe("Coding");
    }
  });

  // ─── API Keys isolation ──────────────────────────────────────

  it("15. GET /api/keys returns only requesting user's keys", async () => {
    // Create keys for both users
    await app.inject({
      method: "POST",
      url: "/api/keys",
      headers: { "x-user-id": userA },
      payload: { name: "Key A" },
    });
    await app.inject({
      method: "POST",
      url: "/api/keys",
      headers: { "x-user-id": userB },
      payload: { name: "Key B" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/keys",
      headers: { "x-user-id": userA },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Key A");
  });

  it("16. DELETE /api/keys/:id returns 404 for another user's key", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/keys",
      headers: { "x-user-id": userA },
      payload: { name: "User A Key" },
    });
    const { id } = createRes.json();

    const res = await app.inject({
      method: "DELETE",
      url: `/api/keys/${id}`,
      headers: { "x-user-id": userB },
    });

    expect(res.statusCode).toBe(404);

    // Verify key is not revoked
    const key = await prisma.apiKey.findUnique({ where: { id } });
    expect(key!.revokedAt).toBeNull();
  });

  // ─── Auto-categorization isolation ───────────────────────────

  it("17. Auto-categorize on heartbeat uses only requesting user's rules", async () => {
    // User A has a "Coding" rule matching "VS Code"
    await prisma.category.create({
      data: { name: "Coding", userId: userA, rules: ["VS\\sCode"] },
    });

    // User B has a "Browsing" rule matching "VS Code" (different category name)
    await prisma.category.create({
      data: { name: "Browsing", userId: userB, rules: ["VS\\sCode"] },
    });

    // User A sends a heartbeat with VS Code
    const res = await app.inject({
      method: "POST",
      url: "/api/events/heartbeat",
      headers: { "x-user-id": userA },
      payload: {
        deviceName: "laptop",
        os: "Windows",
        appName: "VS Code",
        windowTitle: "index.ts",
        startTime: "2026-02-23T12:00:00.000Z",
        endTime: "2026-02-23T12:05:00.000Z",
        duration: 300,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();

    // Should be categorized under user A's "Coding", not user B's "Browsing"
    expect(body.categories).toHaveLength(1);
    expect(body.categories[0].category.name).toBe("Coding");
    expect(body.categories[0].category.userId).toBe(userA);
  });

  // ─── Auth required on protected endpoints ────────────────────

  it("18. All protected endpoints return 401 without auth header", async () => {
    // GET endpoints — no body needed, auth fires before validation
    const getEndpoints = [
      { method: "GET" as const, url: "/api/events?from=2026-02-23T00:00:00Z&to=2026-02-24T00:00:00Z" },
      { method: "GET" as const, url: "/api/categories" },
      { method: "GET" as const, url: "/api/categories/00000000-0000-0000-0000-000000000000" },
      { method: "DELETE" as const, url: "/api/categories/00000000-0000-0000-0000-000000000000" },
      { method: "DELETE" as const, url: "/api/keys/00000000-0000-0000-0000-000000000000" },
      { method: "GET" as const, url: "/api/summary?groupBy=app" },
      { method: "GET" as const, url: "/api/keys" },
    ];

    for (const endpoint of getEndpoints) {
      const res = await app.inject({
        method: endpoint.method,
        url: endpoint.url,
      });

      expect(res.statusCode, `${endpoint.method} ${endpoint.url} should be 401`).toBe(401);
    }

    // POST/PATCH endpoints — send valid body so Zod doesn't reject before auth
    const postEndpoints: Array<{ method: "POST" | "PATCH"; url: string; payload: Record<string, unknown> }> = [
      {
        method: "POST",
        url: "/api/events/heartbeat",
        payload: {
          deviceName: "test", os: "Windows", appName: "Test", windowTitle: "Test",
          startTime: "2026-02-23T10:00:00.000Z", endTime: "2026-02-23T10:05:00.000Z", duration: 300,
        },
      },
      { method: "POST", url: "/api/categories", payload: { name: "Test" } },
      { method: "PATCH", url: "/api/categories/00000000-0000-0000-0000-000000000000", payload: { name: "Test" } },
      { method: "POST", url: "/api/categories/00000000-0000-0000-0000-000000000000/recategorize", payload: {} },
      { method: "POST", url: "/api/keys", payload: { name: "Test" } },
    ];

    for (const endpoint of postEndpoints) {
      const res = await app.inject({
        method: endpoint.method,
        url: endpoint.url,
        payload: endpoint.payload,
      });

      expect(res.statusCode, `${endpoint.method} ${endpoint.url} should be 401`).toBe(401);
    }
  });
});
