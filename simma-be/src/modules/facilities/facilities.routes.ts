import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { facilitiesController } from "./facilities.controller.js";

const allStaffRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_sarpras",
  "admin_tu",
  "waka_kurikulum",
  "waka_kesiswaan",
  "guru_bk",
  "wali_kelas",
  "guru",
  "guru_mapel",
  "bendahara",
  "guru_tahfidz",
  "pembina_ekskul",
];

const manageRoles: Role[] = ["super_admin", "waka_sarpras", "admin_tu"];

export const facilitiesRoutes: FastifyPluginAsync = async (app) => {
  // Public QR scan endpoint (PRD F-SAR-03: audit cepat via kamera tanpa login admin)
  app.get("/scan/:token", facilitiesController.getAssetByQrToken);

  // Authenticated routes group
  app.register(async (authGroup) => {
    authGroup.addHook("preHandler", authenticate);

    // --- Statistics ---
    authGroup.get(
      "/stats",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getStats,
    );

    // --- Assets ---
    authGroup.get(
      "/assets",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getAssets,
    );
    authGroup.get(
      "/assets/:id",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getAssetById,
    );
    authGroup.post(
      "/assets",
      { preHandler: [requireRoles(...manageRoles)] },
      facilitiesController.createAsset,
    );
    authGroup.patch(
      "/assets/:id",
      { preHandler: [requireRoles(...manageRoles)] },
      facilitiesController.updateAsset,
    );
    authGroup.delete(
      "/assets/:id",
      { preHandler: [requireRoles(...manageRoles)] },
      facilitiesController.deleteAsset,
    );

    // --- Loans ---
    authGroup.get(
      "/loans",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getLoans,
    );
    authGroup.get(
      "/loans/:id",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getLoanById,
    );
    authGroup.post(
      "/loans",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.createLoan,
    );
    authGroup.post(
      "/loans/:id/return",
      { preHandler: [requireRoles(...manageRoles)] },
      facilitiesController.returnLoan,
    );

    // --- Maintenance Tickets ---
    authGroup.get(
      "/maintenance",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getTickets,
    );
    authGroup.get(
      "/maintenance/:id",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.getTicketById,
    );
    authGroup.post(
      "/maintenance",
      { preHandler: [requireRoles(...allStaffRoles)] },
      facilitiesController.createTicket,
    );
    authGroup.patch(
      "/maintenance/:id",
      { preHandler: [requireRoles(...manageRoles)] },
      facilitiesController.updateTicket,
    );
  });
};
