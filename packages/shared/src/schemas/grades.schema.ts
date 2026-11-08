import { z } from "zod";
import { GRADE_ASSESSMENT_TYPES, LETTER_GRADES } from "../constants.js";

// Enum schemas
export const GradeAssessmentTypeSchema = z.enum(GRADE_ASSESSMENT_TYPES);
export const LetterGradeSchema = z.enum(LETTER_GRADES);

// --- Assessment Schemas ---

export const CreateAssessmentSchema = z.object({
  subjectId: z.string().uuid("ID mata pelajaran harus UUID valid"),
  classroomId: z.string().uuid("ID kelas harus UUID valid"),
  teacherId: z.string().uuid("ID guru harus UUID valid"),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID valid"),
  semesterId: z.string().uuid("ID semester harus UUID valid"),
  type: GradeAssessmentTypeSchema,
  title: z.string().min(1, "Judul penilaian wajib diisi").max(255, "Judul terlalu panjang"),
  maxScore: z.number().positive("Skor maksimal harus lebih besar dari 0").default(100),
  weight: z.number().positive("Bobot penilaian harus lebih besar dari 0").default(1),
});

export const UpdateAssessmentSchema = CreateAssessmentSchema.partial();

export const AssessmentQuerySchema = z.object({
  subjectId: z.string().uuid("ID mata pelajaran harus UUID valid").optional(),
  classroomId: z.string().uuid("ID kelas harus UUID valid").optional(),
  teacherId: z.string().uuid("ID guru harus UUID valid").optional(),
  academicYearId: z.string().uuid("ID tahun ajaran harus UUID valid").optional(),
  semesterId: z.string().uuid("ID semester harus UUID valid").optional(),
  type: GradeAssessmentTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

// --- Student Grade Schemas ---

export const CreateStudentGradeSchema = z.object({
  assessmentId: z.string().uuid("ID penilaian harus UUID valid"),
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  score: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  feedback: z.string().max(1000, "Catatan feedback terlalu panjang").optional().nullable(),
});

export const UpdateStudentGradeSchema = z.object({
  score: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100").optional(),
  feedback: z.string().max(1000, "Catatan feedback terlalu panjang").optional().nullable(),
});

export const BatchStudentGradeItemSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  score: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  feedback: z.string().max(1000, "Catatan feedback terlalu panjang").optional().nullable(),
});

export const BatchUpsertGradesSchema = z.object({
  assessmentId: z.string().uuid("ID penilaian harus UUID valid"),
  grades: z.array(BatchStudentGradeItemSchema).min(1, "Minimal 1 nilai siswa"),
});

export const StudentGradeQuerySchema = z.object({
  assessmentId: z.string().uuid("ID penilaian harus UUID valid").optional(),
  studentId: z.string().uuid("ID siswa harus UUID valid").optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

// --- Semester Grade Schemas ---

export const CreateSemesterGradeSchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid"),
  classroomId: z.string().uuid("ID kelas harus UUID valid"),
  subjectId: z.string().uuid("ID mata pelajaran harus UUID valid"),
  semesterId: z.string().uuid("ID semester harus UUID valid"),
  finalScore: z.number().min(0, "Nilai akhir minimal 0").max(100, "Nilai akhir maksimal 100"),
  letterGrade: LetterGradeSchema.optional(),
});

export const UpdateSemesterGradeSchema = z.object({
  finalScore: z.number().min(0, "Nilai akhir minimal 0").max(100, "Nilai akhir maksimal 100").optional(),
  letterGrade: LetterGradeSchema.optional(),
});

export const CalculateSemesterGradeSchema = z.object({
  classroomId: z.string().uuid("ID kelas harus UUID valid"),
  subjectId: z.string().uuid("ID mata pelajaran harus UUID valid"),
  semesterId: z.string().uuid("ID semester harus UUID valid"),
});

export const SemesterGradeQuerySchema = z.object({
  studentId: z.string().uuid("ID siswa harus UUID valid").optional(),
  classroomId: z.string().uuid("ID kelas harus UUID valid").optional(),
  subjectId: z.string().uuid("ID mata pelajaran harus UUID valid").optional(),
  semesterId: z.string().uuid("ID semester harus UUID valid").optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

// Type definitions inferred from Zod schemas
export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;
export type AssessmentQueryParams = z.infer<typeof AssessmentQuerySchema>;

export type CreateStudentGradeInput = z.infer<typeof CreateStudentGradeSchema>;
export type UpdateStudentGradeInput = z.infer<typeof UpdateStudentGradeSchema>;
export type BatchStudentGradeItem = z.infer<typeof BatchStudentGradeItemSchema>;
export type BatchUpsertGradesInput = z.infer<typeof BatchUpsertGradesSchema>;
export type StudentGradeQueryParams = z.infer<typeof StudentGradeQuerySchema>;

export type CreateSemesterGradeInput = z.infer<typeof CreateSemesterGradeSchema>;
export type UpdateSemesterGradeInput = z.infer<typeof UpdateSemesterGradeSchema>;
export type CalculateSemesterGradeInput = z.infer<typeof CalculateSemesterGradeSchema>;
export type SemesterGradeQueryParams = z.infer<typeof SemesterGradeQuerySchema>;
