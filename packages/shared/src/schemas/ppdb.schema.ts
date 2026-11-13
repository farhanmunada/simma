import { z } from "zod";

export const PpdbMajorEnum = z.enum(["MIPA", "IPS", "Keagamaan", "Umum"]);
export type PpdbMajor = z.infer<typeof PpdbMajorEnum>;

export const PpdbTrackEnum = z.enum([
  "reguler",
  "prestasi",
  "afirmasi",
  "perpindahan_ortu",
]);
export type PpdbTrack = z.infer<typeof PpdbTrackEnum>;

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

export const PpdbDocumentTypeEnum = z.enum([
  "pas_foto",
  "kartu_keluarga",
  "akta_kelahiran",
  "ijazah_skl",
  "rapor",
  "prestasi_tahfidz",
  "kip_pkh",
  "sptjm",
]);
export type PpdbDocumentType = z.infer<typeof PpdbDocumentTypeEnum>;

// Calon Siswa Account Creation
export const PpdbRegisterAccountSchema = z.object({
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
  birthPlace: z.string().min(2, "Tempat lahir minimal 2 karakter").default("Kota Asal"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD").default("2008-01-01"),
  gender: z.enum(["L", "P"]).default("L"),
  motherName: z.string().min(2, "Nama ibu kandung minimal 2 karakter").default("Ibu Kandung"),
  previousSchoolType: PpdbSchoolTypeEnum.default("MTs"),
  previousSchoolName: z.string().min(2, "Asal sekolah minimal 2 karakter").default("MTs/SMP Asal"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon/WA minimal 8 digit").max(20),
  password: z.string().min(6, "Password minimal 6 karakter"),
  track: PpdbTrackEnum.default("reguler"),
  chosenMajor: PpdbMajorEnum.default("MIPA"),
});
export type PpdbRegisterAccountInput = z.infer<typeof PpdbRegisterAccountSchema>;

// Calon Siswa Login
export const PpdbLoginSchema = z.object({
  identifier: z.string().min(3, "Masukkan NIK, NISN, atau Email"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type PpdbLoginInput = z.infer<typeof PpdbLoginSchema>;

// Calon Siswa Update Application Form
export const UpdateApplicantFormSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  nik: z.string().length(16).regex(/^\d+$/).optional(),
  nisn: z.string().max(20).optional().nullable(),
  birthPlace: z.string().min(2).max(100).optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  gender: z.enum(["L", "P"]).optional().nullable(),
  religion: z.string().default("Islam").optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  track: PpdbTrackEnum.optional(),
  previousSchoolType: PpdbSchoolTypeEnum.optional(),
  previousSchoolName: z.string().max(255).optional().nullable(),
  npsnOrigin: z.string().max(20).optional().nullable(),
  fatherName: z.string().max(255).optional().nullable(),
  fatherPhone: z.string().max(20).optional().nullable(),
  fatherJob: z.string().max(100).optional().nullable(),
  motherName: z.string().max(255).optional().nullable(),
  motherPhone: z.string().max(20).optional().nullable(),
  motherJob: z.string().max(100).optional().nullable(),
  guardianName: z.string().max(255).optional().nullable(),
  chosenMajor: PpdbMajorEnum.optional(),
  tahfidzJuzCount: z.coerce.number().int().min(0).max(30).optional().nullable(),
  achievementNotes: z.string().max(500).optional().nullable(),
});
export type UpdateApplicantFormInput = z.infer<typeof UpdateApplicantFormSchema>;

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

// Admin Verify Document Schema
export const VerifyDocumentSchema = z.object({
  verificationStatus: z.enum(["pending", "valid", "invalid"]),
  notes: z.string().max(500).optional().nullable(),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentSchema>;

// Query Filters
export const ApplicantQuerySchema = z.object({
  status: PpdbStatusEnum.optional(),
  major: PpdbMajorEnum.optional(),
  track: PpdbTrackEnum.optional(),
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
