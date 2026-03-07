import { type FastifyPluginAsync } from "fastify";
import prisma from "../lib/prisma.js";

interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected";
}

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Reply: HealthResponse }>("/health", async () => {
    let dbStatus: "connected" | "disconnected" = "disconnected";

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    return {
      status: dbStatus === "connected" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: dbStatus,
    };
  });
};

export default healthRoutes;
