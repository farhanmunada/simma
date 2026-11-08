import { z } from "zod";
import { STUDENT_STATUS, GENDER, PARENT_RELATION_TYPE } from "../constants.js";

// Student
export const CreateStudentSchema = z.object({
  nik: z.string().length(16, "NIK harus 16 digit"),
  nisn: z.string().length(10, "NISN harus 10 digit").nullable().optional(),
  nis: z.string().max(20, "NIS maksimal 20 karakter").nullable().optional(),
  fullName: z.string().min(1, "Nama lengkap siswa wajib diisi").max(255),
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi").max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  gender: z.enum(GENDER),
  motherName: z.string().min(1, "Nama ibu kandung wajib diisi").max(255),
  status: z.enum(STUDENT_STATUS).optional().default("aktif"),
  photoPath: z.string().nullable().optional(),
  emisData: z.record(z.unknown()).optional().default({}),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();
export type CreateStudentInput = z.input<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.input<typeof UpdateStudentSchema>;

// Parent
export const CreateParentSchema = z.object({
  nik: z.string().length(16, "NIK harus 16 digit").nullable().optional(),
  name: z.string().min(1, "Nama orang tua wajib diisi").max(255),
  birthPlace: z.string().max(100).nullable().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .nullable()
    .optional(),
  gender: z.enum(GENDER).nullable().optional(),
  education: z.string().max(50).nullable().optional(),
  occupation: z.string().max(100).nullable().optional(),
  income: z.string().max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().nullable().optional(),
  emisData: z.record(z.unknown()).optional().default({}),
});

export const UpdateParentSchema = CreateParentSchema.partial();
export type CreateParentInput = z.input<typeof CreateParentSchema>;
export type UpdateParentInput = z.input<typeof UpdateParentSchema>;

// Student Parent Link
export const AddStudentParentSchema = z.object({
  parentId: z.string().uuid("ID orang tua tidak valid"),
  relationType: z.enum(PARENT_RELATION_TYPE),
  isGuardian: z.boolean().optional().default(false),
});

export type AddStudentParentInput = z.input<typeof AddStudentParentSchema>;

// Create Parent & Link directly
export const CreateAndLinkParentSchema = z.object({
  relationType: z.enum(PARENT_RELATION_TYPE),
  isGuardian: z.boolean().optional().default(false),
  parent: CreateParentSchema,
});

export type CreateAndLinkParentInput = z.input<typeof CreateAndLinkParentSchema>;

// Assign Classroom
export const AssignClassroomSchema = z.object({
  classroomId: z.string().uuid("ID kelas tidak valid"),
  studentIds: z.array(z.string().uuid("ID siswa tidak valid")).min(1, "Minimal 1 siswa"),
});

export type AssignClassroomInput = z.input<typeof AssignClassroomSchema>;

// Student Query
export const StudentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(STUDENT_STATUS).optional(),
  gender: z.enum(GENDER).optional(),
  classroomId: z.string().uuid("ID kelas tidak valid").optional(),
});

export type StudentQueryInput = z.input<typeof StudentQuerySchema>;
export type StudentQueryOutput = z.output<typeof StudentQuerySchema>;

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: (typeof STUDENT_STATUS)[number];
  gender?: (typeof GENDER)[number];
  classroomId?: string;
}

