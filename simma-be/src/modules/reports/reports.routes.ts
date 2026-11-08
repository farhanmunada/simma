import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { reportsController } from "./reports.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "admin_tu",
  "kepala_madrasah",
  "waka_kurikulum",
  "wali_kelas",
  "guru_mapel",
  "guru",
];

const writeNotesRoles: Role[] = [
  "super_admin",
  "wali_kelas",
];

export const reportsRoutes: FastifyPluginAsync = async (app) => {
  // Global auth hook for reports module
  app.addHook("preHandler", authenticate);

  // GET /api/v1/reports/student/:studentId/semester/:semesterId
  app.get(
    "/student/:studentId/semester/:semesterId",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    reportsController.getStudentReportCard,
  );

  // GET /api/v1/reports/classroom/:classroomId/semester/:semesterId/legger
  app.get(
    "/classroom/:classroomId/semester/:semesterId/legger",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    reportsController.getClassroomLegger,
  );

  // GET /api/v1/reports/student/:studentId/semester/:semesterId/pdf
  app.get(
    "/student/:studentId/semester/:semesterId/pdf",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    reportsController.getStudentReportPdf,
  );

  // POST /api/v1/reports/student/:studentId/notes
  app.post(
    "/student/:studentId/notes",
    { preHandler: [authenticate, requireRoles(...writeNotesRoles)] },
    reportsController.saveStudentNotes,
  );
};
