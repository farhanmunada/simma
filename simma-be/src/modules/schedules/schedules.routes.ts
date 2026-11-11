import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { schedulesController } from "./schedules.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "waka_sarpras",
  "admin_tu",
  "guru",
  "guru_mapel",
  "wali_kelas",
  "guru_tahfidz",
  "pembina_ekskul",
  "bendahara",
];

const writeRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "admin_tu",
];

export const schedulesRoutes: FastifyPluginAsync = async (app) => {
  // Global auth
  app.addHook("preHandler", authenticate);

  // --- Rooms ---
  app.get("/rooms", { preHandler: [requireRoles(...readRoles)] }, schedulesController.getRooms);
  app.post("/rooms", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.createRoom);
  app.patch("/rooms/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.updateRoom);
  app.delete("/rooms/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.deleteRoom);

  // --- Time Slots ---
  app.get("/time-slots", { preHandler: [requireRoles(...readRoles)] }, schedulesController.getTimeSlots);
  app.post("/time-slots", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.createTimeSlot);
  app.post("/time-slots/batch", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.createTimeSlotsBatch);
  app.patch("/time-slots/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.updateTimeSlot);
  app.delete("/time-slots/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.deleteTimeSlot);

  // --- Timetable Matrix & PDF Export ---
  app.get("/matrix", { preHandler: [requireRoles(...readRoles)] }, schedulesController.getMatrix);
  app.get("/export/pdf", { preHandler: [requireRoles(...readRoles)] }, schedulesController.exportPdf);

  // --- Schedules Plotting & Collisions ---
  app.get("/", { preHandler: [requireRoles(...readRoles)] }, schedulesController.getSchedules);
  app.post("/check-collision", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.checkCollision);
  app.post("/", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.createPlot);
  app.post("/batch", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.batchPlot);
  app.patch("/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.updatePlot);
  app.delete("/:id", { preHandler: [requireRoles(...writeRoles)] }, schedulesController.deletePlot);
};
