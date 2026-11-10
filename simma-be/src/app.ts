import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { getEnv } from "./core/config/env.js";
import { errorHandler } from "./core/errors/index.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { setupRoutes } from "./modules/setup/setup.routes.js";
import { studentRoutes } from "./modules/students/students.routes.js";
import { tahfidzRoutes } from "./modules/tahfidz/tahfidz.routes.js";
import { attendanceRoutes } from "./modules/attendance/attendance.routes.js";
import { gradesRoutes } from "./modules/grades/grades.routes.js";
import { reportsRoutes } from "./modules/reports/reports.routes.js";
import { ppdbRoutes } from "./modules/ppdb/ppdb.routes.js";
import { lettersRoutes } from "./modules/letters/letters.routes.js";
import { p5raRoutes } from "./modules/p5ra/p5ra.routes.js";
import { mutabaahRoutes } from "./modules/mutabaah/mutabaah.routes.js";
import { teachersRoutes } from "./modules/teachers/teachers.routes.js";
import { financeRoutes } from "./modules/finance/finance.routes.js";

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 5,
    },
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
  await app.register(attendanceRoutes, { prefix: "/api/v1/attendance" });
  await app.register(gradesRoutes, { prefix: "/api/v1/grades" });
  await app.register(reportsRoutes, { prefix: "/api/v1/reports" });
  await app.register(ppdbRoutes, { prefix: "/api/v1/ppdb" });
  await app.register(lettersRoutes, { prefix: "/api/v1/letters" });
  await app.register(p5raRoutes, { prefix: "/api/v1/p5ra" });
  await app.register(mutabaahRoutes, { prefix: "/api/v1/mutabaah" });
  await app.register(teachersRoutes, { prefix: "/api/v1/teachers" });
  await app.register(financeRoutes, { prefix: "/api/v1/finance" });

  return app;
}
