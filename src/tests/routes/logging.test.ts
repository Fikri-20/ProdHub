import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Fastify, { type FastifyError } from "fastify";
import { Writable } from "node:stream";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod";
import {
  buildLoggerOptions,
  genReqId,
  generateErrorId,
  getLogLevel,
  VALID_LOG_LEVELS,
} from "../../lib/logger.js";

/**
 * Build a test app with real logging that writes to a capturable stream.
 */
function buildLoggingApp(logLines: string[]) {
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      logLines.push(chunk.toString());
      callback();
    },
  });

  const loggerOpts = buildLoggerOptions();

  const app = Fastify({
    logger: {
      ...loggerOpts,
      stream,
    },
    genReqId,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Error handler matching server.ts
  app.setErrorHandler(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const firstIssue = error.validation[0]?.params?.issue;
      const message = firstIssue?.message ?? "Validation error";
      return reply.status(400).send({ error: message });
    }

    const err = error as FastifyError;
    const statusCode = err.statusCode ?? 500;

    if (statusCode >= 500) {
      const errorId = generateErrorId();
      request.log.error({ errorId, err }, "Server error");
      reply.header("X-Request-Id", request.id);
      return reply.status(statusCode).send({
        error: "Internal Server Error",
        errorId,
      });
    }

    request.log.warn({ err }, err.message);
    reply.status(statusCode).send({ error: err.message });
  });

  // X-Request-Id on all responses
  app.addHook("onSend", async (request, reply) => {
    reply.header("X-Request-Id", request.id);
  });

  // Test routes
  app.get("/test/ok", async () => {
    return { status: "ok" };
  });

  app.get("/test/error", async () => {
    throw new Error("Test server error");
  });

  app.get("/test/client-error", async (_request, reply) => {
    return reply.status(404).send({ error: "Not found" });
  });

  return app;
}

