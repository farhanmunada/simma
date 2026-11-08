import { z } from "zod";

export const PpdbMajorEnum = z.enum(["MIPA", "IPS", "Keagamaan", "Umum"]);
export type PpdbMajor = z.infer<typeof PpdbMajorEnum>;

export const PpdbStatusEnum = z.enum([
  "draft",
  "submitted",
  "verified",
  "accepted",
  "rejected",
  "enrolled",
]);
export type PpdbStatus = z.infer<typeof PpdbStatusEnum>;

export const PpdbSchoolTypeEnum = z.enum([
  "MTs",
  "SMP",
  "Pesantren",
  "Lainnya",
]);
export type PpdbSchoolType = z.infer<typeof PpdbSchoolTypeEnum>;

// Public Registration Form Schema
export const RegisterApplicantSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(255),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
  nisn: z
    .string()
    .max(20, "NISN maksimal 20 digit")
    .optional()
    .nullable(),
  birthPlace: z.string().min(2, "Tempat lahir minimal 2 karakter").max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
  gender: z.enum(["L", "P"], {
    errorMap: () => ({ message: "Jenis kelamin harus L (Laki-laki) atau P (Perempuan)" }),
  }),
  religion: z.string().default("Islam"),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  previousSchoolType: PpdbSchoolTypeEnum.default("MTs"),
  previousSchoolName: z
    .string()
    .min(2, "Nama sekolah asal minimal 2 karakter")
    .max(255),
  npsnOrigin: z.string().max(20).optional().nullable(),
  fatherName: z.string().max(255).optional().nullable(),
  fatherPhone: z.string().max(20).optional().nullable(),
  motherName: z.string().min(2, "Nama ibu kandung wajib diisi").max(255),
  motherPhone: z.string().max(20).optional().nullable(),
  guardianName: z.string().max(255).optional().nullable(),
  chosenMajor: PpdbMajorEnum.default("MIPA"),
  documents: z.record(z.unknown()).optional().default({}),
});

export type RegisterApplicantInput = z.infer<typeof RegisterApplicantSchema>;

// Admin Status Update Schema
export const UpdateApplicantStatusSchema = z.object({
  status: PpdbStatusEnum,
  notes: z.string().max(500).optional().nullable(),
});

export type UpdateApplicantStatusInput = z.infer<typeof UpdateApplicantStatusSchema>;

// Query Filters
export const ApplicantQuerySchema = z.object({
  status: PpdbStatusEnum.optional(),
  major: PpdbMajorEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ApplicantQueryParams = z.infer<typeof ApplicantQuerySchema>;

// Status Check (Public)
export const CheckStatusQuerySchema = z.object({
  registrationNumber: z.string().min(1, "Nomor pendaftaran wajib diisi"),
  nikOrNisn: z.string().min(4, "NIK atau NISN minimal 4 karakter"),
});

export type CheckStatusQueryParams = z.infer<typeof CheckStatusQuerySchema>;
