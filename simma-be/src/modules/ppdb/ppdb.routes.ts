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

  // 1. Candidate Portal Routes (Autentikasi & Pengisian Mandiri Calon Siswa)
  const candidateGuard = {
    preHandler: [authenticate, requireRoles("calon_siswa")],
  };

  app.post("/portal/register", controller.registerAccount);
  app.post("/portal/login", controller.loginCalonSiswa);
  app.get("/portal/me", candidateGuard, controller.getMyApplication);
  app.put("/portal/me", candidateGuard, controller.updateMyApplication);
  app.post("/portal/me/finalize", candidateGuard, controller.finalizeMyApplication);
  app.get("/portal/me/card/pdf", candidateGuard, controller.downloadMyCardPdf);
  app.post("/portal/me/documents", candidateGuard, controller.uploadDocument);
  app.delete("/portal/me/documents/:id", candidateGuard, controller.deleteDocument);

  // 2. Protected Document File Streaming (Calon Siswa & Staf Panitia)
  app.get("/documents/:id/file", { preHandler: [authenticate] }, controller.streamDocument);

  // 3. Public Routes (Calon Siswa / Wali / Publik)
  app.post("/register", controller.register);
  app.post("/", controller.register);
  app.get("/check-status", controller.checkStatus);
  app.get("/public-info", controller.getPublicInfo);

  // 4. Internal Staff Routes (Panitia PPDB & TU)
  app.get("/stats", readAuthGuard, controller.getStats);
  app.get("/applicants", readAuthGuard, controller.getApplicants);
  app.get("/applicants/:id", readAuthGuard, controller.getApplicantById);
  app.get("/applicants/:id/card/pdf", readAuthGuard, controller.downloadApplicantCardPdf);
  app.patch("/documents/:id/verify", writeAuthGuard, controller.verifyDocument);
  app.patch("/applicants/:id/status", writeAuthGuard, controller.updateStatus);
  app.post("/applicants/:id/enroll", writeAuthGuard, controller.enroll);
  app.delete("/applicants/:id", writeAuthGuard, controller.delete);
};
