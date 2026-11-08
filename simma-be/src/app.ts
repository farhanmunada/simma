import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { getEnv } from "./core/config/env.js";
import { errorHandler } from "./core/errors/index.js";

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Plugins
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get("/api/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // Module routes will be registered here by workers
  // await app.register(authRoutes, { prefix: "/api/v1/auth" });
  // await app.register(studentsRoutes, { prefix: "/api/v1/students" });
  // etc.

  return app;
}
