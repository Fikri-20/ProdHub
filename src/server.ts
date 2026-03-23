import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import prisma from "./lib/prisma.js";
import { seedDefaultUser } from "./lib/seed-default-user.js";
import {
  buildLoggerOptions,
  genReqId,
  generateErrorId,
  getLogLevel,
  registerProcessErrorHandlers,
} from "./lib/logger.js";
import userMiddleware from "./middleware/user.js";
import eventRoutes from "./routes/events.js";
import categoryRoutes from "./routes/categories.js";
import summaryRoutes from "./routes/summary.js";
import heatmapRoutes from "./routes/heatmap.js";
import keyRoutes from "./routes/keys.js";
import wsRoutes from "./routes/ws.js";
import exportRoutes from "./routes/export.js";
import goalRoutes from "./routes/goals.js";
import reportRoutes from "./routes/reports.js";
import healthRoutes from "./routes/health.js";
import setupRoutes from "./routes/setup.js";

const app = Fastify({
  logger: buildLoggerOptions(),
  genReqId,
});

// Register process-level error handlers (uncaught exceptions, unhandled rejections)
registerProcessErrorHandlers(app.log);

// Wire Zod type provider
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Custom error handler with error IDs for 5xx errors
app.setErrorHandler(function (error, request, reply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const firstIssue = error.validation[0]?.params?.issue;
    const message = firstIssue?.message ?? "Validation error";
    return reply.status(400).send({ error: message });
  }

  const err = error as FastifyError;
  const statusCode = err.statusCode ?? 500;

  // For 5xx errors, generate an error ID and log with full context
  if (statusCode >= 500) {
    const errorId = generateErrorId();
    request.log.error(
      {
        errorId,
        err,
        userId: request.userId ?? undefined,
      },
      "Server error",
    );
    reply.header("X-Request-Id", request.id);
    return reply.status(statusCode).send({
      error: "Internal Server Error",
      errorId,
    });
  }

  // For 4xx errors, log at warn level and return the original message
  request.log.warn({ err }, err.message);
  reply.status(statusCode).send({
    error: err.message,
  });
});

// Add X-Request-Id to all responses
app.addHook("onSend", async (request, reply) => {
  reply.header("X-Request-Id", request.id);
});

// CORS — register before auth so preflight OPTIONS requests work
app.register(cors, {
  origin: (origin, cb) => {
    const allowed = process.env.CORS_ORIGIN?.split(",") ?? [
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin) {
      cb(null, true);
      return;
    }

    // Allow configured origins
    if (allowed.includes(origin)) {
      cb(null, true);
      return;
    }

    // Allow Chrome extension origins (chrome-extension://*)
    if (origin.startsWith("chrome-extension://")) {
      cb(null, true);
      return;
    }

    cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
});

// Register user identification middleware (pre-auth, X-User-Id header)
app.register(userMiddleware);

// WebSocket support
app.register(websocket);

// Register route plugins
app.register(eventRoutes, { prefix: "/api/events" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(summaryRoutes, { prefix: "/api/summary" });
app.register(heatmapRoutes, { prefix: "/api/heatmap" });
app.register(keyRoutes, { prefix: "/api/keys" });
app.register(exportRoutes, { prefix: "/api/export" });
app.register(goalRoutes, { prefix: "/api/goals" });
app.register(reportRoutes, { prefix: "/api/reports" });
app.register(wsRoutes, { prefix: "/ws" });
app.register(healthRoutes);
app.register(setupRoutes, { prefix: "/api/setup" });

const start = async () => {
  try {
    await prisma.$connect();
    app.log.info("Connected to SQLite");

    const port = Number(process.env.PORT) || 3000;

    // Seed default user and auto-generate API key
    const { rawKey } = await seedDefaultUser();

    // Disconnect Prisma when the server shuts down
    app.addHook("onClose", async () => {
      app.log.info("Server shutting down");
      await prisma.$disconnect();
      app.log.info("Server stopped");
    });

    const environment = process.env.NODE_ENV || "development";
    await app.listen({ port, host: "0.0.0.0" });

    app.log.info(
      { port, environment, logLevel: getLogLevel() },
      "Server started",
    );

    // Print first-run banner only when a new key was just created
    if (rawKey) {
      const divider = "━".repeat(40);
      console.log(`\n${divider}`);
      console.log(`  ProdHub is running!`);
      console.log(`${divider}`);
      console.log(`  Dashboard:   http://localhost:3001`);
      console.log(`  API:         http://localhost:${port}`);
      console.log(`  API Key:     ${rawKey}`);
      console.log(``);
      console.log(`  To connect the desktop agent, set:`);
      console.log(`    TRACKER_API_URL=http://localhost:${port}`);
      console.log(`    TRACKER_API_KEY=${rawKey}`);
      console.log(``);
      console.log(`  Open your dashboard: http://localhost:3001`);
      console.log(`${divider}\n`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

export { app };
