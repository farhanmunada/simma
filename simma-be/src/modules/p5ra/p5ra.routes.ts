import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { p5raController } from "./p5ra.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "admin_tu",
  "kepala_madrasah",
  "waka_kurikulum",
  "wali_kelas",
  "guru_mapel",
  "guru",
];

const manageProjectRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "wali_kelas",
  "guru",
];

const assessRoles: Role[] = [
  "super_admin",
  "waka_kurikulum",
  "wali_kelas",
  "guru_mapel",
  "guru",
];

export const p5raRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);

  // Projects CRUD
  app.get(
    "/projects",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.listProjects,
  );

  app.get(
    "/projects/:projectId",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getProject,
  );

  app.post(
    "/projects",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.createProject,
  );

  app.patch(
    "/projects/:projectId",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.updateProject,
  );

  app.delete(
    "/projects/:projectId",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.deleteProject,
  );

  // Target Dimension & Elemen Capaian
  app.get(
    "/projects/:projectId/targets",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.listTargets,
  );

  app.post(
    "/projects/:projectId/targets",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.createTarget,
  );

  app.patch(
    "/targets/:targetId",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.updateTarget,
  );

  app.delete(
    "/targets/:targetId",
    { preHandler: [authenticate, requireRoles(...manageProjectRoles)] },
    p5raController.deleteTarget,
  );

  // Assessments Matrix & Batch Scoring
  app.get(
    "/projects/:projectId/assessments",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getAssessments,
  );

  app.post(
    "/projects/:projectId/assessments",
    { preHandler: [authenticate, requireRoles(...assessRoles)] },
    p5raController.saveBatchAssessments,
  );

  // Notes & Process
  app.get(
    "/projects/:projectId/students/:studentId/notes",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getStudentNotes,
  );

  app.put(
    "/projects/:projectId/students/:studentId/notes",
    { preHandler: [authenticate, requireRoles(...assessRoles)] },
    p5raController.saveStudentNotes,
  );

  app.post(
    "/projects/:projectId/students/:studentId/generate-notes",
    { preHandler: [authenticate, requireRoles(...assessRoles)] },
    p5raController.generateProcessNotes,
  );

  // Report & Recap
  app.get(
    "/projects/:projectId/recap",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getProjectRecap,
  );

  app.get(
    "/projects/:projectId/students/:studentId/report",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getStudentReport,
  );

  app.get(
    "/projects/:projectId/students/:studentId/report/pdf",
    { preHandler: [authenticate, requireRoles(...readRoles)] },
    p5raController.getStudentReportPdf,
  );
};
