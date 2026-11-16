import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { gradesController } from "./grades.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "guru",
  "guru_mapel",
  "wali_kelas",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "admin_tu",
];

const writeRoles: Role[] = [
  "super_admin",
  "guru",
  "guru_mapel",
  "wali_kelas",
];

export const gradesRoutes: FastifyPluginAsync = async (app) => {
  // Global auth for all grades endpoints
  app.addHook("preHandler", authenticate);

  // --- Assessments ---
  app.get(
    "/assessments",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getAssessments,
  );
  app.post(
    "/assessments",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.createAssessment,
  );
  app.get(
    "/assessments/:id",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getAssessmentById,
  );
  app.patch(
    "/assessments/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.updateAssessment,
  );
  app.delete(
    "/assessments/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.deleteAssessment,
  );
  app.get(
    "/assessments/:assessmentId/grades",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getGradesByAssessmentId,
  );

  // --- Semester Grades ---
  app.get(
    "/semester",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getSemesterGrades,
  );
  app.post(
    "/semester",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.createOrUpsertSemesterGrade,
  );
  app.post(
    "/semester/calculate",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.calculateSemesterGrades,
  );
  app.get(
    "/semester/:id",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getSemesterGradeById,
  );
  app.patch(
    "/semester/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.updateSemesterGrade,
  );
  app.delete(
    "/semester/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.deleteSemesterGrade,
  );

  // --- Student Grades ---
  app.get(
    "/",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getStudentGrades,
  );
  app.post(
    "/",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.createStudentGrade,
  );
  app.patch(
    "/",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.batchUpsertGrades,
  );
  app.post(
    "/batch",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.batchUpsertGrades,
  );
  app.patch(
    "/batch",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.batchUpsertGrades,
  );
  app.get(
    "/:id",
    { preHandler: [requireRoles(...readRoles)] },
    gradesController.getStudentGradeById,
  );
  app.patch(
    "/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.updateStudentGrade,
  );
  app.delete(
    "/:id",
    { preHandler: [requireRoles(...writeRoles)] },
    gradesController.deleteStudentGrade,
  );
};
