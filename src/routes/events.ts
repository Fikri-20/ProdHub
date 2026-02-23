import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { categorizeEvent } from "../services/categorization.js";
import { heartbeatBodySchema, eventsQuerySchema } from "../schemas/events.js";

const eventRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/events/heartbeat — ingest an activity event
  typedApp.post("/heartbeat", {
    schema: { body: heartbeatBodySchema },
  }, async (request, reply) => {
    const { deviceName, os, appName, windowTitle, startTime, endTime, duration } = request.body;

    // Atomic upsert device by compound unique (name, os)
    const device = await prisma.device.upsert({
      where: { name_os: { name: deviceName, os } },
      update: {},
      create: { name: deviceName, os },
    });

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
      include: { device: true },
    });

    await categorizeEvent(event.id, appName, windowTitle);

    return reply.status(201).send(event);
  });

  // GET /api/events — query events with filters and pagination
  typedApp.get("/", {
    schema: { querystring: eventsQuerySchema },
  }, async (request, reply) => {
    const { from, to, limit, offset, appName } = request.query;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const effectiveFrom = from ?? twentyFourHoursAgo;
    const effectiveTo = to ?? now;
    const effectiveLimit = Math.min(Math.max(limit ?? 100, 1), 1000);
    const effectiveOffset = Math.max(offset ?? 0, 0);

    // Build where clause
    const where: Record<string, unknown> = {
      startTime: { gte: effectiveFrom, lte: effectiveTo },
    };

    if (appName) {
      where.appName = appName;
    }

    const events = await prisma.activityEvent.findMany({
      where,
      include: { device: true },
      orderBy: { startTime: "desc" },
      take: effectiveLimit,
      skip: effectiveOffset,
    });

    return reply.send(events);
  });

  // GET /api/events/health — simple health check
  app.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
};

export default eventRoutes;
