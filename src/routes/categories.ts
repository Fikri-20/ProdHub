import type { FastifyInstance } from "fastify";
import prisma from "../lib/prisma.js";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const categoryRoutes = async (app: FastifyInstance) => {
  // GET /api/categories — list all categories
  app.get("/", async (_request, reply) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return reply.send(categories);
  });

  // POST /api/categories — create a category
  app.post("/", async (request, reply) => {
    const body = request.body as Record<string, unknown> | null | undefined;

    if (!body || typeof body !== "object") {
      return reply.status(400).send({ error: "Request body is required" });
    }

    const { name, color, rules } = body as Record<string, unknown>;

    // Validate name
    if (typeof name !== "string" || name.trim().length === 0) {
      return reply.status(400).send({ error: "name is required and must be a non-empty string" });
    }

    const trimmedName = name.trim();

    // Validate color if provided
    if (color !== undefined && color !== null) {
      if (typeof color !== "string" || !HEX_COLOR_REGEX.test(color)) {
        return reply.status(400).send({ error: "color must be a hex string (e.g. #FF5733)" });
      }
    }

    // Validate rules if provided
    if (rules !== undefined && rules !== null) {
      if (!Array.isArray(rules) || !rules.every((r) => typeof r === "string")) {
        return reply.status(400).send({ error: "rules must be an array of strings" });
      }
    }

    // Check uniqueness
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return reply.status(409).send({ error: `Category "${trimmedName}" already exists` });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        ...(typeof color === "string" ? { color } : {}),
        ...(Array.isArray(rules) ? { rules: rules as string[] } : {}),
      },
    });

    return reply.status(201).send(category);
  });

  // GET /api/categories/:id — get a single category
  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

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
  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown> | null | undefined;

    if (!body || typeof body !== "object") {
      return reply.status(400).send({ error: "Request body is required" });
    }

    // Check category exists
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const { name, color, rules } = body as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return reply.status(400).send({ error: "name must be a non-empty string" });
      }
      const trimmedName = name.trim();

      // Check uniqueness (only if name is changing)
      if (trimmedName !== existing.name) {
        const duplicate = await prisma.category.findUnique({ where: { name: trimmedName } });
        if (duplicate) {
          return reply.status(409).send({ error: `Category "${trimmedName}" already exists` });
        }
      }
      data.name = trimmedName;
    }

    // Validate color if provided
    if (color !== undefined) {
      if (typeof color !== "string" || !HEX_COLOR_REGEX.test(color)) {
        return reply.status(400).send({ error: "color must be a hex string (e.g. #FF5733)" });
      }
      data.color = color;
    }

    // Validate rules if provided
    if (rules !== undefined) {
      if (!Array.isArray(rules) || !rules.every((r) => typeof r === "string")) {
        return reply.status(400).send({ error: "rules must be an array of strings" });
      }
      data.rules = rules;
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return reply.send(updated);
  });

  // DELETE /api/categories/:id — delete a category (cascades assignments)
  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });

    return reply.status(204).send();
  });
};

export default categoryRoutes;
