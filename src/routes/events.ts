import type { FastifyInstance } from "fastify";
import prisma from "../lib/prisma.js";

const eventRoutes = async (app: FastifyInstance) => {
  // POST /api/events/heartbeat — ingest an activity event
  app.post("/heartbeat", async (request, reply) => {
    const body = request.body as Record<string, unknown> | null | undefined;

    if (!body || typeof body !== "object") {
      return reply.status(400).send({ error: "Request body is required" });
    }

    const { deviceName, os, appName, windowTitle, startTime, endTime, duration } = body as Record<string, unknown>;

    // Validate required string fields
    const stringFields = { deviceName, os, appName, windowTitle } as Record<string, unknown>;
    for (const [key, value] of Object.entries(stringFields)) {
      if (typeof value !== "string" || value.trim().length === 0) {
        return reply.status(400).send({ error: `${key} is required and must be a non-empty string` });
      }
    }

    // Validate duration
    if (typeof duration !== "number" || duration <= 0) {
      return reply.status(400).send({ error: "duration is required and must be a positive number" });
    }

    // Validate dates
    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    if (isNaN(start.getTime())) {
      return reply.status(400).send({ error: "startTime must be a valid ISO date string" });
    }
    if (isNaN(end.getTime())) {
      return reply.status(400).send({ error: "endTime must be a valid ISO date string" });
    }

    // Upsert device by (name, os)
    let device = await prisma.device.findFirst({
      where: { name: (deviceName as string).trim(), os: (os as string).trim() },
    });

    if (!device) {
      device = await prisma.device.create({
        data: { name: (deviceName as string).trim(), os: (os as string).trim() },
      });
    }

    // Create the activity event
    const event = await prisma.activityEvent.create({
      data: {
        deviceId: device.id,
        appName: (appName as string).trim(),
        windowTitle: (windowTitle as string).trim(),
        startTime: start,
        endTime: end,
        duration: Math.round(duration),
      },
      include: { device: true },
    });

    return reply.status(201).send(event);
  });

  // GET /api/events — query events with filters and pagination
  app.get("/", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parse date range
    let from = twentyFourHoursAgo;
    let to = now;

    if (query.from) {
      const parsed = new Date(query.from);
      if (isNaN(parsed.getTime())) {
        return reply.status(400).send({ error: "from must be a valid ISO date string" });
      }
      from = parsed;
    }

    if (query.to) {
      const parsed = new Date(query.to);
      if (isNaN(parsed.getTime())) {
        return reply.status(400).send({ error: "to must be a valid ISO date string" });
      }
      to = parsed;
    }

    // Parse pagination
    const limit = Math.min(Math.max(parseInt(query.limit ?? "100", 10) || 100, 1), 1000);
    const offset = Math.max(parseInt(query.offset ?? "0", 10) || 0, 0);

    // Build where clause
    const where: Record<string, unknown> = {
      startTime: { gte: from, lte: to },
    };

    if (query.appName) {
      where.appName = query.appName;
    }

    const events = await prisma.activityEvent.findMany({
      where,
      include: { device: true },
      orderBy: { startTime: "desc" },
      take: limit,
      skip: offset,
    });

    return reply.send(events);
  });

  // GET /api/events/health — simple health check
  app.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
};

export default eventRoutes;
