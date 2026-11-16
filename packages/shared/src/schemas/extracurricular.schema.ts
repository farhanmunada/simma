import { z } from "zod";
import {
  EXTRACURRICULAR_CATEGORIES,
  EXTRACURRICULAR_ROLES,
  EXTRACURRICULAR_MEMBER_STATUSES,
  EXTRACURRICULAR_GRADES,
} from "../constants.js";

// 1. Master Extracurricular
export const ExtracurricularSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1, "Kode ekstrakurikuler wajib diisi"),
  name: z.string().min(2, "Nama ekstrakurikuler minimal 2 karakter"),
  category: z.enum(EXTRACURRICULAR_CATEGORIES),
  coachId: z.string().uuid().nullable().optional(),
  scheduleDay: z.string().nullable().optional(),
  scheduleTime: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  maxCapacity: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Extracurricular = z.infer<typeof ExtracurricularSchema>;

export const CreateExtracurricularSchema = z.object({
  code: z.string().min(1, "Kode ekstrakurikuler wajib diisi"),
  name: z.string().min(2, "Nama ekstrakurikuler minimal 2 karakter"),
  category: z.enum(EXTRACURRICULAR_CATEGORIES),
  coachId: z.string().uuid().nullable().optional(),
  scheduleDay: z.string().nullable().optional(),
  scheduleTime: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  maxCapacity: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});
export type CreateExtracurricularInput = z.infer<typeof CreateExtracurricularSchema>;

export const UpdateExtracurricularSchema = CreateExtracurricularSchema.partial();
export type UpdateExtracurricularInput = z.infer<typeof UpdateExtracurricularSchema>;

// 2. Extracurricular Members
export const ExtracurricularMemberSchema = z.object({
  id: z.string().uuid(),
  extracurricularId: z.string().uuid("ID ekstrakurikuler harus UUID"),
  studentId: z.string().uuid("ID siswa harus UUID"),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID"),
  semester: z.enum(["ganjil", "genap"]),
  role: z.enum(EXTRACURRICULAR_ROLES).default("MEMBER"),
  joinedDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
  status: z.enum(EXTRACURRICULAR_MEMBER_STATUSES).default("ACTIVE"),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type ExtracurricularMember = z.infer<typeof ExtracurricularMemberSchema>;

export const CreateExtracurricularMemberSchema = z.object({
  extracurricularId: z.string().uuid("ID ekstrakurikuler harus UUID"),
  studentId: z.string().uuid("ID siswa harus UUID"),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID"),
  semester: z.enum(["ganjil", "genap"]),
  role: z.enum(EXTRACURRICULAR_ROLES).default("MEMBER").optional(),
  joinedDate: z.string().default(() => new Date().toISOString().slice(0, 10)).optional(),
  status: z.enum(EXTRACURRICULAR_MEMBER_STATUSES).default("ACTIVE").optional(),
});
export type CreateExtracurricularMemberInput = z.infer<typeof CreateExtracurricularMemberSchema>;

export const UpdateExtracurricularMemberSchema = z.object({
  role: z.enum(EXTRACURRICULAR_ROLES).optional(),
  status: z.enum(EXTRACURRICULAR_MEMBER_STATUSES).optional(),
});
export type UpdateExtracurricularMemberInput = z.infer<typeof UpdateExtracurricularMemberSchema>;

// 3. Extracurricular Grades (Rapor RDM)
export const ExtracurricularGradeSchema = z.object({
  id: z.string().uuid(),
  extracurricularMemberId: z.string().uuid("ID anggota ekskul harus UUID"),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID"),
  semester: z.enum(["ganjil", "genap"]),
  score: z.enum(EXTRACURRICULAR_GRADES),
  notes: z.string().min(3, "Deskripsi capaian rapor minimal 3 karakter"),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type ExtracurricularGrade = z.infer<typeof ExtracurricularGradeSchema>;

export const UpsertExtracurricularGradeSchema = z.object({
  extracurricularMemberId: z.string().uuid("ID anggota ekskul harus UUID"),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID"),
  semester: z.enum(["ganjil", "genap"]),
  score: z.enum(EXTRACURRICULAR_GRADES),
  notes: z.string().min(3, "Deskripsi capaian rapor minimal 3 karakter"),
});
export type UpsertExtracurricularGradeInput = z.infer<typeof UpsertExtracurricularGradeSchema>;

export const BatchUpsertExtracurricularGradesSchema = z.object({
  items: z.array(UpsertExtracurricularGradeSchema).min(1, "Minimal 1 entri nilai"),
});
export type BatchUpsertExtracurricularGradesInput = z.infer<typeof BatchUpsertExtracurricularGradesSchema>;

// Query and Param Schemas
export const ExtracurricularQuerySchema = z.object({
  category: z.enum(EXTRACURRICULAR_CATEGORIES).optional(),
  isActive: z
    .preprocess((val) => {
      if (typeof val === "string") return val === "true";
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().optional(),
});
export type ExtracurricularQueryInput = z.infer<typeof ExtracurricularQuerySchema>;

export const ExtracurricularMemberQuerySchema = z.object({
  extracurricularId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semester: z.enum(["ganjil", "genap"]).optional(),
  status: z.enum(EXTRACURRICULAR_MEMBER_STATUSES).optional(),
});
export type ExtracurricularMemberQueryInput = z.infer<typeof ExtracurricularMemberQuerySchema>;

export const ExtracurricularGradeQuerySchema = z.object({
  extracurricularId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semester: z.enum(["ganjil", "genap"]).optional(),
  studentId: z.string().uuid().optional(),
});
export type ExtracurricularGradeQueryInput = z.infer<typeof ExtracurricularGradeQuerySchema>;

export const ExtracurricularIdParamSchema = z.object({
  id: z.string().uuid("ID harus UUID valid"),
});
export type ExtracurricularIdParamInput = z.infer<typeof ExtracurricularIdParamSchema>;

export const StudentIdParamExtracurricularSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
});
export type StudentIdParamExtracurricularInput = z.infer<typeof StudentIdParamExtracurricularSchema>;
