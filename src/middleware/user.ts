import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import prisma from "../lib/prisma.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fastify plugin that extracts and validates the X-User-Id header.
 * Attaches `request.userId` for downstream handlers.
 *
 * Temporary pre-auth mechanism — will be replaced by API key auth (TICKET-006).
 */
const userMiddleware = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userId", "");

  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const header = request.headers["x-user-id"];
      const userId = Array.isArray(header) ? header[0] : header;

      if (!userId || !UUID_REGEX.test(userId)) {
        return reply
          .status(401)
          .send({ error: "Missing or invalid X-User-Id header" });
      }

      // Verify user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }

      request.userId = userId;
    },
  );
});

export default userMiddleware;
