import crypto from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { FastifyBaseLogger } from "fastify";

const VALID_LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;

type LogLevel = (typeof VALID_LOG_LEVELS)[number];

function getLogLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && VALID_LOG_LEVELS.includes(env as LogLevel)) {
    return env as LogLevel;
  }
  return "info";
}

/**
 * Generate a request ID: honor incoming X-Request-Id header, or create a new UUID.
 */
export function genReqId(req: IncomingMessage): string {
  const header = req.headers["x-request-id"];
  const incoming = Array.isArray(header) ? header[0] : header;
  if (incoming && incoming.length > 0 && incoming.length <= 128) {
    return incoming;
  }
  return crypto.randomUUID();
}

/**
 * Build the Fastify logger options object (pino configuration).
 */
export function buildLoggerOptions(): {
  level: string;
  serializers: Record<string, (value: unknown) => unknown>;
  redact: string[];
} {
  return {
    level: getLogLevel(),
    serializers: {
      req(req: unknown) {
        const r = req as {
          method?: string;
          url?: string;
          hostname?: string;
        };
        return {
          method: r.method,
          url: r.url,
          hostname: r.hostname,
        };
      },
      res(res: unknown) {
        const r = res as { statusCode?: number };
        return {
          statusCode: r.statusCode,
        };
      },
    },
    redact: ["req.headers.authorization"],
  };
}

/**
 * Generate a unique error ID for 5xx error responses.
 */
export function generateErrorId(): string {
  return crypto.randomUUID();
}

/**
 * Register process-level handlers for uncaught exceptions and unhandled rejections.
 * Logs the error with full context before exiting.
 */
export function registerProcessErrorHandlers(logger: FastifyBaseLogger): void {
  process.on("uncaughtException", (err: Error) => {
    logger.fatal({ err, errorType: "uncaughtException" }, "Uncaught exception — shutting down");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal(
      { err: reason, errorType: "unhandledRejection" },
      "Unhandled rejection — shutting down",
    );
    process.exit(1);
  });
}

export { getLogLevel, VALID_LOG_LEVELS };
export type { LogLevel };
