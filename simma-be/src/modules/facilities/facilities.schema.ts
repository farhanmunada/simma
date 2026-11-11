import { z } from "zod";
export {
  CreateFacilityAssetSchema,
  UpdateFacilityAssetSchema,
  QueryFacilityAssetsSchema,
  CreateFacilityLoanSchema,
  ReturnFacilityLoanSchema,
  CreateFacilityMaintenanceTicketSchema,
  UpdateFacilityMaintenanceTicketSchema,
  FacilityAssetSchema,
  FacilityLoanSchema,
  FacilityMaintenanceTicketSchema,
} from "@simma/shared";

export const FacilityIdParamSchema = z.object({
  id: z.string().uuid("ID tidak valid, format UUID diperlukan"),
});
export type FacilityIdParam = z.infer<typeof FacilityIdParamSchema>;

export const FacilityTokenParamSchema = z.object({
  token: z.string().min(1, "Token QR wajib diisi"),
});
export type FacilityTokenParam = z.infer<typeof FacilityTokenParamSchema>;

export const QueryLoansSchema = z.object({
  assetId: z.string().uuid().optional(),
  status: z.enum(["DIPINJAM", "DIKEMBALIKAN", "TERLAMBAT"]).optional(),
  borrowerType: z.enum(["SISWA", "GTK", "EKSTERNAL"]).optional(),
});
export type QueryLoansInput = z.infer<typeof QueryLoansSchema>;

export const QueryMaintenanceTicketsSchema = z.object({
  assetId: z.string().uuid().optional(),
  status: z.enum(["MENUNGGU", "PROSES", "SELESAI", "DITOLAK"]).optional(),
  priority: z.enum(["RENDAH", "SEDANG", "TINGGI", "DARURAT"]).optional(),
});
export type QueryMaintenanceTicketsInput = z.infer<
  typeof QueryMaintenanceTicketsSchema
>;
