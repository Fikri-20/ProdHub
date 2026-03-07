import { type FastifyPluginAsync } from "fastify";
import { getDefaultUserId } from "../lib/instance-state.js";

const setupRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/setup/status — returns the default user ID (no auth required)
  app.get("/status", async (_request, reply) => {
    const userId = getDefaultUserId();
    return reply.send({ userId });
  });
};

export default setupRoutes;
