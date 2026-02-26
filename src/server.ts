import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import prisma from "./lib/prisma.js";
import userMiddleware from "./middleware/user.js";
import eventRoutes from "./routes/events.js";
import categoryRoutes from "./routes/categories.js";
import summaryRoutes from "./routes/summary.js";
import heatmapRoutes from "./routes/heatmap.js";
import keyRoutes from "./routes/keys.js";

const app = Fastify({ logger: true });

// Wire Zod type provider
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Custom error handler for Zod validation errors
app.setErrorHandler(function (error, _request, reply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const firstIssue = error.validation[0]?.params?.issue;
    const message = firstIssue?.message ?? "Validation error";
    return reply.status(400).send({ error: message });
  }

  // Default Fastify error handling
  const err = error as FastifyError;
  reply.status(err.statusCode ?? 500).send({
    error: err.message,
  });
});

// CORS — register before auth so preflight OPTIONS requests work
app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
  credentials: true,
});

// Register user identification middleware (pre-auth, X-User-Id header)
app.register(userMiddleware);

// Rate limiting — 100 req/min per user (or per IP for unauthenticated)
// Registered after userMiddleware with preHandler hook so request.userId is available
app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  hook: "preHandler",
  keyGenerator: (request) => {
    return request.userId || request.ip;
  },
});

// Register route plugins
app.register(eventRoutes, { prefix: "/api/events" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(summaryRoutes, { prefix: "/api/summary" });
app.register(heatmapRoutes, { prefix: "/api/heatmap" });
app.register(keyRoutes, { prefix: "/api/keys" });

// Disconnect Prisma when the server shuts down
app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

const start = async () => {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    app.log.info("Connected to PostgreSQL");

    await app.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app };
