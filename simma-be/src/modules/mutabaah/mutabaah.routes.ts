import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { mutabaahController } from "./mutabaah.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "wali_kelas",
  "guru",
  "guru_tahfidz",
  "admin_tu",
];

const writeRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "wali_kelas",
  "guru",
];

const configRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "waka_kurikulum",
];

export const mutabaahRoutes: FastifyPluginAsync = async (app) => {
  // Global auth
  app.addHook("preHandler", authenticate);

  // --- Activities / Katalog Amalan ---
  app.get("/activities", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getActivities);
  app.post("/activities", { preHandler: [requireRoles(...configRoles)] }, mutabaahController.createActivity);
  app.get("/activities/:id", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getActivityById);
  app.patch("/activities/:id", { preHandler: [requireRoles(...configRoles)] }, mutabaahController.updateActivity);
  app.delete("/activities/:id", { preHandler: [requireRoles(...configRoles)] }, mutabaahController.deleteActivity);

  // --- Daily Checklist (F-MBY-01) ---
  app.get("/checklist", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getDailyChecklist);
  app.post("/checklist", { preHandler: [requireRoles(...writeRoles)] }, mutabaahController.saveDailyChecklist);

  // --- Uzur Syar'i (F-MBY-04) ---
  app.get("/uzur", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getUzurRecords);
  app.post("/uzur", { preHandler: [requireRoles(...writeRoles)] }, mutabaahController.createUzurRecord);
  app.delete("/uzur/:id", { preHandler: [requireRoles(...writeRoles)] }, mutabaahController.deleteUzurRecord);

  // --- Rekap Kepatuhan & Early Warning (F-MBY-03, F-MBY-05) ---
  app.get("/compliance", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getComplianceRecap);
  app.get("/early-warnings", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.getEarlyWarnings);

  // --- Rapor Mutaba'ah PDF (F-MBY-06) ---
  app.get("/report/:studentId/pdf", { preHandler: [requireRoles(...readRoles)] }, mutabaahController.downloadStudentReportPdf);
};
