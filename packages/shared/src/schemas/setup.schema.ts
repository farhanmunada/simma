import { z } from "zod";

// Institution
export const CreateInstitutionSchema = z.object({
  nsm: z.string().min(1, "NSM wajib diisi").max(30),
  npsn: z.string().min(1, "NPSN wajib diisi").max(30),
  name: z.string().min(1, "Nama madrasah wajib diisi").max(255),
  status: z.enum(["negeri", "swasta"]).default("swasta"),
  address: z.string().min(1, "Alamat wajib diisi"),
  logoPath: z.string().nullable().optional(),
  emisData: z.record(z.unknown()).optional().default({}),
});

export const UpdateInstitutionSchema = CreateInstitutionSchema.partial();
export type CreateInstitutionInput = z.input<typeof CreateInstitutionSchema>;
export type UpdateInstitutionInput = z.input<typeof UpdateInstitutionSchema>;

// Academic Year
export const CreateAcademicYearSchema = z.object({
  name: z.string().min(1, "Nama tahun ajaran wajib diisi").max(50),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  isActive: z.boolean().optional().default(false),
});

export const UpdateAcademicYearSchema = CreateAcademicYearSchema.partial();
export type CreateAcademicYearInput = z.input<typeof CreateAcademicYearSchema>;
export type UpdateAcademicYearInput = z.input<typeof UpdateAcademicYearSchema>;

// Semester
export const CreateSemesterSchema = z.object({
  academicYearId: z.string().uuid("ID tahun ajaran tidak valid"),
  type: z.union([z.literal(1), z.literal(2)]),
  isActive: z.boolean().optional().default(false),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export const UpdateSemesterSchema = CreateSemesterSchema.partial();
export type CreateSemesterInput = z.input<typeof CreateSemesterSchema>;
export type UpdateSemesterInput = z.input<typeof UpdateSemesterSchema>;

// Classroom
export const CreateClassroomSchema = z.object({
  semesterId: z.string().uuid("ID semester tidak valid"),
  name: z.string().min(1, "Nama kelas wajib diisi").max(50),
  gradeLevel: z.number().int().min(10).max(12),
  homeroomTeacherId: z.string().uuid("ID wali kelas tidak valid").nullable().optional(),
  capacity: z.number().int().min(1).max(100).optional().default(36),
});

export const UpdateClassroomSchema = CreateClassroomSchema.partial();
export type CreateClassroomInput = z.input<typeof CreateClassroomSchema>;
export type UpdateClassroomInput = z.input<typeof UpdateClassroomSchema>;

// Subject
export const CreateSubjectSchema = z.object({
  code: z.string().min(1, "Kode mapel wajib diisi").max(50),
  name: z.string().min(1, "Nama mapel wajib diisi").max(255),
  group: z.string().min(1, "Kelompok mapel wajib diisi").max(50),
  jpPerWeek: z.number().int().min(1).max(20),
  isRequired: z.boolean().optional().default(true),
  phase: z.enum(["E", "F"]),
});

export const UpdateSubjectSchema = CreateSubjectSchema.partial();
export type CreateSubjectInput = z.input<typeof CreateSubjectSchema>;
export type UpdateSubjectInput = z.input<typeof UpdateSubjectSchema>;

// Teacher
export const CreateTeacherSchema = z.object({
  userId: z.string().uuid("User ID tidak valid").nullable().optional(),
  nik: z.string().length(16, "NIK harus 16 digit"),
  nuptk: z.string().max(20).nullable().optional(),
  fullName: z.string().min(1, "Nama lengkap guru wajib diisi").max(255),
  employmentType: z.enum(["PNS", "PPPK", "GTY", "GTT"]),
  certification: z.string().max(100).nullable().optional(),
  emisData: z.record(z.unknown()).optional().default({}),
});

export const UpdateTeacherSchema = CreateTeacherSchema.partial();
export type CreateTeacherInput = z.input<typeof CreateTeacherSchema>;
export type UpdateTeacherInput = z.input<typeof UpdateTeacherSchema>;

// Query Filters
export const SetupQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  semesterId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  gradeLevel: z.coerce.number().int().optional(),
  phase: z.enum(["E", "F"]).optional(),
  employmentType: z.enum(["PNS", "PPPK", "GTY", "GTT"]).optional(),
});

export type SetupQueryInput = z.input<typeof SetupQuerySchema>;
export type SetupQueryOutput = z.output<typeof SetupQuerySchema>;

export interface SetupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  semesterId?: string;
  academicYearId?: string;
  gradeLevel?: number;
  phase?: "E" | "F";
  employmentType?: "PNS" | "PPPK" | "GTY" | "GTT";
}
