import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { teachersController } from "./teachers.controller.js";

// Kebijakan ketat: seluruh modul Kepegawaian GTK, kode akun 4 digit,
// reset password, dan enrolment tugas hanya dapat diakses Operator / Super Admin.
const operatorOnlyRoles: Role[] = ["super_admin", "operator"];

export const teachersRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireRoles(...operatorOnlyRoles));

  // Positions & Code Generator
  app.get("/positions", teachersController.getPositions);
  app.get("/next-code", teachersController.getNextCode);

  // GTK Directory & Search (F-GTK-01)
  app.get("/", teachersController.getTeachers);
  app.post("/", teachersController.createTeacher);

  // Statistics & Export (F-GTK-05, F-GTK-07)
  app.get("/stats", teachersController.getStats);
  app.get("/export/emis", teachersController.getEmisExport);

  // Workloads & 24 JTM Monitoring (F-GTK-04)
  app.get("/workloads", teachersController.getWorkloads);
  app.post("/workload", teachersController.upsertWorkload);

  // GTK Detail, Updates & Account Reset
  app.get("/:id", teachersController.getTeacherById);
  app.patch("/:id", teachersController.updateTeacher);
  app.post("/:id/reset-password", teachersController.resetPasswordToCode);
  app.delete("/:id", teachersController.deleteTeacher);

  // Educations (F-GTK-03)
  app.post("/:id/educations", teachersController.addEducation);
  app.delete("/:id/educations/:eduId", teachersController.deleteEducation);

  // Ranks & KGB (F-GTK-03, F-GTK-05)
  app.post("/:id/ranks", teachersController.addRank);
  app.delete("/:id/ranks/:rankId", teachersController.deleteRank);

  // Digital Documents (F-GTK-06)
  app.post("/:id/documents", teachersController.addDocument);
  app.delete("/:id/documents/:docId", teachersController.deleteDocument);
};
