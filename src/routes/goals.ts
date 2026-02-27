import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { createGoalBodySchema, updateGoalBodySchema, goalParamsSchema } from "../schemas/goals.js";

const goalRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/goals — list all goals with today's progress
  app.get("/", async (request, reply) => {
    const userId = request.userId;

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // Calculate today's progress for each goal
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const where: Record<string, unknown> = {
          startTime: { gte: todayStart, lte: todayEnd },
          device: { userId },
        };

        if (goal.appFilter) {
          where.appName = goal.appFilter;
        }

        const result = await prisma.activityEvent.aggregate({
          where,
          _sum: { duration: true },
        });

        const currentSeconds = result._sum.duration ?? 0;

        return {
          ...goal,
          currentSeconds,
          percentage: Math.min(
            100,
            Math.round((currentSeconds / goal.targetSeconds) * 100),
          ),
        };
      }),
    );

    return reply.send(goalsWithProgress);
  });

  // POST /api/goals — create a goal
  typedApp.post("/", {
    schema: { body: createGoalBodySchema },
  }, async (request, reply) => {
    const { name, targetSeconds, appFilter } = request.body;
    const userId = request.userId;

    const existing = await prisma.goal.findUnique({
      where: { name_userId: { name, userId } },
    });

    if (existing) {
      return reply.status(409).send({ error: `Goal "${name}" already exists` });
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        targetSeconds,
        appFilter: appFilter ?? null,
        userId,
      },
    });

    return reply.status(201).send(goal);
  });

  // PATCH /api/goals/:id — update a goal
  typedApp.patch("/:id", {
    schema: { params: goalParamsSchema, body: updateGoalBodySchema },
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.userId;

    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: "Goal not found" });
    }

    const data: Record<string, unknown> = {};
    const { name, targetSeconds, appFilter } = request.body;

    if (name !== undefined) {
      if (name !== existing.name) {
        const duplicate = await prisma.goal.findUnique({
          where: { name_userId: { name, userId } },
        });
        if (duplicate) {
          return reply.status(409).send({ error: `Goal "${name}" already exists` });
        }
      }
      data.name = name;
    }
    if (targetSeconds !== undefined) data.targetSeconds = targetSeconds;
    if (appFilter !== undefined) data.appFilter = appFilter;

    const updated = await prisma.goal.update({
      where: { id },
      data,
    });

    return reply.send(updated);
  });

  // DELETE /api/goals/:id — delete a goal
  typedApp.delete("/:id", {
    schema: { params: goalParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.userId;

    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: "Goal not found" });
    }

    await prisma.goal.delete({ where: { id } });
    return reply.status(204).send();
  });
};

export default goalRoutes;
