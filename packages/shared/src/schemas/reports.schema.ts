import { z } from "zod";

// --- Params Schemas ---

export const StudentSemesterParamSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  semesterId: z.string().uuid("ID semester harus UUID valid"),
});

export const ClassroomSemesterParamSchema = z.object({
  classroomId: z.string().uuid("ID kelas harus UUID valid"),
  semesterId: z.string().uuid("ID semester harus UUID valid"),
});

export const StudentIdParamSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
});

// --- Query Schemas ---

export const LeggerQuerySchema = z.object({
  sortBy: z.enum(["rank", "name", "nisn", "totalScore"]).optional().default("rank"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const ReportCardQuerySchema = z.object({
  includeTahfidz: z
    .preprocess((val) => {
      if (typeof val === "string") return val === "true";
      return val ?? true;
    }, z.boolean())
    .optional()
    .default(true),
  includeAttendance: z
    .preprocess((val) => {
      if (typeof val === "string") return val === "true";
      return val ?? true;
    }, z.boolean())
    .optional()
    .default(true),
});

// --- Notes & Attitudes Schemas ---

export const ExtracurricularItemSchema = z.object({
  name: z.string().min(1, "Nama ekstrakurikuler wajib diisi"),
  score: z.string().optional().default("Baik"),
  description: z.string().optional().default(""),
});

export const AchievementItemSchema = z.object({
  description: z.string().min(1, "Deskripsi prestasi wajib diisi"),
  type: z.string().optional().default("Akademik"),
});

export const ReportNotesBodySchema = z.object({
  semesterId: z.string().uuid("ID semester harus UUID valid"),
  classroomId: z.string().uuid("ID kelas harus UUID valid").optional(),
  teacherNotes: z.string().min(1, "Catatan wali kelas wajib diisi"),
  spiritualAttitude: z.string().optional().default(""),
  socialAttitude: z.string().optional().default(""),
  extracurriculars: z.array(ExtracurricularItemSchema).optional().default([]),
  achievements: z.array(AchievementItemSchema).optional().default([]),
});

// Inferred Types
export type StudentSemesterParamInput = z.infer<typeof StudentSemesterParamSchema>;
export type ClassroomSemesterParamInput = z.infer<typeof ClassroomSemesterParamSchema>;
export type StudentIdParamInput = z.infer<typeof StudentIdParamSchema>;
export type LeggerQueryInput = z.infer<typeof LeggerQuerySchema>;
export type ReportCardQueryInput = z.infer<typeof ReportCardQuerySchema>;
export type ReportNotesBodyInput = z.input<typeof ReportNotesBodySchema>;
export type ReportNotesBodyOutput = z.output<typeof ReportNotesBodySchema>;
export type ExtracurricularItem = z.infer<typeof ExtracurricularItemSchema>;
export type AchievementItem = z.infer<typeof AchievementItemSchema>;
