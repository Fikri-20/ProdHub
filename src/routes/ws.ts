import type { FastifyInstance } from "fastify";
import { addClient } from "../services/ws-broadcast.js";

const wsRoutes = async (app: FastifyInstance) => {
  app.get("/", { websocket: true }, (socket, request) => {
    const userId = request.userId;
    addClient(userId, socket);

    // Keep-alive ping every 30s
    const pingInterval = setInterval(() => {
      if (socket.readyState === socket.OPEN) {
        socket.ping();
      }
    }, 30_000);

    socket.on("close", () => {
      clearInterval(pingInterval);
    });
  });
};

export default wsRoutes;
