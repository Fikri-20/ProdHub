import type { FastifyInstance } from "fastify";

// This is a Fastify PLUGIN. A plugin is just an async function that receives
// the Fastify instance (app) and can add routes, hooks, decorators, etc.
//
// Why plugins? They let you:
// 1. Split routes into separate files (not one giant server.ts)
// 2. Scope things — a plugin's hooks/decorators don't leak to other plugins
// 3. Compose — register plugins inside plugins for nested organization
//
// Since we registered this with { prefix: "/api/events" } in server.ts,
// the "/" route below actually becomes GET /api/events.

const eventRoutes = async (app: FastifyInstance) => {
  // GET /api/events — return all events (placeholder for now)
  app.get("/", async (_request, reply) => {
    return reply.send({ message: "Events endpoint is working" });
  });

  // GET /api/events/health — simple health check
  app.get("/health", async (_request, reply) => {
    return reply.send({ status: "ok" });
  });
};

export default eventRoutes;
