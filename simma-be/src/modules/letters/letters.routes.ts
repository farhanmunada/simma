import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { LettersController } from "./letters.controller.js";

export const lettersRoutes: FastifyPluginAsync = async (app) => {
  const controller = new LettersController();

  // 1. Public Verification Route (Validasi QR / Link PMA 12/2024)
  app.get("/verify/:hash", controller.verifyPublicLetter);

  // 2. Auth Guards
  const readAuthGuard = {
    preHandler: [
      authenticate,
      requireRoles(
        "super_admin",
        "admin_tu",
        "kepala_madrasah",
        "waka_kesiswaan",
        "waka_kurikulum",
        "guru"
      ),
    ],
  };

  const tuOrKamadGuard = {
    preHandler: [
      authenticate,
      requireRoles("super_admin", "admin_tu", "kepala_madrasah"),
    ],
  };

  const kamadOnlyGuard = {
    preHandler: [
      authenticate,
      requireRoles("super_admin", "kepala_madrasah"),
    ],
  };

  // 3. Overview & Klasifikasi
  app.get("/stats", readAuthGuard, controller.getStats);
  app.get("/classifications", readAuthGuard, controller.getClassifications);
  app.post("/classifications", tuOrKamadGuard, controller.createClassification);

  // 4. Agenda Surat Masuk (F-TU-01)
  app.get("/incoming", readAuthGuard, controller.getIncomingLetters);
  app.get("/incoming/:id", readAuthGuard, controller.getIncomingLetterById);
  app.post("/incoming", tuOrKamadGuard, controller.createIncomingLetter);
  app.patch("/incoming/:id/status", tuOrKamadGuard, controller.updateIncomingLetterStatus);

  // 5. Lembar Disposisi Elektronik Kamad (F-TU-02)
  app.get("/dispositions", readAuthGuard, controller.getDispositions);
  app.post("/dispositions", kamadOnlyGuard, controller.createDisposition);
  app.patch("/dispositions/:id/status", readAuthGuard, controller.updateDispositionStatus);

  // 6. Penomoran Otomatis Kemenag & Surat Keluar (F-TU-03 s/d F-TU-05, F-TU-10)
  app.get("/outgoing", readAuthGuard, controller.getOutgoingLetters);
  app.get("/outgoing/:id", readAuthGuard, controller.getOutgoingLetterById);
  app.post("/outgoing", tuOrKamadGuard, controller.createOutgoingLetter);
  app.get("/outgoing/:id/pdf", readAuthGuard, controller.downloadOutgoingLetterPdf);

  // 7. Otomatisasi Generator Naskah Dinas Resmi (F-TU-06 s/d F-TU-09)
  app.post("/generate/student-active", tuOrKamadGuard, controller.generateStudentActive);
  app.post("/generate/student-behavior", tuOrKamadGuard, controller.generateStudentBehavior);
  app.post("/generate/teacher-duty", tuOrKamadGuard, controller.generateTeacherDuty);
  app.post("/generate/parent-invitation", tuOrKamadGuard, controller.generateParentInvitation);

  // 8. Buku Ekspedisi Pengiriman Surat (F-TU-11)
  app.get("/expeditions", readAuthGuard, controller.getExpeditions);
  app.post("/expeditions", tuOrKamadGuard, controller.createExpedition);
  app.patch("/expeditions/:id", tuOrKamadGuard, controller.updateExpeditionStatus);
};
