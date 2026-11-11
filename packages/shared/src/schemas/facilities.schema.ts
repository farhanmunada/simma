import { z } from "zod";

export const FACILITY_CATEGORIES = [
  "ELEKTRONIK",
  "FURNITUR",
  "RUANGAN",
  "LABORATORIUM",
  "KENDARAAN",
] as const;
export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export const FACILITY_CONDITIONS = [
  "BAIK",
  "RUSAK_RINGAN",
  "RUSAK_BERAT",
] as const;
export type FacilityCondition = (typeof FACILITY_CONDITIONS)[number];

export const FACILITY_ASSET_STATUSES = [
  "TERSEDIA",
  "DIPINJAM",
  "DALAM_PERBAIKAN",
  "DIHAPUSKAN",
] as const;
export type FacilityAssetStatus = (typeof FACILITY_ASSET_STATUSES)[number];

export const FACILITY_BORROWER_TYPES = [
  "SISWA",
  "GTK",
  "EKSTERNAL",
] as const;
export type FacilityBorrowerType = (typeof FACILITY_BORROWER_TYPES)[number];

export const FACILITY_LOAN_STATUSES = [
  "DIPINJAM",
  "DIKEMBALIKAN",
  "TERLAMBAT",
] as const;
export type FacilityLoanStatus = (typeof FACILITY_LOAN_STATUSES)[number];

export const FACILITY_MAINTENANCE_PRIORITIES = [
  "RENDAH",
  "SEDANG",
  "TINGGI",
  "DARURAT",
] as const;
export type FacilityMaintenancePriority =
  (typeof FACILITY_MAINTENANCE_PRIORITIES)[number];

export const FACILITY_MAINTENANCE_STATUSES = [
  "MENUNGGU",
  "PROSES",
  "SELESAI",
  "DITOLAK",
] as const;
export type FacilityMaintenanceStatus =
  (typeof FACILITY_MAINTENANCE_STATUSES)[number];

// 1. Assets
export const FacilityAssetSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1, "Kode aset wajib diisi"),
  name: z.string().min(1, "Nama aset wajib diisi"),
  category: z.enum(FACILITY_CATEGORIES),
  condition: z.enum(FACILITY_CONDITIONS).default("BAIK"),
  location: z.string().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  sourceOfFund: z.string().nullable().optional(),
  qrCodeToken: z.string(),
  status: z.enum(FACILITY_ASSET_STATUSES).default("TERSEDIA"),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type FacilityAsset = z.infer<typeof FacilityAssetSchema>;

export const CreateFacilityAssetSchema = z.object({
  code: z.string().min(1, "Kode aset wajib diisi"),
  name: z.string().min(1, "Nama aset wajib diisi"),
  category: z.enum(FACILITY_CATEGORIES),
  condition: z.enum(FACILITY_CONDITIONS).default("BAIK").optional(),
  location: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  sourceOfFund: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(FACILITY_ASSET_STATUSES).default("TERSEDIA").optional(),
});
export type CreateFacilityAssetInput = z.infer<typeof CreateFacilityAssetSchema>;

export const UpdateFacilityAssetSchema = CreateFacilityAssetSchema.partial();
export type UpdateFacilityAssetInput = z.infer<typeof UpdateFacilityAssetSchema>;

export const QueryFacilityAssetsSchema = z.object({
  search: z.string().optional(),
  category: z.enum(FACILITY_CATEGORIES).optional(),
  condition: z.enum(FACILITY_CONDITIONS).optional(),
  status: z.enum(FACILITY_ASSET_STATUSES).optional(),
  location: z.string().optional(),
});
export type QueryFacilityAssetsInput = z.infer<typeof QueryFacilityAssetsSchema>;

// 2. Loans
export const FacilityLoanSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string().uuid(),
  borrowerName: z.string().min(1, "Nama peminjam wajib diisi"),
  borrowerType: z.enum(FACILITY_BORROWER_TYPES),
  loanDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format loanDate YYYY-MM-DD"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format dueDate YYYY-MM-DD"),
  returnDate: z.string().nullable().optional(),
  status: z.enum(FACILITY_LOAN_STATUSES).default("DIPINJAM"),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type FacilityLoan = z.infer<typeof FacilityLoanSchema>;

export const CreateFacilityLoanSchema = z.object({
  assetId: z.string().uuid(),
  borrowerName: z.string().min(1, "Nama peminjam wajib diisi"),
  borrowerType: z.enum(FACILITY_BORROWER_TYPES),
  loanDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format loanDate YYYY-MM-DD"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format dueDate YYYY-MM-DD"),
  notes: z.string().optional().nullable(),
});
export type CreateFacilityLoanInput = z.infer<typeof CreateFacilityLoanSchema>;

export const ReturnFacilityLoanSchema = z.object({
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format returnDate YYYY-MM-DD").optional(),
  condition: z.enum(FACILITY_CONDITIONS).optional(),
  notes: z.string().optional().nullable(),
});
export type ReturnFacilityLoanInput = z.infer<typeof ReturnFacilityLoanSchema>;

// 3. Maintenance Tickets
export const FacilityMaintenanceTicketSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string().uuid(),
  reporterId: z.string().uuid().nullable().optional(),
  reporterName: z.string().nullable().optional(),
  title: z.string().min(1, "Judul tiket wajib diisi"),
  description: z.string().min(1, "Deskripsi kerusakan wajib diisi"),
  priority: z.enum(FACILITY_MAINTENANCE_PRIORITIES).default("SEDANG"),
  status: z.enum(FACILITY_MAINTENANCE_STATUSES).default("MENUNGGU"),
  cost: z.number().int().nonnegative().default(0),
  completedAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type FacilityMaintenanceTicket = z.infer<
  typeof FacilityMaintenanceTicketSchema
>;

export const CreateFacilityMaintenanceTicketSchema = z.object({
  assetId: z.string().uuid(),
  reporterName: z.string().optional().nullable(),
  title: z.string().min(1, "Judul tiket wajib diisi"),
  description: z.string().min(1, "Deskripsi kerusakan wajib diisi"),
  priority: z.enum(FACILITY_MAINTENANCE_PRIORITIES).default("SEDANG").optional(),
  cost: z.number().int().nonnegative().default(0).optional(),
});
export type CreateFacilityMaintenanceTicketInput = z.infer<
  typeof CreateFacilityMaintenanceTicketSchema
>;

export const UpdateFacilityMaintenanceTicketSchema = z.object({
  status: z.enum(FACILITY_MAINTENANCE_STATUSES).optional(),
  priority: z.enum(FACILITY_MAINTENANCE_PRIORITIES).optional(),
  cost: z.number().int().nonnegative().optional(),
  notes: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
});
export type UpdateFacilityMaintenanceTicketInput = z.infer<
  typeof UpdateFacilityMaintenanceTicketSchema
>;
