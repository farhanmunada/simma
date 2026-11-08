import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { getEnv } from "./core/config/env.js";
import { errorHandler } from "./core/errors/index.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { setupRoutes } from "./modules/setup/setup.routes.js";
import { studentRoutes } from "./modules/students/students.routes.js";
import { tahfidzRoutes } from "./modules/tahfidz/tahfidz.routes.js";

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

  // Module routes
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(setupRoutes, { prefix: "/api/v1/setup" });
  await app.register(studentRoutes, { prefix: "/api/v1/students" });
  await app.register(tahfidzRoutes, { prefix: "/api/v1/tahfidz" });

  return app;
}
