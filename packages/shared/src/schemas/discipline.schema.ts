import { z } from "zod";
import {
  DISCIPLINE_RULE_TYPES,
  DISCIPLINE_CATEGORIES,
  SANCTION_LEVELS,
  INFRACTION_STATUSES,
  COUNSELING_SESSION_TYPES,
  COUNSELING_ISSUE_CATEGORIES,
  COUNSELING_STATUSES,
  PARENT_SUMMON_STATUSES,
} from "../constants.js";

// 1. Master Rules Catalog
export const DisciplineRuleSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1, "Kode aturan wajib diisi"),
  name: z.string().min(2, "Nama aturan minimal 2 karakter"),
  type: z.enum(DISCIPLINE_RULE_TYPES),
  category: z.enum(DISCIPLINE_CATEGORIES),
  points: z.number().int().min(1, "Poin minimal 1"),
  description: z.string().nullable().optional(),
  sanction: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type DisciplineRule = z.infer<typeof DisciplineRuleSchema>;

export const CreateDisciplineRuleSchema = z.object({
  code: z.string().min(1, "Kode aturan wajib diisi"),
  name: z.string().min(2, "Nama aturan minimal 2 karakter"),
  type: z.enum(DISCIPLINE_RULE_TYPES),
  category: z.enum(DISCIPLINE_CATEGORIES),
  points: z.number().int().min(1, "Poin minimal 1"),
  description: z.string().optional().nullable(),
  sanction: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
});
export type CreateDisciplineRuleInput = z.infer<typeof CreateDisciplineRuleSchema>;

export const UpdateDisciplineRuleSchema = CreateDisciplineRuleSchema.partial();
export type UpdateDisciplineRuleInput = z.infer<typeof UpdateDisciplineRuleSchema>;

// 2. Student Infractions & Merits
export const StudentInfractionSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  ruleId: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  type: z.enum(DISCIPLINE_RULE_TYPES),
  category: z.enum(DISCIPLINE_CATEGORIES),
  points: z.number().int().min(1),
  title: z.string().min(2, "Judul catatan minimal 2 karakter"),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  witness: z.string().nullable().optional(),
  evidenceUrl: z.string().nullable().optional(),
  reporterId: z.string().uuid().nullable().optional(),
  status: z.enum(INFRACTION_STATUSES).default("approved"),
  approvedById: z.string().uuid().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type StudentInfraction = z.infer<typeof StudentInfractionSchema>;

export const CreateStudentInfractionSchema = z.object({
  studentId: z.string().uuid(),
  ruleId: z.string().uuid().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  type: z.enum(DISCIPLINE_RULE_TYPES).default("infraction"),
  category: z.enum(DISCIPLINE_CATEGORIES),
  points: z.number().int().min(1, "Poin minimal 1"),
  title: z.string().min(2, "Judul catatan minimal 2 karakter"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  witness: z.string().optional().nullable(),
  evidenceUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type CreateStudentInfractionInput = z.infer<typeof CreateStudentInfractionSchema>;

export const UpdateInfractionApprovalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().optional().nullable(),
});
export type UpdateInfractionApprovalInput = z.infer<typeof UpdateInfractionApprovalSchema>;

export const QueryStudentInfractionsSchema = z.object({
  studentId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  type: z.enum(DISCIPLINE_RULE_TYPES).optional(),
  category: z.enum(DISCIPLINE_CATEGORIES).optional(),
  status: z.enum(INFRACTION_STATUSES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type QueryStudentInfractionsInput = z.infer<typeof QueryStudentInfractionsSchema>;

// 3. Counseling Sessions (Catatan BK)
export const CounselingSessionSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  counselorId: z.string().uuid(),
  sessionDate: z.string(),
  sessionType: z.enum(COUNSELING_SESSION_TYPES),
  issueCategory: z.enum(COUNSELING_ISSUE_CATEGORIES),
  problemDescription: z.string().min(3, "Deskripsi masalah minimal 3 karakter"),
  counselingNotes: z.string().nullable().optional(),
  actionPlan: z.string().nullable().optional(),
  status: z.enum(COUNSELING_STATUSES).default("dijadwalkan"),
  followUpDate: z.string().nullable().optional(),
  isConfidential: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type CounselingSession = z.infer<typeof CounselingSessionSchema>;

export const CreateCounselingSessionSchema = z.object({
  studentId: z.string().uuid(),
  counselorId: z.string().uuid().optional(),
  sessionDate: z.string().min(1, "Tanggal dan waktu sesi wajib diisi"),
  sessionType: z.enum(COUNSELING_SESSION_TYPES),
  issueCategory: z.enum(COUNSELING_ISSUE_CATEGORIES),
  problemDescription: z.string().min(3, "Deskripsi masalah minimal 3 karakter"),
  counselingNotes: z.string().optional().nullable(),
  actionPlan: z.string().optional().nullable(),
  status: z.enum(COUNSELING_STATUSES).default("dijadwalkan").optional(),
  followUpDate: z.string().optional().nullable(),
  isConfidential: z.boolean().default(true).optional(),
});
export type CreateCounselingSessionInput = z.infer<typeof CreateCounselingSessionSchema>;

export const UpdateCounselingSessionSchema = CreateCounselingSessionSchema.partial();
export type UpdateCounselingSessionInput = z.infer<typeof UpdateCounselingSessionSchema>;

// 4. Parent Summons (Surat Panggilan Orang Tua)
export const ParentSummonSchema = z.object({
  id: z.string().uuid(),
  letterNumber: z.string().min(1, "Nomor surat wajib diisi"),
  studentId: z.string().uuid(),
  parentName: z.string().min(2, "Nama orang tua minimal 2 karakter"),
  summonDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  summonTime: z.string().min(1, "Waktu pertemuan wajib diisi"),
  location: z.string().min(2, "Lokasi pertemuan wajib diisi"),
  reason: z.string().min(3, "Alasan panggilan wajib diisi"),
  sanctionLevel: z.enum(SANCTION_LEVELS),
  status: z.enum(PARENT_SUMMON_STATUSES).default("terbit"),
  notes: z.string().nullable().optional(),
  issuedById: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type ParentSummon = z.infer<typeof ParentSummonSchema>;

export const CreateParentSummonSchema = z.object({
  studentId: z.string().uuid(),
  parentName: z.string().min(2, "Nama orang tua minimal 2 karakter"),
  summonDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  summonTime: z.string().min(1, "Waktu pertemuan wajib diisi (misal: 09:00 WIB)"),
  location: z.string().default("Ruang BK Madrasah Aliyah SIMMA"),
  reason: z.string().min(3, "Alasan panggilan wajib diisi"),
  sanctionLevel: z.enum(SANCTION_LEVELS).default("sp_1"),
  notes: z.string().optional().nullable(),
});
export type CreateParentSummonInput = z.infer<typeof CreateParentSummonSchema>;

export const UpdateParentSummonSchema = z.object({
  status: z.enum(PARENT_SUMMON_STATUSES).optional(),
  notes: z.string().optional().nullable(),
});
export type UpdateParentSummonInput = z.infer<typeof UpdateParentSummonSchema>;
