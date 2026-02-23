import Fastify from "fastify";
import eventRoutes from "../routes/events.js";
import categoryRoutes from "../routes/categories.js";
import summaryRoutes from "../routes/summary.js";

/**
 * Build a fresh Fastify instance for testing.
 * Uses fastify.inject() so no real port is opened.
 */
export function buildApp() {
  const app = Fastify({ logger: false });

  app.register(eventRoutes, { prefix: "/api/events" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(summaryRoutes, { prefix: "/api/summary" });

  return app;
}
