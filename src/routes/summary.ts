import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { summaryQuerySchema } from "../schemas/summary.js";

const summaryRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/summary — aggregate event durations (scoped to user)
  typedApp.get(
    "/",
    {
      schema: { querystring: summaryQuerySchema },
    },
    async (request, reply) => {
      const { groupBy, from, to } = request.query;
      const userId = request.userId;

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const effectiveFrom = from ?? twentyFourHoursAgo;
      const effectiveTo = to ?? now;

      if (groupBy === "project") {
        // SQLite doesn't support regex in SQL — fetch raw events and extract project in JS
        const rawEvents = await prisma.$queryRaw<
          Array<{ app_name: string; window_title: string; duration: number }>
        >`
        SELECT ae.app_name, ae.window_title, ae.duration
        FROM activity_events ae
        JOIN devices d ON d.id = ae.device_id
        WHERE d.user_id = ${userId}
          AND ae.start_time >= ${effectiveFrom}
          AND ae.start_time <= ${effectiveTo}
      `;

        // Extract project name: "file [lang] - ProjectName" → last segment after " - "
        const projectDurations = new Map<string, number>();
        for (const row of rawEvents) {
          const match = row.window_title.match(/.*\s-\s(.+)$/);
          const project = match?.[1]?.trim() || row.app_name;
          projectDurations.set(
            project,
            (projectDurations.get(project) ?? 0) + Number(row.duration),
          );
        }

        const totalDuration = [...projectDurations.values()].reduce(
          (sum, d) => sum + d,
          0,
        );

        const summary = [...projectDurations.entries()]
          .map(([name, dur]) => ({
            name,
            totalDuration: dur,
            percentage:
              totalDuration > 0
                ? Math.round((dur / totalDuration) * 10000) / 100
                : 0,
          }))
          .sort((a, b) => b.totalDuration - a.totalDuration);

        return reply.send(summary);
      }

      if (groupBy === "app") {
        // Scope to user's devices via raw query for correct groupBy
        const results = await prisma.$queryRaw<
          Array<{ app_name: string; total_duration: bigint }>
        >`
        SELECT ae.app_name, COALESCE(SUM(ae.duration), 0) AS total_duration
        FROM activity_events ae
        JOIN devices d ON d.id = ae.device_id
        WHERE d.user_id = ${userId}
          AND ae.start_time >= ${effectiveFrom}
          AND ae.start_time <= ${effectiveTo}
        GROUP BY ae.app_name
        ORDER BY total_duration DESC
      `;

        const totalDuration = results.reduce(
          (sum, r) => sum + Number(r.total_duration),
          0,
        );

        const summary = results.map((r) => ({
          name: r.app_name,
          totalDuration: Number(r.total_duration),
          percentage:
            totalDuration > 0
              ? Math.round((Number(r.total_duration) / totalDuration) * 10000) /
                100
              : 0,
        }));

        return reply.send(summary);
      }

      // groupBy === "category" — scoped to user's categories and events
      const results = await prisma.$queryRaw<
        Array<{ name: string; total_duration: bigint }>
      >`
      SELECT c.name, COALESCE(SUM(ae.duration), 0) AS total_duration
      FROM categories c
      LEFT JOIN category_assignments ca ON ca.category_id = c.id
      LEFT JOIN activity_events ae ON ae.id = ca.event_id
        AND ae.start_time >= ${effectiveFrom}
        AND ae.start_time <= ${effectiveTo}
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(ae.duration), 0) > 0
      ORDER BY total_duration DESC
    `;

      const totalDuration = results.reduce(
        (sum, r) => sum + Number(r.total_duration),
        0,
      );

      const summary = results.map((r) => ({
        name: r.name,
        totalDuration: Number(r.total_duration),
        percentage:
          totalDuration > 0
            ? Math.round((Number(r.total_duration) / totalDuration) * 10000) /
              100
            : 0,
      }));

      return reply.send(summary);
    },
  );
};

export default summaryRoutes;
