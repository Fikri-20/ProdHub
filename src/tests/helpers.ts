import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import userMiddleware from "../middleware/user.js";
import eventRoutes from "../routes/events.js";
import categoryRoutes from "../routes/categories.js";
import summaryRoutes from "../routes/summary.js";
import keyRoutes from "../routes/keys.js";

/**
 * Build a fresh Fastify instance for testing.
 * Uses fastify.inject() so no real port is opened.
 */
export function buildApp(opts?: { rateLimitMax?: number }) {
  const app = Fastify({ logger: false });

  // Wire Zod type provider (must match server.ts)
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Custom error handler for Zod validation errors (must match server.ts)
  app.setErrorHandler(function (error, _request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const firstIssue = error.validation[0]?.params?.issue;
      const message = firstIssue?.message ?? "Validation error";
      return reply.status(400).send({ error: message });
    }

    const err = error as FastifyError;
    reply.status(err.statusCode ?? 500).send({
      error: err.message,
    });
  });

  // CORS (must match server.ts)
  app.register(cors, { origin: true });

  // Register user middleware (same as server.ts)
  app.register(userMiddleware);

  // Rate limiting — registered after userMiddleware with preHandler hook
  // so request.userId is available. High default for tests to avoid flakiness.
  app.register(rateLimit, {
    max: opts?.rateLimitMax ?? 1000,
    timeWindow: "1 minute",
    hook: "preHandler",
    keyGenerator: (request) => {
      return request.userId || request.ip;
    },
  });

  app.register(eventRoutes, { prefix: "/api/events" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(summaryRoutes, { prefix: "/api/summary" });
  app.register(keyRoutes, { prefix: "/api/keys" });

  return app;
}
