import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { categorizeEvent } from "../services/categorization.js";
import { exportQuerySchema, importBodySchema } from "../schemas/export.js";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const exportRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/export — export events as JSON or CSV
  typedApp.get(
    "/",
    {
      schema: { querystring: exportQuerySchema },
    },
    async (request, reply) => {
      const { format, from, to } = request.query;
      const userId = request.userId;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const effectiveFrom = from ?? thirtyDaysAgo;
      const effectiveTo = to ?? now;

      const events = await prisma.activityEvent.findMany({
        where: {
          startTime: { gte: effectiveFrom, lte: effectiveTo },
          device: { userId },
        },
        include: { device: true },
        orderBy: { startTime: "asc" },
        take: 10000,
      });

      if (format === "csv") {
        const header = "appName,windowTitle,deviceName,os,startTime,endTime,duration";
        const rows = events.map((e) =>
          [
            escapeCsvField(e.appName),
            escapeCsvField(e.windowTitle),
            escapeCsvField(e.device.name),
            escapeCsvField(e.device.os),
            e.startTime.toISOString(),
            e.endTime.toISOString(),
            String(e.duration),
          ].join(","),
        );

        const csv = [header, ...rows].join("\n");
        return reply
          .header("Content-Type", "text/csv")
          .header("Content-Disposition", "attachment; filename=prodhub-export.csv")
          .send(csv);
      }

      // JSON format
      const data = events.map((e) => ({
        appName: e.appName,
        windowTitle: e.windowTitle,
        deviceName: e.device.name,
        os: e.device.os,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
        duration: e.duration,
      }));

      return reply
        .header("Content-Disposition", "attachment; filename=prodhub-export.json")
        .send(data);
    },
  );

  // POST /api/import — import events from JSON
  typedApp.post(
    "/",
    {
      schema: { body: importBodySchema },
    },
    async (request, reply) => {
      const { events } = request.body;
      const userId = request.userId;

      let imported = 0;

      for (const evt of events) {
        // Upsert device
        let device;
        try {
          device = await prisma.device.upsert({
            where: { name_os_userId: { name: evt.deviceName, os: evt.os, userId } },
            update: {},
            create: { name: evt.deviceName, os: evt.os, userId },
          });
        } catch {
          device = await prisma.device.findUniqueOrThrow({
            where: { name_os_userId: { name: evt.deviceName, os: evt.os, userId } },
          });
        }

        const event = await prisma.activityEvent.create({
          data: {
            deviceId: device.id,
            appName: evt.appName,
            windowTitle: evt.windowTitle,
            startTime: evt.startTime,
            endTime: evt.endTime,
            duration: evt.duration,
          },
        });

        await categorizeEvent(event.id, evt.appName, evt.windowTitle, userId);
        imported++;
      }

      return reply.status(201).send({ imported });
    },
  );
};

export default exportRoutes;
