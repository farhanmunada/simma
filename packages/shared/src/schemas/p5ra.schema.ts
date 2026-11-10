import { z } from "zod";
import {
  P5RA_THEMES,
  P5RA_FASES,
  P5RA_STATUSES,
  P5RA_PREDICATES,
} from "../constants.js";

// --- Params Schemas ---
export const ProjectIdParamSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
});

export const TargetIdParamSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
  targetId: z.string().uuid("ID target harus UUID valid"),
});

export const StudentReportParamSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
  studentId: z.string().uuid("ID siswa harus UUID valid"),
});

// --- Query Schemas ---
export const P5raProjectQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  status: z.enum(P5RA_STATUSES).optional(),
  classroomId: z.string().uuid().optional(),
});

export const P5raAssessmentQuerySchema = z.object({
  classroomId: z.string().uuid().optional(),
});

// --- Project Schemas ---
export const CreateP5raProjectSchema = z.object({
  academicYearId: z.string().uuid("Tahun ajaran wajib diisi"),
  semesterId: z.string().uuid("Semester wajib diisi"),
  title: z.string().min(3, "Judul projek minimal 3 karakter"),
  theme: z.enum(P5RA_THEMES, { message: "Tema projek Kemenag tidak valid" }),
  description: z.string().min(5, "Deskripsi projek minimal 5 karakter"),
  targetFase: z.enum(P5RA_FASES).default("E"),
  coordinatorTeacherId: z.string().uuid().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  classroomIds: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateP5raProjectSchema = CreateP5raProjectSchema.partial().extend({
  status: z.enum(P5RA_STATUSES).optional(),
});

// --- Target Dimension & Elemen Schemas ---
export const CreateP5raTargetSchema = z.object({
  dimension: z.string().min(3, "Dimensi P5 wajib dipilih"),
  element: z.string().min(2, "Elemen projek wajib diisi"),
  subElement: z.string().min(2, "Sub-elemen projek wajib diisi"),
  targetDescription: z.string().min(5, "Capaian fase wajib diisi"),
  valuePra: z.string().min(2, "Nilai Rahmatan Lil 'Alamin wajib dipilih"),
  subValuePra: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

export const UpdateP5raTargetSchema = CreateP5raTargetSchema.partial();

// --- Assessment Matrix Schemas ---
export const BatchP5raAssessmentItemSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  targetId: z.string().uuid("ID target harus UUID valid"),
  predicate: z.enum(P5RA_PREDICATES, { message: "Predikat harus MB, SB, BSH, atau SAB" }),
  notes: z.string().optional().nullable(),
});

export const BatchP5raAssessmentSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
  items: z.array(BatchP5raAssessmentItemSchema).min(1, "Minimal 1 penilaian dikirimkan"),
});

// --- Student Process Notes Schemas ---
export const P5raStudentNotesSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  processNotes: z.string().min(5, "Catatan proses projek minimal 5 karakter"),
});

export const GenerateProcessNotesSchema = z.object({
  projectId: z.string().uuid("ID projek harus UUID valid"),
  studentId: z.string().uuid("ID siswa harus UUID valid"),
});

// --- Inferred Types ---
export type ProjectIdParamInput = z.infer<typeof ProjectIdParamSchema>;
export type TargetIdParamInput = z.infer<typeof TargetIdParamSchema>;
export type StudentReportParamInput = z.infer<typeof StudentReportParamSchema>;
export type P5raProjectQueryInput = z.infer<typeof P5raProjectQuerySchema>;
export type P5raAssessmentQueryInput = z.infer<typeof P5raAssessmentQuerySchema>;

export type CreateP5raProjectInput = z.infer<typeof CreateP5raProjectSchema>;
export type UpdateP5raProjectInput = z.infer<typeof UpdateP5raProjectSchema>;
export type CreateP5raTargetInput = z.infer<typeof CreateP5raTargetSchema>;
export type UpdateP5raTargetInput = z.infer<typeof UpdateP5raTargetSchema>;
export type BatchP5raAssessmentInput = z.infer<typeof BatchP5raAssessmentSchema>;
export type BatchP5raAssessmentItemInput = z.infer<typeof BatchP5raAssessmentItemSchema>;
export type P5raStudentNotesInput = z.infer<typeof P5raStudentNotesSchema>;
export type GenerateProcessNotesInput = z.infer<typeof GenerateProcessNotesSchema>;
