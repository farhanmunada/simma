import { z } from "zod";
export {
  createTransferInSchema,
  createTransferOutSchema,
  updateClearanceItemSchema,
  approveTransferOutSchema,
  singleGraduationSchema,
  batchGraduationSchema,
  filterTransferSchema,
  filterGraduationSchema,
} from "@simma/shared";
export type {
  CreateTransferInInput,
  CreateTransferOutInput,
  UpdateClearanceItemInput,
  ApproveTransferOutInput,
  SingleGraduationInput,
  BatchGraduationInput,
  FilterTransferInput,
  FilterGraduationInput,
  ClearanceDimension,
} from "@simma/shared";

export const TransferIdParamSchema = z.object({
  id: z.string().uuid("ID mutasi tidak valid"),
});

export const StudentIdParamSchema = z.object({
  id: z.string().uuid("ID siswa tidak valid"),
});

export const ClearanceDimensionParamSchema = z.object({
  id: z.string().uuid("ID mutasi tidak valid"),
  dimension: z.enum(["library", "finance", "discipline"]),
});

export const VerifyCodeParamSchema = z.object({
  code: z.string().min(6, "Kode verifikasi tidak valid"),
});
