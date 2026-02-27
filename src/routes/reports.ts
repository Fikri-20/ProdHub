import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { reportsQuerySchema } from "../schemas/reports.js";

const reportRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/reports — weekly or monthly summaries
  typedApp.get(
    "/",
    {
      schema: { querystring: reportsQuerySchema },
    },
    async (request, reply) => {
      const { period, from, to } = request.query;
      const userId = request.userId;

      const now = new Date();
      let effectiveFrom: Date;
      let effectiveTo: Date;

      if (period === "weekly") {
        // Default: last 12 weeks
        effectiveFrom = from ?? new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
        effectiveTo = to ?? now;
      } else {
        // Default: last 12 months
        effectiveFrom = from ?? new Date(now.getFullYear() - 1, now.getMonth(), 1);
        effectiveTo = to ?? now;
      }

      if (period === "weekly") {
        const results = await prisma.$queryRaw<
          Array<{ week_start: Date; total_duration: bigint; event_count: bigint }>
        >`
          SELECT
            DATE_TRUNC('week', ae.start_time) AS week_start,
            COALESCE(SUM(ae.duration), 0) AS total_duration,
            COUNT(*)::bigint AS event_count
          FROM activity_events ae
          JOIN devices d ON d.id = ae.device_id
          WHERE d.user_id = ${userId}
            AND ae.start_time >= ${effectiveFrom}
            AND ae.start_time <= ${effectiveTo}
          GROUP BY week_start
          ORDER BY week_start ASC
        `;

        const data = results.map((r) => ({
          periodStart: r.week_start.toISOString().slice(0, 10),
          totalDuration: Number(r.total_duration),
          eventCount: Number(r.event_count),
        }));

        return reply.send(data);
      }

      // Monthly
      const results = await prisma.$queryRaw<
        Array<{ month_start: Date; total_duration: bigint; event_count: bigint }>
      >`
        SELECT
          DATE_TRUNC('month', ae.start_time) AS month_start,
          COALESCE(SUM(ae.duration), 0) AS total_duration,
          COUNT(*)::bigint AS event_count
        FROM activity_events ae
        JOIN devices d ON d.id = ae.device_id
        WHERE d.user_id = ${userId}
          AND ae.start_time >= ${effectiveFrom}
          AND ae.start_time <= ${effectiveTo}
        GROUP BY month_start
        ORDER BY month_start ASC
      `;

      const data = results.map((r) => ({
        periodStart: r.month_start.toISOString().slice(0, 10),
        totalDuration: Number(r.total_duration),
        eventCount: Number(r.event_count),
      }));

      return reply.send(data);
    },
  );
};

export default reportRoutes;
