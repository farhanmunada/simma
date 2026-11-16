import { z } from "zod";
import {
  STUDENT_ATTENDANCE_STATUS,
  TEACHER_ATTENDANCE_STATUS,
} from "../constants.js";

// --- Student Attendance Schemas ---

export const RecordStudentAttendanceSchema = z.object({
  studentId: z.string().uuid("ID siswa harus berupa UUID yang valid"),
  classroomId: z.string().uuid("ID kelas harus berupa UUID yang valid"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  status: z.enum(STUDENT_ATTENDANCE_STATUS, {
    errorMap: () => ({
      message: "Status siswa harus salah satu dari: hadir, izin, sakit, alpa",
    }),
  }),
  note: z.string().nullable().optional(),
  teacherId: z
    .string()
    .uuid("ID guru harus berupa UUID yang valid")
    .nullable()
    .optional(),
});

export const UpdateStudentAttendanceSchema = z.object({
  status: z.enum(STUDENT_ATTENDANCE_STATUS).optional(),
  note: z.string().nullable().optional(),
  teacherId: z
    .string()
    .uuid("ID guru harus berupa UUID yang valid")
    .nullable()
    .optional(),
});

export const BulkStudentAttendanceItemSchema = z.object({
  studentId: z.string().uuid("ID siswa harus berupa UUID yang valid"),
  status: z.enum(STUDENT_ATTENDANCE_STATUS, {
    errorMap: () => ({
      message: "Status siswa harus salah satu dari: hadir, izin, sakit, alpa",
    }),
  }),
  note: z.string().nullable().optional(),
});

export const BulkStudentAttendanceSchema = z.object({
  classroomId: z.string().uuid("ID kelas harus berupa UUID yang valid"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  teacherId: z
    .string()
    .uuid("ID guru harus berupa UUID yang valid")
    .nullable()
    .optional(),
  attendances: z
    .array(BulkStudentAttendanceItemSchema)
    .min(1, "Minimal 1 data presensi siswa diperlukan"),
});

export const StudentAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  studentId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(STUDENT_ATTENDANCE_STATUS).optional(),
});

export type RecordStudentAttendanceInput = z.infer<
  typeof RecordStudentAttendanceSchema
>;
export type UpdateStudentAttendanceInput = z.infer<
  typeof UpdateStudentAttendanceSchema
>;
export type BulkStudentAttendanceItem = z.infer<
  typeof BulkStudentAttendanceItemSchema
>;
export type BulkStudentAttendanceInput = z.infer<
  typeof BulkStudentAttendanceSchema
>;
export type StudentAttendanceQueryParams = z.infer<
  typeof StudentAttendanceQuerySchema
>;

// --- Teacher Attendance Schemas ---

export const RecordTeacherAttendanceSchema = z.object({
  teacherId: z.string().uuid("ID guru harus berupa UUID yang valid"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  status: z.enum(TEACHER_ATTENDANCE_STATUS, {
    errorMap: () => ({
      message:
        "Status guru harus salah satu dari: hadir, izin, sakit, alpa, dinas_luar",
    }),
  }),
  note: z.string().nullable().optional(),
});

export const UpdateTeacherAttendanceSchema = z.object({
  status: z.enum(TEACHER_ATTENDANCE_STATUS).optional(),
  note: z.string().nullable().optional(),
});

export const BulkTeacherAttendanceItemSchema = z.object({
  teacherId: z.string().uuid("ID guru harus berupa UUID yang valid"),
  status: z.enum(TEACHER_ATTENDANCE_STATUS, {
    errorMap: () => ({
      message:
        "Status guru harus salah satu dari: hadir, izin, sakit, alpa, dinas_luar",
    }),
  }),
  note: z.string().nullable().optional(),
});

export const BulkTeacherAttendanceSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  attendances: z
    .array(BulkTeacherAttendanceItemSchema)
    .min(1, "Minimal 1 data presensi guru diperlukan"),
});

export const TeacherAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  teacherId: z.string().uuid().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(TEACHER_ATTENDANCE_STATUS).optional(),
});

export type RecordTeacherAttendanceInput = z.infer<
  typeof RecordTeacherAttendanceSchema
>;
export type UpdateTeacherAttendanceInput = z.infer<
  typeof UpdateTeacherAttendanceSchema
>;
export type BulkTeacherAttendanceItem = z.infer<
  typeof BulkTeacherAttendanceItemSchema
>;
export type BulkTeacherAttendanceInput = z.infer<
  typeof BulkTeacherAttendanceSchema
>;
export type TeacherAttendanceQueryParams = z.infer<
  typeof TeacherAttendanceQuerySchema
>;
