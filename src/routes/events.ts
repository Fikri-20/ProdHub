import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { hashApiKey } from "../lib/api-key.js";
import { categorizeEvent } from "../services/categorization.js";
import { heartbeatBodySchema, eventsQuerySchema } from "../schemas/events.js";

const eventRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/events/heartbeat — ingest an activity event
  typedApp.post("/heartbeat", {
    schema: { body: heartbeatBodySchema },
    config: { rateLimit: { max: 200, timeWindow: "1 minute" } },
  }, async (request, reply) => {
    const { deviceName, os, appName, windowTitle, startTime, endTime, duration } = request.body;
    const userId = request.userId;

    // Upsert device with retry for concurrent race conditions
    let device;
    try {
      device = await prisma.device.upsert({
        where: { name_os_userId: { name: deviceName, os, userId } },
        update: {},
        create: { name: deviceName, os, userId },
      });
    } catch {
      // Race condition: another request created the device first — just fetch it
      device = await prisma.device.findUniqueOrThrow({
        where: { name_os_userId: { name: deviceName, os, userId } },
      });
    }

    // Create the activity event
    const event = await prisma.activityEvent.create({
      data: {
        deviceId: device.id,
        appName,
        windowTitle,
        startTime,
        endTime,
        duration: Math.round(duration),
      },
    });

    // Auto-categorize the event
    await categorizeEvent(event.id, appName, windowTitle, userId);

    // Re-fetch with relations
    const fullEvent = await prisma.activityEvent.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        device: true,
        categories: { include: { category: true } },
      },
    });

    return reply.status(201).send(fullEvent);
  });

  // GET /api/events — query events with filters and pagination
  typedApp.get("/", {
    schema: { querystring: eventsQuerySchema },
  }, async (request, reply) => {
    const { from, to, limit, offset, appName } = request.query;
    const userId = request.userId;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const effectiveFrom = from ?? twentyFourHoursAgo;
    const effectiveTo = to ?? now;
    const effectiveLimit = Math.min(Math.max(limit ?? 100, 1), 1000);
    const effectiveOffset = Math.max(offset ?? 0, 0);

    // Build where clause — scoped to user's devices
    const where: Record<string, unknown> = {
      startTime: { gte: effectiveFrom, lte: effectiveTo },
      device: { userId },
    };

    if (appName) {
      where.appName = appName;
    }

    const events = await prisma.activityEvent.findMany({
      where,
      include: { device: true, categories: { include: { category: true } } },
      orderBy: { startTime: "desc" },
      take: effectiveLimit,
      skip: effectiveOffset,
    });

    return reply.send(events);
  });

  // GET /api/events/latest — most recent event for the authenticated user
  app.get("/latest", async (request, reply) => {
    const userId = request.userId;

    const event = await prisma.activityEvent.findFirst({
      where: { device: { userId } },
      orderBy: { startTime: "desc" },
      include: {
        device: true,
        categories: { include: { category: true } },
      },
    });

    if (!event) {
      return reply.status(204).send();
    }

    return reply.send(event);
  });

  // GET /api/events/health — validates API key and returns status
  app.get("/health", { config: { rateLimit: false } }, async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.send({ status: "ok", authenticated: false });
    }

    const rawKey = authHeader.slice(7);
    if (!rawKey) {
      return reply.send({ status: "ok", authenticated: false });
    }

    const hash = hashApiKey(rawKey);
    const apiKey = await prisma.apiKey.findUnique({ where: { key: hash } });

    if (!apiKey || apiKey.revokedAt) {
      return reply.status(401).send({ status: "error", error: "Invalid or revoked API key" });
    }

    return reply.send({ status: "ok", authenticated: true });
  });
};

export default eventRoutes;
