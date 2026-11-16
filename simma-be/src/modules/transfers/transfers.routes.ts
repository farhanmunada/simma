import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { transfersController } from "./transfers.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "admin_tu",
  "wali_kelas",
  "bendahara",
];

const writeRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "admin_tu",
];

const clearanceRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kesiswaan",
  "admin_tu",
  "bendahara",
];

const approveRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
];

const graduationRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "admin_tu",
];

export const transfersRoutes: FastifyPluginAsync = async (app) => {
  // Public verification endpoint
  app.get("/verify/:code", transfersController.verifyTransfer);

  // Protected endpoints
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authenticate);

    // Statistics
    protectedApp.get("/stats", { preHandler: [requireRoles(...readRoles)] }, transfersController.getStats);

    // Transfers CRUD
    protectedApp.get("/", { preHandler: [requireRoles(...readRoles)] }, transfersController.getTransfers);
    protectedApp.get("/:id", { preHandler: [requireRoles(...readRoles)] }, transfersController.getTransferById);
    protectedApp.post("/in", { preHandler: [requireRoles(...writeRoles)] }, transfersController.createTransferIn);
    protectedApp.post("/out", { preHandler: [requireRoles(...writeRoles)] }, transfersController.createTransferOut);

    // Clearance and Approval
    protectedApp.patch("/:id/clearance/:dimension", { preHandler: [requireRoles(...clearanceRoles)] }, transfersController.updateClearance);
    protectedApp.post("/:id/approve", { preHandler: [requireRoles(...approveRoles)] }, transfersController.approveTransfer);
    protectedApp.get("/:id/pdf", { preHandler: [requireRoles(...readRoles)] }, transfersController.downloadPdf);

    // Graduations
    protectedApp.get("/graduations/list", { preHandler: [requireRoles(...graduationRoles)] }, transfersController.getGraduations);
    protectedApp.post("/graduations/batch", { preHandler: [requireRoles(...graduationRoles)] }, transfersController.processGraduation);
  });
};
