import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { teachersController } from "./teachers.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "admin_tu",
  "guru",
  "guru_mapel",
  "wali_kelas",
];

const writeRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "admin_tu",
];

const workloadRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "admin_tu",
];

const updateSelfOrAdminRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "admin_tu",
  "guru",
  "guru_mapel",
  "wali_kelas",
];

export const teachersRoutes: FastifyPluginAsync = async (app) => {
  // Global auth
  app.addHook("preHandler", authenticate);

  // GTK Directory & Search (F-GTK-01)
  app.get("/", { preHandler: [requireRoles(...readRoles)] }, teachersController.getTeachers);
  app.post("/", { preHandler: [requireRoles(...writeRoles)] }, teachersController.createTeacher);

  // Statistics & Export (F-GTK-05, F-GTK-07)
  app.get("/stats", { preHandler: [requireRoles(...readRoles)] }, teachersController.getStats);
  app.get("/export/emis", { preHandler: [requireRoles(...readRoles)] }, teachersController.getEmisExport);

  // Workloads & 24 JTM Monitoring (F-GTK-04)
  app.get("/workloads", { preHandler: [requireRoles(...readRoles)] }, teachersController.getWorkloads);
  app.post("/workload", { preHandler: [requireRoles(...workloadRoles)] }, teachersController.upsertWorkload);

  // GTK Detail & Updates
  app.get("/:id", { preHandler: [requireRoles(...readRoles)] }, teachersController.getTeacherById);
  app.patch("/:id", { preHandler: [requireRoles(...updateSelfOrAdminRoles)] }, teachersController.updateTeacher);
  app.delete("/:id", { preHandler: [requireRoles(...writeRoles)] }, teachersController.deleteTeacher);

  // Educations (F-GTK-03)
  app.post("/:id/educations", { preHandler: [requireRoles(...updateSelfOrAdminRoles)] }, teachersController.addEducation);
  app.delete("/:id/educations/:eduId", { preHandler: [requireRoles(...writeRoles)] }, teachersController.deleteEducation);

  // Ranks & KGB (F-GTK-03, F-GTK-05)
  app.post("/:id/ranks", { preHandler: [requireRoles(...writeRoles)] }, teachersController.addRank);
  app.delete("/:id/ranks/:rankId", { preHandler: [requireRoles(...writeRoles)] }, teachersController.deleteRank);

  // Digital Documents (F-GTK-06)
  app.post("/:id/documents", { preHandler: [requireRoles(...updateSelfOrAdminRoles)] }, teachersController.addDocument);
  app.delete("/:id/documents/:docId", { preHandler: [requireRoles(...writeRoles)] }, teachersController.deleteDocument);
};
