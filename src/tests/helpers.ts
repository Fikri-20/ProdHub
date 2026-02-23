import Fastify, { type FastifyError } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import eventRoutes from "../routes/events.js";
import categoryRoutes from "../routes/categories.js";
import summaryRoutes from "../routes/summary.js";

/**
 * Build a fresh Fastify instance for testing.
 * Uses fastify.inject() so no real port is opened.
 */
export function buildApp() {
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

  app.register(eventRoutes, { prefix: "/api/events" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(summaryRoutes, { prefix: "/api/summary" });

  return app;
}
