import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import prisma from "../lib/prisma.js";
import { generateApiKey } from "../lib/api-key.js";
import { createKeyBodySchema, keyParamsSchema } from "../schemas/keys.js";

const keyRoutes = async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/keys — create a new API key
  typedApp.post(
    "/",
    {
      schema: { body: createKeyBodySchema },
    },
    async (request, reply) => {
      const { name } = request.body;
      const userId = request.userId;

      const { rawKey, hash, prefix } = generateApiKey();

      const apiKey = await prisma.apiKey.create({
        data: {
          userId,
          name,
          key: hash,
          prefix,
        },
      });

      // Return the raw key ONCE — it cannot be retrieved again
      return reply.status(201).send({
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        rawKey,
        createdAt: apiKey.createdAt,
      });
    },
  );

  // GET /api/keys — list user's API keys (no raw key)
  app.get("/", async (request, reply) => {
    const userId = request.userId;

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(keys);
  });

  // DELETE /api/keys/:id — revoke (soft-delete) an API key
  typedApp.delete(
    "/:id",
    {
      schema: { params: keyParamsSchema },
    },
    async (request, reply) => {
      const { id } = request.params;
      const userId = request.userId;

      const existing = await prisma.apiKey.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return reply.status(404).send({ error: "API key not found" });
      }

      if (existing.revokedAt) {
        return reply.status(400).send({ error: "API key already revoked" });
      }

      await prisma.apiKey.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      return reply.status(204).send();
    },
  );
};

export default keyRoutes;
