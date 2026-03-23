import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import { genReqId, generateErrorId } from "../lib/logger.js";
import userMiddleware from "../middleware/user.js";
import eventRoutes from "../routes/events.js";
import categoryRoutes from "../routes/categories.js";
import summaryRoutes from "../routes/summary.js";
import heatmapRoutes from "../routes/heatmap.js";
import keyRoutes from "../routes/keys.js";

/**
 * Build a fresh Fastify instance for testing.
 * Uses fastify.inject() so no real port is opened.
 */
export function buildApp() {
  // Tests run with REQUIRE_AUTH=true so auth middleware rejects unauthenticated requests
  process.env.REQUIRE_AUTH = "true";

  const app = Fastify({ logger: false, genReqId });

  // Wire Zod type provider (must match server.ts)
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Custom error handler with error IDs for 5xx (must match server.ts)
  app.setErrorHandler(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const firstIssue = error.validation[0]?.params?.issue;
      const message = firstIssue?.message ?? "Validation error";
      return reply.status(400).send({ error: message });
    }

    const err = error as FastifyError;
    const statusCode = err.statusCode ?? 500;

    if (statusCode >= 500) {
      const errorId = generateErrorId();
      reply.header("X-Request-Id", request.id);
      return reply.status(statusCode).send({
        error: "Internal Server Error",
        errorId,
      });
    }

    reply.status(statusCode).send({
      error: err.message,
    });
  });

  // Add X-Request-Id to all responses (must match server.ts)
  app.addHook("onSend", async (request, reply) => {
    reply.header("X-Request-Id", request.id);
  });

  // CORS (must match server.ts)
  app.register(cors, { origin: true });

  // Register user middleware (same as server.ts)
  app.register(userMiddleware);

  app.register(eventRoutes, { prefix: "/api/events" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(summaryRoutes, { prefix: "/api/summary" });
  app.register(heatmapRoutes, { prefix: "/api/heatmap" });
  app.register(keyRoutes, { prefix: "/api/keys" });

  return app;
}
