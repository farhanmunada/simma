import { z } from "zod";
import {
  FEE_TYPES,
  FEE_CATEGORIES,
  PAYMENT_METHODS,
  INVOICE_STATUSES,
  TRANSACTION_STATUSES,
  DISPENSATION_STATUSES,
} from "../constants.js";

// Fee Item Schemas
export const FeeItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nama pos biaya minimal 2 karakter"),
  code: z.string().min(2, "Kode pos minimal 2 karakter").toUpperCase(),
  type: z.enum(FEE_TYPES),
  category: z.enum(FEE_CATEGORIES),
  academicYearId: z.string().uuid().optional().nullable(),
  amount: z.number().int().min(0, "Nominal biaya tidak boleh negatif"),
  gradeLevel: z.number().int().min(1).max(12).optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type FeeItem = z.infer<typeof FeeItemSchema>;

export const CreateFeeItemSchema = z.object({
  name: z.string().min(2, "Nama pos biaya minimal 2 karakter"),
  code: z.string().min(2, "Kode pos minimal 2 karakter").toUpperCase(),
  type: z.enum(FEE_TYPES),
  category: z.enum(FEE_CATEGORIES),
  academicYearId: z.string().uuid().optional().nullable(),
  amount: z.number().int().min(0, "Nominal biaya tidak boleh negatif"),
  gradeLevel: z.number().int().min(1).max(12).optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
});
export type CreateFeeItemInput = z.infer<typeof CreateFeeItemSchema>;

export const UpdateFeeItemSchema = CreateFeeItemSchema.partial();
export type UpdateFeeItemInput = z.infer<typeof UpdateFeeItemSchema>;

export const QueryFeeItemSchema = z.object({
  type: z.enum(FEE_TYPES).optional(),
  category: z.enum(FEE_CATEGORIES).optional(),
  academicYearId: z.string().uuid().optional(),
  gradeLevel: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type QueryFeeItemParams = z.infer<typeof QueryFeeItemSchema>;

// Invoice Schemas
export const StudentInvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  studentId: z.string().uuid(),
  feeItemId: z.string().uuid(),
  classroomId: z.string().uuid().optional().nullable(),
  month: z.number().int().min(1).max(12).optional().nullable(),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().int().min(0),
  paidAmount: z.number().int().min(0).default(0),
  remainingAmount: z.number().int().min(0),
  status: z.enum(INVOICE_STATUSES).default("unpaid"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type StudentInvoice = z.infer<typeof StudentInvoiceSchema>;

export const GenerateInvoicesSchema = z.object({
  feeItemId: z.string().uuid("Pos biaya wajib dipilih"),
  month: z.number().int().min(1).max(12).optional().nullable(),
  year: z.number().int().min(2000).max(2100),
  classroomId: z.string().uuid().optional().nullable(),
  gradeLevel: z.number().int().min(1).max(12).optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal jatuh tempo YYYY-MM-DD").optional().nullable(),
});
export type GenerateInvoicesInput = z.infer<typeof GenerateInvoicesSchema>;

export const QueryInvoicesSchema = z.object({
  studentId: z.string().uuid().optional(),
  feeItemId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  month: z.coerce.number().int().optional(),
  year: z.coerce.number().int().optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type QueryInvoicesParams = z.infer<typeof QueryInvoicesSchema>;

// Cashier & Payment Transaction Schemas
export const PaymentItemInputSchema = z.object({
  invoiceId: z.string().uuid("ID invoice wajib diisi"),
  amount: z.number().int().min(1, "Nominal bayar minimal 1 rupiah"),
  notes: z.string().optional().nullable(),
});
export type PaymentItemInput = z.infer<typeof PaymentItemInputSchema>;

export const ProcessPaymentSchema = z.object({
  studentId: z.string().uuid("ID siswa wajib diisi"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  receivedAmount: z.number().int().min(0, "Nominal diterima tidak boleh negatif"),
  items: z.array(PaymentItemInputSchema).min(1, "Minimal pilih 1 item tagihan untuk dibayar"),
  notes: z.string().optional().nullable(),
});
export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;

export const VoidPaymentSchema = z.object({
  reason: z.string().min(5, "Alasan pembatalan minimal 5 karakter"),
});
export type VoidPaymentInput = z.infer<typeof VoidPaymentSchema>;

// Dispensation Schemas
export const CreateDispensationSchema = z.object({
  studentId: z.string().uuid("ID siswa wajib diisi"),
  reason: z.string().min(5, "Alasan permohonan dispensasi minimal 5 karakter"),
  notes: z.string().optional().nullable(),
});
export type CreateDispensationInput = z.infer<typeof CreateDispensationSchema>;

export const UpdateDispensationStatusSchema = z.object({
  status: z.enum(DISPENSATION_STATUSES),
  notes: z.string().optional().nullable(),
});
export type UpdateDispensationStatusInput = z.infer<typeof UpdateDispensationStatusSchema>;

// Cashier Suggestion & Reports Schemas
export const CashierSearchQuerySchema = z.object({
  q: z.string().min(1, "Kata kunci pencarian minimal 1 karakter"),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
export type CashierSearchQuery = z.infer<typeof CashierSearchQuerySchema>;

export const CashflowReportQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD").optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});
export type CashflowReportQuery = z.infer<typeof CashflowReportQuerySchema>;

export const ArrearsReportQuerySchema = z.object({
  classroomId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  severity: z.enum(["all", "warning_1_2", "critical_3_plus"]).optional(),
});
export type ArrearsReportQuery = z.infer<typeof ArrearsReportQuerySchema>;
