import type { FastifyInstance } from "fastify";
import prisma from "../lib/prisma.js";

const summaryRoutes = async (app: FastifyInstance) => {
  // GET /api/summary — aggregate event durations
  app.get("/", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;

    const groupBy = query.groupBy;
    if (groupBy !== "app" && groupBy !== "category") {
      return reply.status(400).send({ error: "groupBy query param is required and must be 'app' or 'category'" });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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

    if (groupBy === "app") {
      const results = await prisma.activityEvent.groupBy({
        by: ["appName"],
        where: {
          startTime: { gte: from, lte: to },
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
        AND ae.start_time >= ${from}
        AND ae.start_time <= ${to}
      GROUP BY c.id, c.name
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
