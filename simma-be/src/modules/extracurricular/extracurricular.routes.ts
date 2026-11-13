import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { extracurricularController } from "./extracurricular.controller.js";

const allStaffRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "waka_kurikulum",
  "wali_kelas",
  "pembina_ekskul",
  "guru",
  "guru_mapel",
  "admin_tu",
];

const manageRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "pembina_ekskul",
  "admin_tu",
];

const gradingRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "pembina_ekskul",
  "wali_kelas",
];

export const extracurricularRoutes: FastifyPluginAsync = async (app) => {
  // Global auth
  app.addHook("preHandler", authenticate);

  // --- Stats ---
  app.get("/stats", { preHandler: [requireRoles(...allStaffRoles)] }, extracurricularController.getStats);

  // --- Master Extracurricular ---
  app.get("/", { preHandler: [requireRoles(...allStaffRoles)] }, extracurricularController.list);
  app.get("/:id", { preHandler: [requireRoles(...allStaffRoles)] }, extracurricularController.getById);
  app.post("/", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.create);
  app.patch("/:id", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.update);
  app.delete("/:id", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.delete);

  // --- Members ---
  app.get("/members", { preHandler: [requireRoles(...allStaffRoles)] }, extracurricularController.listMembers);
  app.post("/members", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.registerMember);
  app.patch("/members/:id", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.updateMember);
  app.delete("/members/:id", { preHandler: [requireRoles(...manageRoles)] }, extracurricularController.deleteMember);

  // --- Grades & RDM ---
  app.get("/grades", { preHandler: [requireRoles(...gradingRoles)] }, extracurricularController.listGrades);
  app.post("/grades", { preHandler: [requireRoles(...gradingRoles)] }, extracurricularController.upsertGrade);
  app.post("/grades/batch", { preHandler: [requireRoles(...gradingRoles)] }, extracurricularController.batchUpsertGrades);
  app.get("/grades/student/:studentId", { preHandler: [requireRoles(...allStaffRoles)] }, extracurricularController.getStudentGradesForRdm);
};
