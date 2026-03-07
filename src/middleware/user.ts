import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import prisma from "../lib/prisma.js";
import { hashApiKey } from "../lib/api-key.js";
import { getDefaultUserId } from "../lib/instance-state.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PUBLIC_PATHS = ["/api/events/health", "/api/setup/status", "/health"];

/**
 * Auth middleware with three strategies:
 *
 * 1. `Authorization: Bearer <rawApiKey>` — hashes the key, looks up api_keys table
 * 2. `X-User-Id: <uuid>` — direct user ID (for dashboard, tests)
 * 3. No auth → use default user (single-user self-hosted mode)
 *
 * When `REQUIRE_AUTH=true`, strategy 3 is disabled (returns 401).
 */
const authMiddleware = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userId", "");

  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip auth for public paths
      const urlPath = request.url.split("?")[0]!;
      if (PUBLIC_PATHS.includes(urlPath)) {
        return;
      }

      // Strategy 1: Bearer token (API key)
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const rawKey = authHeader.slice(7);
        if (!rawKey) {
          return reply
            .status(401)
            .send({ error: "Invalid Authorization header" });
        }

        const hash = hashApiKey(rawKey);
        const apiKey = await prisma.apiKey.findUnique({
          where: { key: hash },
        });

        if (!apiKey || apiKey.revokedAt) {
          return reply
            .status(401)
            .send({ error: "Invalid or revoked API key" });
        }

        // Update lastUsedAt (fire-and-forget, don't block the request)
        prisma.apiKey
          .update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
          })
          .catch(() => {});

        request.userId = apiKey.userId;
        return;
      }

      // Strategy 2: X-User-Id header (dashboard / tests)
      const header = request.headers["x-user-id"];
      const userId = Array.isArray(header) ? header[0] : header;

      if (userId && UUID_REGEX.test(userId)) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          request.userId = userId;
          return;
        }
      }

      // Strategy 3: No auth → default user (self-hosted mode)
      const requireAuth = process.env.REQUIRE_AUTH === "true";
      if (!requireAuth) {
        const defaultId = getDefaultUserId();
        if (defaultId) {
          request.userId = defaultId;
          return;
        }
      }

      return reply
        .status(401)
        .send({ error: "Missing or invalid authentication" });
    },
  );
});

export default authMiddleware;
