import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { emisController } from "./emis.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "admin_tu",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
];

const exportRoles: Role[] = [
  "super_admin",
  "admin_tu",
  "kepala_madrasah",
];

const bapCreateRoles: Role[] = [
  "super_admin",
  "admin_tu",
];

const bapApproveRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
];

export const emisRoutes: FastifyPluginAsync = async (app) => {
  // Global auth guard for EMIS endpoints
  app.addHook("preHandler", authenticate);

  // 1. Audit & Readiness
  app.get("/audit", { preHandler: [requireRoles(...readRoles)] }, emisController.getAuditReadiness);

  // 2. Export Endpoints
  app.get("/export/students", { preHandler: [requireRoles(...exportRoles)] }, emisController.exportStudents);
  app.get("/export/teachers", { preHandler: [requireRoles(...exportRoles)] }, emisController.exportTeachers);
  app.get("/export/classrooms", { preHandler: [requireRoles(...exportRoles)] }, emisController.exportClassrooms);
  app.get("/export/institution", { preHandler: [requireRoles(...exportRoles)] }, emisController.exportInstitution);
  app.get("/export/bundle", { preHandler: [requireRoles(...exportRoles)] }, emisController.exportBundle);

  // 3. Berita Acara Pendataan (BAP)
  app.get("/bap", { preHandler: [requireRoles(...readRoles)] }, emisController.listBaps);
  app.post("/bap", { preHandler: [requireRoles(...bapCreateRoles)] }, emisController.createBapDraft);
  app.patch("/bap/:id/approve", { preHandler: [requireRoles(...bapApproveRoles)] }, emisController.approveBap);
  app.get("/bap/:id/pdf", { preHandler: [requireRoles(...readRoles)] }, emisController.downloadBapPdf);
};
