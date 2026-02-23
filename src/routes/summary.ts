import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { summaryQuerySchema } from "../schemas/summary.js";

const summaryRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/summary — aggregate event durations
  typedApp.get("/", {
    schema: { querystring: summaryQuerySchema },
  }, async (request, reply) => {
    const { groupBy, from, to } = request.query;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const effectiveFrom = from ?? twentyFourHoursAgo;
    const effectiveTo = to ?? now;

    if (groupBy === "app") {
      const results = await prisma.activityEvent.groupBy({
        by: ["appName"],
        where: {
          startTime: { gte: effectiveFrom, lte: effectiveTo },
        },
        _sum: { duration: true },
        orderBy: { _sum: { duration: "desc" } },
      });

      const totalDuration = results.reduce((sum, r) => sum + (r._sum.duration ?? 0), 0);

      const summary = results.map((r) => ({
        name: r.appName,
        totalDuration: r._sum.duration ?? 0,
        percentage: totalDuration > 0 ? Math.round(((r._sum.duration ?? 0) / totalDuration) * 10000) / 100 : 0,
      }));

      return reply.send(summary);
    }

    // groupBy === "category"
    const results = await prisma.$queryRaw<Array<{ name: string; total_duration: bigint }>>`
      SELECT c.name, COALESCE(SUM(ae.duration), 0) AS total_duration
      FROM categories c
      LEFT JOIN category_assignments ca ON ca.category_id = c.id
      LEFT JOIN activity_events ae ON ae.id = ca.event_id
        AND ae.start_time >= ${effectiveFrom}
        AND ae.start_time <= ${effectiveTo}
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(ae.duration), 0) > 0
      ORDER BY total_duration DESC
    `;

    const totalDuration = results.reduce((sum, r) => sum + Number(r.total_duration), 0);

    const summary = results.map((r) => ({
      name: r.name,
      totalDuration: Number(r.total_duration),
      percentage: totalDuration > 0 ? Math.round((Number(r.total_duration) / totalDuration) * 10000) / 100 : 0,
    }));

    return reply.send(summary);
  });
};

export default summaryRoutes;
