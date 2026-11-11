import { z } from "zod";
import {
  TRANSFER_TYPES,
  TRANSFER_STATUSES,
  CLEARANCE_DIMENSIONS,
  GRADUATION_STATUSES,
} from "../constants";

export const createTransferInSchema = z.object({
  student: z.object({
    fullName: z.string().min(1, "Nama lengkap siswa wajib diisi"),
    nisn: z
      .string()
      .length(10, "NISN harus 10 digit")
      .regex(/^\d+$/, "NISN harus berupa angka")
      .optional()
      .nullable(),
    nik: z
      .string()
      .length(16, "NIK harus 16 digit")
      .regex(/^\d+$/, "NIK harus berupa angka")
      .optional()
      .nullable(),
    gender: z.enum(["L", "P"], {
      errorMap: () => ({ message: "Jenis kelamin harus L atau P" }),
    }),
    birthPlace: z.string().optional().nullable(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal lahir harus YYYY-MM-DD"),
  }),
  originSchool: z.string().min(1, "Sekolah asal wajib diisi"),
  originLetterNumber: z
    .string()
    .min(1, "Nomor surat rekomendasi mutasi asal wajib diisi"),
  originNpsn: z.string().optional().nullable(),
  previousClassLevel: z.number().int().min(10).max(12).default(10),
  targetClassroomId: z.string().uuid("ID rombel tujuan tidak valid"),
  transferDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal mutasi harus YYYY-MM-DD"),
  stambukNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type CreateTransferInInput = z.infer<typeof createTransferInSchema>;

export const createTransferOutSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid"),
  destinationSchool: z.string().min(1, "Madrasah/Sekolah tujuan wajib diisi"),
  reason: z.string().min(3, "Alasan mutasi keluar wajib diisi minimal 3 karakter"),
  transferDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal mutasi harus YYYY-MM-DD"),
  notes: z.string().optional().nullable(),
});
export type CreateTransferOutInput = z.infer<typeof createTransferOutSchema>;

export const updateClearanceItemSchema = z.object({
  dimension: z.enum(CLEARANCE_DIMENSIONS, {
    errorMap: () => ({ message: "Dimensi clearance harus library, finance, atau discipline" }),
  }),
  cleared: z.boolean({ required_error: "Status clearance wajib diisi" }),
  notes: z.string().optional().nullable(),
});
export type UpdateClearanceItemInput = z.infer<typeof updateClearanceItemSchema>;

export const approveTransferOutSchema = z.object({
  approved: z.boolean({ required_error: "Status persetujuan wajib diisi" }),
  notes: z.string().optional().nullable(),
});
export type ApproveTransferOutInput = z.infer<typeof approveTransferOutSchema>;

export const singleGraduationSchema = z.object({
  academicYearId: z.string().uuid("ID tahun ajaran tidak valid"),
  studentId: z.string().uuid("ID siswa tidak valid"),
  classroomId: z.string().uuid().optional().nullable(),
  graduationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal kelulusan harus YYYY-MM-DD"),
  graduationStatus: z.enum(GRADUATION_STATUSES).default("lulus"),
  certificateNumber: z.string().optional().nullable(),
  sklNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type SingleGraduationInput = z.infer<typeof singleGraduationSchema>;

export const batchGraduationSchema = z.object({
  academicYearId: z.string().uuid("ID tahun ajaran tidak valid"),
  classroomId: z.string().uuid().optional().nullable(),
  graduationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal kelulusan harus YYYY-MM-DD"),
  students: z
    .array(
      z.object({
        studentId: z.string().uuid("ID siswa tidak valid"),
        graduationStatus: z.enum(GRADUATION_STATUSES).default("lulus"),
        certificateNumber: z.string().optional().nullable(),
        sklNumber: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      })
    )
    .min(1, "Minimal pilih 1 siswa untuk pemrosesan kelulusan"),
});
export type BatchGraduationInput = z.infer<typeof batchGraduationSchema>;

export const filterTransferSchema = z.object({
  type: z.enum(TRANSFER_TYPES).optional(),
  status: z.enum(TRANSFER_STATUSES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type FilterTransferInput = z.infer<typeof filterTransferSchema>;

export const filterGraduationSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  status: z.enum(GRADUATION_STATUSES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type FilterGraduationInput = z.infer<typeof filterGraduationSchema>;
