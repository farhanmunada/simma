import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { tahfidzController } from "./tahfidz.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "guru_tahfidz",
  "wali_kelas",
  "guru_mapel",
  "admin_tu",
];

const writeRoles: Role[] = ["super_admin", "guru_tahfidz"];

export const tahfidzRoutes: FastifyPluginAsync = async (app) => {
  // Global auth for all tahfidz endpoints
  app.addHook("preHandler", authenticate);

  // --- Tasmi' Exams (Register specific subpaths first) ---
  app.get("/tasmi", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getTasmiExams);
  app.post("/tasmi", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.createTasmiExam);
  app.get("/tasmi/:id", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getTasmiExamById);
  app.patch("/tasmi/:id", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.updateTasmiExam);
  app.delete("/tasmi/:id", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.deleteTasmiExam);

  // --- Student History & Progress ---
  app.get("/student/:studentId", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getStudentHistory);
  app.get("/student/:studentId/progress", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getStudentProgress);

  // --- Tahfidz Records (Daily memorization & review) ---
  app.get("/", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getRecords);
  app.post("/", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.createRecord);
  app.get("/:id", { preHandler: [requireRoles(...readRoles)] }, tahfidzController.getRecordById);
  app.patch("/:id", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.updateRecord);
  app.delete("/:id", { preHandler: [requireRoles(...writeRoles)] }, tahfidzController.deleteRecord);
};
