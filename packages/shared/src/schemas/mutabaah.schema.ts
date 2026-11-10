import { z } from "zod";
import {
  MUTABAAH_ACTIVITY_CATEGORIES,
  MUTABAAH_ENTRY_STATUSES,
  MUTABAAH_UZUR_TYPES,
  MUTABAAH_COMPLIANCE_STATUS,
} from "../constants.js";

// Activity Schemas (Katalog Amalan)
export const MutabaahActivitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nama amalan minimal 2 karakter"),
  category: z.enum(MUTABAAH_ACTIVITY_CATEGORIES),
  targetCount: z.number().int().min(1).default(1),
  unit: z.string().default("kali"),
  weight: z.number().int().min(1).max(10).default(1),
  isMandatory: z.boolean().default(true),
  genderSpecific: z.enum(["all", "L", "P"]).default("all"),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type MutabaahActivity = z.infer<typeof MutabaahActivitySchema>;

export const CreateMutabaahActivitySchema = z.object({
  name: z.string().min(2, "Nama amalan minimal 2 karakter"),
  category: z.enum(MUTABAAH_ACTIVITY_CATEGORIES),
  targetCount: z.number().int().min(1).default(1).optional(),
  unit: z.string().default("kali").optional(),
  weight: z.number().int().min(1).max(10).default(1).optional(),
  isMandatory: z.boolean().default(true).optional(),
  genderSpecific: z.enum(["all", "L", "P"]).default("all").optional(),
  orderIndex: z.number().int().default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});
export type CreateMutabaahActivityInput = z.infer<
  typeof CreateMutabaahActivitySchema
>;

export const UpdateMutabaahActivitySchema = CreateMutabaahActivitySchema.partial();
export type UpdateMutabaahActivityInput = z.infer<
  typeof UpdateMutabaahActivitySchema
>;

// Daily Entry Schemas (Checklist Harian)
export const MutabaahDailyItemSchema = z.object({
  studentId: z.string().uuid(),
  activityId: z.string().uuid(),
  status: z.enum(MUTABAAH_ENTRY_STATUSES),
  volume: z.number().int().min(0).default(1),
  score: z.number().int().min(0).max(100).default(100),
  notes: z.string().optional().nullable(),
});
export type MutabaahDailyItem = z.infer<typeof MutabaahDailyItemSchema>;

export const BatchUpsertMutabaahEntriesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  classroomId: z.string().uuid().optional().nullable(),
  entries: z.array(MutabaahDailyItemSchema).min(1, "Minimal satu entri amalan"),
});
export type BatchUpsertMutabaahEntriesInput = z.infer<
  typeof BatchUpsertMutabaahEntriesSchema
>;

export const QueryMutabaahDailyChecklistSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  classroomId: z.string().uuid().optional(),
  category: z.enum(MUTABAAH_ACTIVITY_CATEGORIES).optional(),
});
export type QueryMutabaahDailyChecklistInput = z.infer<
  typeof QueryMutabaahDailyChecklistSchema
>;

// Uzur Syar'i Schemas
export const MutabaahUzurRecordSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  uzurType: z.enum(MUTABAAH_UZUR_TYPES),
  notes: z.string().nullable().optional(),
  recordedBy: z.string().uuid().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type MutabaahUzurRecord = z.infer<typeof MutabaahUzurRecordSchema>;

export const CreateMutabaahUzurRecordSchema = z.object({
  studentId: z.string().uuid("ID Santri harus UUID valid"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional().nullable(),
  uzurType: z.enum(MUTABAAH_UZUR_TYPES).default("haidh"),
  notes: z.string().max(255).optional().nullable(),
});
export type CreateMutabaahUzurRecordInput = z.infer<
  typeof CreateMutabaahUzurRecordSchema
>;

// Compliance & Recap Schemas
export const QueryComplianceSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  classroomId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});
export type QueryComplianceInput = z.infer<typeof QueryComplianceSchema>;

export const StudentComplianceSummarySchema = z.object({
  studentId: z.string().uuid(),
  studentName: z.string(),
  nisn: z.string().nullable().optional(),
  gender: z.string(),
  className: z.string().nullable().optional(),
  totalMandatoryActivities: z.number(),
  completedActivities: z.number(),
  masbukActivities: z.number(),
  uzurActivities: z.number(),
  missedActivities: z.number(),
  complianceScore: z.number(), // 0 - 100
  status: z.enum(MUTABAAH_COMPLIANCE_STATUS),
  consecutiveMissedFardhu: z.number().default(0),
  hasEarlyWarning: z.boolean().default(false),
});
export type StudentComplianceSummary = z.infer<
  typeof StudentComplianceSummarySchema
>;

export const EarlyWarningAlertSchema = z.object({
  studentId: z.string().uuid(),
  studentName: z.string(),
  className: z.string().nullable().optional(),
  gender: z.string(),
  missedFardhuCount: z.number(),
  recentMissedDates: z.array(z.string()),
  lastActivityName: z.string().nullable().optional(),
  warningLevel: z.enum(["sedang", "tinggi"]),
});
export type EarlyWarningAlert = z.infer<typeof EarlyWarningAlertSchema>;
