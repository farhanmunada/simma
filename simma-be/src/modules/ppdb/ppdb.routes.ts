import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { PpdbController } from "./ppdb.controller.js";

export const ppdbRoutes: FastifyPluginAsync = async (app) => {
  const controller = new PpdbController();

  const readAuthGuard = {
    preHandler: [
      authenticate,
      requireRoles(
        "super_admin",
        "admin_tu",
        "kepala_madrasah",
        "waka_kesiswaan",
        "waka_kurikulum"
      ),
    ],
  };

  const writeAuthGuard = {
    preHandler: [
      authenticate,
      requireRoles("super_admin", "admin_tu", "waka_kesiswaan"),
    ],
  };

  // 1. Public Routes (Calon Siswa / Wali / Publik)
  app.post("/register", controller.register);
  app.post("/", controller.register);
  app.get("/check-status", controller.checkStatus);
  app.get("/public-info", controller.getPublicInfo);

  // 2. Internal Staff Routes (Panitia PPDB & TU)
  app.get("/stats", readAuthGuard, controller.getStats);
  app.get("/applicants", readAuthGuard, controller.getApplicants);
  app.get("/applicants/:id", readAuthGuard, controller.getApplicantById);
  app.patch("/applicants/:id/status", writeAuthGuard, controller.updateStatus);
  app.post("/applicants/:id/enroll", writeAuthGuard, controller.enroll);
  app.delete("/applicants/:id", writeAuthGuard, controller.delete);
};
