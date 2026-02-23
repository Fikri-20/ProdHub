import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import {
  createCategoryBodySchema,
  updateCategoryBodySchema,
  categoryParamsSchema,
} from "../schemas/categories.js";

const categoryRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/categories — list all categories
  app.get("/", async (_request, reply) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return reply.send(categories);
  });

  // POST /api/categories — create a category
  typedApp.post("/", {
    schema: { body: createCategoryBodySchema },
  }, async (request, reply) => {
    const { name, color, rules } = request.body;

    // Check uniqueness
    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      return reply.status(409).send({ error: `Category "${name}" already exists` });
    }

    const category = await prisma.category.create({
      data: {
        name,
        ...(color !== undefined ? { color } : {}),
        ...(rules !== undefined ? { rules } : {}),
      },
    });

    return reply.status(201).send(category);
  });

  // GET /api/categories/:id — get a single category
  typedApp.get("/:id", {
    schema: { params: categoryParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!category) {
      return reply.status(404).send({ error: "Category not found" });
    }

    return reply.send(category);
  });

  // PATCH /api/categories/:id — update a category
  typedApp.patch("/:id", {
    schema: {
      params: categoryParamsSchema,
      body: updateCategoryBodySchema,
    },
  }, async (request, reply) => {
    const { id } = request.params;
    const { name, color, rules } = request.body;

    // Check category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const data: Record<string, unknown> = {};

    if (name !== undefined) {
      // Check uniqueness (only if name is changing)
      if (name !== existing.name) {
        const duplicate = await prisma.category.findUnique({ where: { name } });
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

    return reply.send(updated);
  });

  // DELETE /api/categories/:id — delete a category (cascades assignments)
  typedApp.delete("/:id", {
    schema: { params: categoryParamsSchema },
  }, async (request, reply) => {
    const { id } = request.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });

    return reply.status(204).send();
  });
};

export default categoryRoutes;
