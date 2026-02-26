import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { heatmapQuerySchema } from "../schemas/heatmap.js";

const heatmapRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/heatmap — daily aggregated durations (scoped to user)
  typedApp.get(
    "/",
    {
      schema: { querystring: heatmapQuerySchema },
    },
    async (request, reply) => {
      const { from, to } = request.query;
      const userId = request.userId;

      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const effectiveFrom = from ?? oneYearAgo;
      const effectiveTo = to ?? tomorrow;

      const results = await prisma.$queryRaw<
        Array<{ date: string; total_duration: bigint }>
      >`
        SELECT DATE(ae.start_time) AS date, COALESCE(SUM(ae.duration), 0) AS total_duration
        FROM activity_events ae
        JOIN devices d ON d.id = ae.device_id
        WHERE d.user_id = ${userId}
          AND ae.start_time >= ${effectiveFrom}
          AND ae.start_time <= ${effectiveTo}
        GROUP BY DATE(ae.start_time)
        ORDER BY date ASC
      `;

      const data = results.map((r) => ({
        date: typeof r.date === "string"
          ? r.date
          : (r.date as Date).toISOString().slice(0, 10),
        totalDuration: Number(r.total_duration),
      }));

      return reply.send(data);
    },
  );
};

export default heatmapRoutes;
