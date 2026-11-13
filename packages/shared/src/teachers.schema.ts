import { z } from "zod";
import {
  EMPLOYMENT_TYPES,
  GTK_TYPES,
  DUTY_STATUSES,
  EDUCATION_LEVELS,
  GRADE_GROUPS,
  TEACHER_DOCUMENT_TYPES,
  ADDITIONAL_DUTY_TYPES,
  SIMPATIKA_STATUSES,
} from "./constants.js";

// Master GTK Identitas & Biodata (F-GTK-01)
export const TeacherProfileSchema = z.object({
  nip: z.string().max(30).nullable().optional(),
  pegId: z.string().max(30).nullable().optional(),
  nrg: z.string().max(30).nullable().optional(),
  noKk: z.string().length(16, "Nomor KK harus 16 digit").nullable().optional(),
  birthPlace: z.string().max(100).nullable().optional(),
  birthDate: z.string().nullable().optional(), // YYYY-MM-DD
  gender: z.enum(["L", "P"]).nullable().optional(),
  religion: z.string().max(30).default("Islam"),
  address: z.string().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email("Format email tidak valid").nullable().optional().or(z.literal("")),
  marriageStatus: z.enum(["menikah", "belum_menikah", "duda_janda"]).nullable().optional(),
  tmtFirst: z.string().nullable().optional(), // YYYY-MM-DD
  tmtPns: z.string().nullable().optional(), // YYYY-MM-DD
  dutyStatus: z.enum(DUTY_STATUSES).default("aktif"),
  gtkType: z.enum(GTK_TYPES).default("pendidik"),
  certificationField: z.string().max(100).nullable().optional(),
});

export const CreateTeacherFullSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  positionId: z.string().uuid().nullable().optional(),
  nik: z.string().length(16, "NIK harus 16 digit"),
  nuptk: z.string().max(20).nullable().optional(),
  fullName: z.string().min(1, "Nama lengkap GTK wajib diisi").max(255),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  certification: z.string().max(100).nullable().optional(),
  emisData: z.record(z.unknown()).optional().default({}),
  profile: TeacherProfileSchema.optional(),
});

export const UpdateTeacherFullSchema = CreateTeacherFullSchema.partial();

// Riwayat Pendidikan (F-GTK-03)
export const CreateTeacherEducationSchema = z.object({
  level: z.enum(EDUCATION_LEVELS),
  institution: z.string().min(1, "Nama institusi wajib diisi").max(200),
  major: z.string().min(1, "Program studi/jurusan wajib diisi").max(150),
  graduationYear: z.coerce.number().int().min(1950).max(2100),
  gpa: z.string().max(10).nullable().optional(),
  certificateNumber: z.string().max(100).nullable().optional(),
  isLinear: z.boolean().default(true),
});

export const UpdateTeacherEducationSchema = CreateTeacherEducationSchema.partial();

// Riwayat Kepangkatan & KGB (F-GTK-03 / F-GTK-05)
export const CreateTeacherRankSchema = z.object({
  rank: z.string().min(1, "Nama pangkat wajib diisi").max(100),
  gradeGroup: z.enum(GRADE_GROUPS),
  skNumber: z.string().min(1, "Nomor SK wajib diisi").max(150),
  skDate: z.string().min(1, "Tanggal SK wajib diisi"), // YYYY-MM-DD
  tmtRank: z.string().min(1, "TMT Pangkat wajib diisi"), // YYYY-MM-DD
  salary: z.coerce.number().int().nonnegative().nullable().optional(),
  nextPromotionDate: z.string().nullable().optional(), // YYYY-MM-DD
  nextKgbDate: z.string().nullable().optional(), // YYYY-MM-DD
  isCurrent: z.boolean().default(false),
});

export const UpdateTeacherRankSchema = CreateTeacherRankSchema.partial();

// Brankas Digital Dokumen (F-GTK-02 / F-GTK-06)
export const CreateTeacherDocumentSchema = z.object({
  documentType: z.enum(TEACHER_DOCUMENT_TYPES),
  title: z.string().min(1, "Judul dokumen wajib diisi").max(200),
  documentNumber: z.string().max(150).nullable().optional(),
  issueDate: z.string().nullable().optional(),
  fileUrl: z.string().min(1, "File URL wajib diisi").max(500),
  fileSize: z.coerce.number().int().nonnegative().nullable().optional(),
  mimeType: z.string().max(100).default("application/pdf"),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).default("verified"),
  notes: z.string().nullable().optional(),
});

export const UpdateTeacherDocumentSchema = CreateTeacherDocumentSchema.partial();

// Pemantauan Beban Kerja 24 JTM (F-GTK-04)
export const UpsertTeacherWorkloadSchema = z.object({
  teacherId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  semesterId: z.string().uuid(),
  teachingJtm: z.coerce.number().int().min(0).max(60).default(0),
  additionalDutyType: z.enum(ADDITIONAL_DUTY_TYPES).default("tidak_ada"),
  additionalDutyJtm: z.coerce.number().int().min(0).max(30).default(0),
  totalJtm: z.coerce.number().int().min(0).max(90).optional(),
  isEligibleTpg: z.boolean().optional(),
  simpatikaStatus: z.enum(SIMPATIKA_STATUSES).default("layak"),
  notes: z.string().nullable().optional(),
});

// Query Filter GTK
export const TeacherQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  gtkType: z.enum(GTK_TYPES).optional(),
  dutyStatus: z.enum(DUTY_STATUSES).optional(),
  isCertified: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  isEligibleTpg: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
});

// Type definitions inferred from Zod
export type TeacherProfileInput = z.input<typeof TeacherProfileSchema>;
export type CreateTeacherFullInput = z.input<typeof CreateTeacherFullSchema>;
export type UpdateTeacherFullInput = z.input<typeof UpdateTeacherFullSchema>;
export type CreateTeacherEducationInput = z.input<typeof CreateTeacherEducationSchema>;
export type UpdateTeacherEducationInput = z.input<typeof UpdateTeacherEducationSchema>;
export type CreateTeacherRankInput = z.input<typeof CreateTeacherRankSchema>;
export type UpdateTeacherRankInput = z.input<typeof UpdateTeacherRankSchema>;
export type CreateTeacherDocumentInput = z.input<typeof CreateTeacherDocumentSchema>;
export type UpdateTeacherDocumentInput = z.input<typeof UpdateTeacherDocumentSchema>;
export type UpsertTeacherWorkloadInput = z.input<typeof UpsertTeacherWorkloadSchema>;
export type TeacherQueryParams = z.input<typeof TeacherQuerySchema>;