describe("Structured Logging", () => {
  describe("Logger Configuration", () => {
    it("buildLoggerOptions returns valid pino config", () => {
      const opts = buildLoggerOptions();
      expect(opts.level).toBe("info");
      expect(opts.serializers).toBeDefined();
      expect(opts.serializers.req).toBeTypeOf("function");
      expect(opts.serializers.res).toBeTypeOf("function");
      expect(opts.redact).toContain("req.headers.authorization");
    });

    it("getLogLevel defaults to info", () => {
      const original = process.env.LOG_LEVEL;
      delete process.env.LOG_LEVEL;
      expect(getLogLevel()).toBe("info");
      process.env.LOG_LEVEL = original;
    });

    it("getLogLevel reads LOG_LEVEL env var", () => {
      const original = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "debug";
      expect(getLogLevel()).toBe("debug");
      process.env.LOG_LEVEL = original;
    });

    it("getLogLevel ignores invalid values", () => {
      const original = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "banana";
      expect(getLogLevel()).toBe("info");
      process.env.LOG_LEVEL = original;
    });

    it("getLogLevel is case-insensitive", () => {
      const original = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = "DEBUG";
      expect(getLogLevel()).toBe("debug");
      process.env.LOG_LEVEL = original;
    });

    it("VALID_LOG_LEVELS contains all pino levels", () => {
      expect(VALID_LOG_LEVELS).toEqual([
        "fatal",
        "error",
        "warn",
        "info",
        "debug",
        "trace",
      ]);
    });
  });

  describe("Request ID Generation", () => {
    it("generateErrorId returns a UUID", () => {
      const id = generateErrorId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("generateErrorId returns unique values", () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateErrorId()));
      expect(ids.size).toBe(100);
    });

    it("genReqId generates UUID when no header present", () => {
      const fakeReq = { headers: {} } as unknown as Parameters<typeof genReqId>[0];
      const id = genReqId(fakeReq);
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("genReqId honors X-Request-Id header", () => {
      const fakeReq = {
        headers: { "x-request-id": "custom-req-123" },
      } as unknown as Parameters<typeof genReqId>[0];
      const id = genReqId(fakeReq);
      expect(id).toBe("custom-req-123");
    });

    it("genReqId ignores empty X-Request-Id header", () => {
      const fakeReq = {
        headers: { "x-request-id": "" },
      } as unknown as Parameters<typeof genReqId>[0];
      const id = genReqId(fakeReq);
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe("Request Logging", () => {
    let app: ReturnType<typeof buildLoggingApp>;
    let logLines: string[];

    beforeAll(async () => {
      logLines = [];
      app = buildLoggingApp(logLines);
      await app.ready();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      logLines.length = 0;
    });

    it("emits structured JSON log for a successful request", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/ok",
      });

      expect(res.statusCode).toBe(200);

      // Find the "request completed" log line
      const completedLine = logLines
        .map((l) => JSON.parse(l))
        .find((l) => l.msg === "request completed");

      expect(completedLine).toBeDefined();
      expect(completedLine.reqId).toBeDefined();
      expect(completedLine.res).toBeDefined();
      expect(completedLine.res.statusCode).toBe(200);
      expect(completedLine.responseTime).toBeTypeOf("number");
    });

    it("includes request method and URL in incoming request log", async () => {
      await app.inject({ method: "GET", url: "/test/ok" });

      const incomingLine = logLines
        .map((l) => JSON.parse(l))
        .find((l) => l.msg === "incoming request");

      expect(incomingLine).toBeDefined();
      expect(incomingLine.req.method).toBe("GET");
      expect(incomingLine.req.url).toBe("/test/ok");
    });

    it("returns X-Request-Id header in response", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/ok",
      });

      const requestId = res.headers["x-request-id"];
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe("string");
    });

    it("honors incoming X-Request-Id header", async () => {
      const customId = "my-trace-id-abc-123";
      const res = await app.inject({
        method: "GET",
        url: "/test/ok",
        headers: { "x-request-id": customId },
      });

      expect(res.headers["x-request-id"]).toBe(customId);

      const completedLine = logLines
        .map((l) => JSON.parse(l))
        .find((l) => l.msg === "request completed");

      expect(completedLine.reqId).toBe(customId);
    });
  });

  describe("Error ID in 5xx Responses", () => {
    let app: ReturnType<typeof buildLoggingApp>;
    let logLines: string[];

    beforeAll(async () => {
      logLines = [];
      app = buildLoggingApp(logLines);
      await app.ready();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      logLines.length = 0;
    });

    it("returns errorId in 5xx response body", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/error",
      });

      expect(res.statusCode).toBe(500);
      const body = res.json();
      expect(body.error).toBe("Internal Server Error");
      expect(body.errorId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("logs errorId matching the response errorId", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/error",
      });

      const body = res.json();
      const errorLog = logLines
        .map((l) => JSON.parse(l))
        .find((l) => l.msg === "Server error" && l.errorId);

      expect(errorLog).toBeDefined();
      expect(errorLog.errorId).toBe(body.errorId);
    });

    it("includes error message and stack in log", async () => {
      await app.inject({
        method: "GET",
        url: "/test/error",
      });

      const errorLog = logLines
        .map((l) => JSON.parse(l))
        .find((l) => l.msg === "Server error");

      expect(errorLog).toBeDefined();
      expect(errorLog.err.message).toBe("Test server error");
      expect(errorLog.err.stack).toContain("Test server error");
    });

    it("returns X-Request-Id header in 5xx response", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/error",
      });

      expect(res.headers["x-request-id"]).toBeDefined();
    });

    it("does not include errorId in non-5xx responses", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/test/client-error",
      });

      expect(res.statusCode).toBe(404);
      const body = res.json();
      expect(body.errorId).toBeUndefined();
    });

    it("generates unique errorIds for each error", async () => {
      const res1 = await app.inject({ method: "GET", url: "/test/error" });
      const res2 = await app.inject({ method: "GET", url: "/test/error" });

      const body1 = res1.json();
      const body2 = res2.json();
      expect(body1.errorId).not.toBe(body2.errorId);
    });
  });

  describe("Serializers", () => {
    it("req serializer extracts method, url, hostname", () => {
      const opts = buildLoggerOptions();
      const reqSerializer = opts.serializers["req"]!;
      const result = reqSerializer({
        method: "POST",
        url: "/api/events",
        hostname: "localhost",
        headers: { authorization: "Bearer secret" },
      }) as Record<string, unknown>;

      expect(result.method).toBe("POST");
      expect(result.url).toBe("/api/events");
      expect(result.hostname).toBe("localhost");
      // Should NOT include headers (only whitelisted fields)
      expect(result.headers).toBeUndefined();
    });

    it("res serializer extracts statusCode", () => {
      const opts = buildLoggerOptions();
      const resSerializer = opts.serializers["res"]!;
      const result = resSerializer({ statusCode: 201 }) as Record<
        string,
        unknown
      >;

      expect(result.statusCode).toBe(201);
    });
  });
});
