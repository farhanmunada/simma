import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { financeController } from "./finance.controller.js";

const financeReadRoles: Role[] = [
  "super_admin",
  "kepala_madrasah",
  "bendahara",
  "admin_tu",
  "waka_kesiswaan",
  "waka_kurikulum",
  "wali_kelas",
];

const cashierRoles: Role[] = [
  "super_admin",
  "bendahara",
  "admin_tu",
];

const financeAdminRoles: Role[] = [
  "super_admin",
  "bendahara",
  "kepala_madrasah",
];

export const financeRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);

  // Pos Biaya / Fee Items (F-KEU-01)
  app.get("/fee-items", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getFeeItems);
  app.post("/fee-items", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.createFeeItem);
  app.get("/fee-items/:id", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getFeeItemById);
  app.put("/fee-items/:id", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.updateFeeItem);
  app.delete("/fee-items/:id", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.deleteFeeItem);

  // Tagihan Siswa / Student Invoices (F-KEU-02)
  app.get("/invoices", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getInvoices);
  app.get("/invoices/:id", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getInvoiceById);
  app.post("/invoices/generate", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.generateInvoices);

  // Kasir POS / Loket Pembayaran (F-KEU-03, F-KEU-04)
  app.get("/cashier/search", { preHandler: [requireRoles(...cashierRoles)] }, financeController.searchCashierStudents);
  app.get("/cashier/student/:studentId", { preHandler: [requireRoles(...cashierRoles)] }, financeController.getStudentBillingProfile);
  app.post("/cashier/pay", { preHandler: [requireRoles(...cashierRoles)] }, financeController.processPayment);
  app.post("/cashier/transactions/:id/void", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.voidPayment);
  app.get("/cashier/transactions/:id", { preHandler: [requireRoles(...cashierRoles)] }, financeController.getTransactionReceipt);
  app.get("/cashier/transactions/:id/receipt-pdf", { preHandler: [requireRoles(...cashierRoles)] }, financeController.downloadReceiptPdf);

  // Dispensasi Tagihan (F-KEU-05)
  app.get("/dispensations", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getDispensations);
  app.post("/dispensations", { preHandler: [requireRoles(...cashierRoles)] }, financeController.createDispensation);
  app.patch("/dispensations/:id/status", { preHandler: [requireRoles(...financeAdminRoles)] }, financeController.updateDispensationStatus);

  // Laporan Keuangan (F-KEU-06)
  app.get("/reports/cashflow", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getCashflowReport);
  app.get("/reports/arrears", { preHandler: [requireRoles(...financeReadRoles)] }, financeController.getArrearsReport);
};
