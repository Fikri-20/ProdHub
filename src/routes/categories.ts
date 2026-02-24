import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { recategorizeForCategory } from "../services/categorization.js";
import {
  createCategoryBodySchema,
  updateCategoryBodySchema,
  categoryParamsSchema,
} from "../schemas/categories.js";

const categoryRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/categories — list all categories (scoped to user)
  app.get("/", async (request, reply) => {
    const userId = request.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return reply.send(categories);
  });

  // POST /api/categories — create a category (scoped to user)
  typedApp.post("/", {
    schema: { body: createCategoryBodySchema },
  }, async (request, reply) => {
    const { name, color, rules } = request.body;
    const userId = request.userId;

    // Check uniqueness within user's categories
    const existing = await prisma.category.findUnique({
      where: { name_userId: { name, userId } },
    });

    if (existing) {
      return reply.status(409).send({ error: `Category "${name}" already exists` });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId,
        ...(color !== undefined ? { color } : {}),
        ...(rules !== undefined ? { rules } : {}),
      },
    });

    // Retroactively categorize existing events if rules provided
    if (rules !== undefined && rules.length > 0) {
      await recategorizeForCategory(category.id, userId);
    }

    return reply.status(201).send(category);
  });

  // GET /api/categories/:id — get a single category (scoped to user)
  typedApp.get("/:id", {
    schema: { params: categoryParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.userId;

    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: { assignments: true },
    });

    if (!category) {
      return reply.status(404).send({ error: "Category not found" });
    }

    return reply.send(category);
  });

  // PATCH /api/categories/:id — update a category (scoped to user)
  typedApp.patch("/:id", {
    schema: {
      params: categoryParamsSchema,
      body: updateCategoryBodySchema,
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { name, color, rules } = request.body;
    const userId = request.userId;

    // Check category exists and belongs to user
    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const data: Record<string, unknown> = {};

    if (name !== undefined) {
      // Check uniqueness within user's categories (only if name is changing)
      if (name !== existing.name) {
        const duplicate = await prisma.category.findUnique({
          where: { name_userId: { name, userId } },
        });
        if (duplicate) {
          return reply.status(409).send({ error: `Category "${name}" already exists` });
        }
      }
      data.name = name;
    }

    if (color !== undefined) {
      data.color = color;
    }

    if (rules !== undefined) {
      data.rules = rules;
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    // Recategorize if rules changed
    if (rules !== undefined) {
      await recategorizeForCategory(id, userId);
    }

    return reply.send(updated);
  });

  // DELETE /api/categories/:id — delete a category (cascades assignments, scoped to user)
  typedApp.delete("/:id", {
    schema: { params: categoryParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.userId;

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });

    return reply.status(204).send();
  });

  // POST /api/categories/:id/recategorize — retroactive re-categorization
  typedApp.post("/:id/recategorize", {
    schema: { params: categoryParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;
    const userId = request.userId;

    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const assignedEvents = await recategorizeForCategory(id, userId);

    return reply.send({
      categoryId: category.id,
      categoryName: category.name,
      assignedEvents,
    });
  });
};

export default categoryRoutes;
