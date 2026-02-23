import Fastify from "fastify";
import prisma from "./lib/prisma.js";
import eventRoutes from "./routes/events.js";
import categoryRoutes from "./routes/categories.js";
import summaryRoutes from "./routes/summary.js";

const app = Fastify({ logger: true });

// Register route plugins
app.register(eventRoutes, { prefix: "/api/events" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(summaryRoutes, { prefix: "/api/summary" });

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
