import { z } from "zod";
import {
  EMIS_EXPORT_TYPES,
  EMIS_EXPORT_FORMATS,
  EMIS_ENTITY_TYPES,
  EMIS_BAP_STATUSES,
} from "../constants.js";

export const emisAuditQuerySchema = z.object({
  entityType: z.enum(EMIS_ENTITY_TYPES).default("all"),
  classroomId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type EmisAuditQuery = z.infer<typeof emisAuditQuerySchema>;

export const emisExportQuerySchema = z.object({
  format: z.enum(EMIS_EXPORT_FORMATS).default("csv"),
  semesterId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
});

export type EmisExportQuery = z.infer<typeof emisExportQuerySchema>;

export const emisBapCreateSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export type EmisBapCreateInput = z.infer<typeof emisBapCreateSchema>;

export const emisBapApprovalSchema = z.object({
  approved: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type EmisBapApprovalInput = z.infer<typeof emisBapApprovalSchema>;

export const emisExportTypeSchema = z.enum(EMIS_EXPORT_TYPES);
export const emisExportFormatSchema = z.enum(EMIS_EXPORT_FORMATS);
export const emisBapStatusSchema = z.enum(EMIS_BAP_STATUSES);
