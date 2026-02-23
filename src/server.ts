import Fastify from "fastify";
import eventRoutes from "./routes/events.js";

// Create a Fastify instance — this is your HTTP server.
// logger: true means Fastify will print every request/response to the console,
// which is invaluable for debugging during development.
const app = Fastify({ logger: true });

// Register plugins (route groups).
// In Fastify, everything is a plugin — even your routes.
// The { prefix } option means all routes inside eventRoutes
// will be prefixed with /api/events automatically.
app.register(eventRoutes, { prefix: "/api/events" });

// Start the server on port 3000.
// "0.0.0.0" means it listens on all network interfaces, not just localhost.
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
