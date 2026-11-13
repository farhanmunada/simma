import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { disciplineController } from "./discipline.controller.js";

const allStaffRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "waka_kurikulum",
  "guru_bk",
  "wali_kelas",
  "guru",
  "guru_mapel",
  "admin_tu",
];

const rulesManageRoles: Role[] = [
  "super_admin",
  "waka_kesiswaan",
  "guru_bk",
  "admin_tu",
];

const infractionRecordRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "guru_bk",
  "wali_kelas",
  "guru",
  "guru_mapel",
];

const approvalRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
];

const counselingRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "guru_bk",
];

const summonManageRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "guru_bk",
];

export const disciplineRoutes: FastifyPluginAsync = async (app) => {
  // Global auth
  app.addHook("preHandler", authenticate);

  // --- Rules Catalog ---
  app.get("/rules", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.getRules);
  app.post("/rules", { preHandler: [requireRoles(...rulesManageRoles)] }, disciplineController.createRule);
  app.patch("/rules/:id", { preHandler: [requireRoles(...rulesManageRoles)] }, disciplineController.updateRule);
  app.delete("/rules/:id", { preHandler: [requireRoles(...rulesManageRoles)] }, disciplineController.deleteRule);

  // --- Infractions & Merits ---
  app.get("/infractions", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.getInfractions);
  app.post("/infractions", { preHandler: [requireRoles(...infractionRecordRoles)] }, disciplineController.createInfraction);
  app.patch("/infractions/:id/approval", { preHandler: [requireRoles(...approvalRoles)] }, disciplineController.updateApproval);
  app.delete("/infractions/:id", { preHandler: [requireRoles(...approvalRoles)] }, disciplineController.deleteInfraction);

  // --- Student Profiles & Leaderboard ---
  app.get("/students/:studentId", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.getStudentProfile);
  app.get("/leaderboard", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.getLeaderboard);

  // --- Counseling (Rahasia BK) ---
  app.get("/counseling", { preHandler: [requireRoles(...counselingRoles)] }, disciplineController.getCounselingSessions);
  app.post("/counseling", { preHandler: [requireRoles(...counselingRoles)] }, disciplineController.createCounselingSession);
  app.patch("/counseling/:id", { preHandler: [requireRoles(...counselingRoles)] }, disciplineController.updateCounselingSession);
  app.delete("/counseling/:id", { preHandler: [requireRoles(...counselingRoles)] }, disciplineController.deleteCounselingSession);

  // --- Parent Summons ---
  app.get("/summons", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.getParentSummons);
  app.post("/summons", { preHandler: [requireRoles(...summonManageRoles)] }, disciplineController.createParentSummon);
  app.patch("/summons/:id", { preHandler: [requireRoles(...summonManageRoles)] }, disciplineController.updateParentSummon);
  app.get("/summons/:id/pdf", { preHandler: [requireRoles(...allStaffRoles)] }, disciplineController.exportSummonPdf);
};
