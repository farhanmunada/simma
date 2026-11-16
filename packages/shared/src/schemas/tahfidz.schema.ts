import { z } from "zod";
import { TAHFIDZ_TYPE, TAHFIDZ_STATUS, TASMI_STATUS } from "../constants.js";

// --- Tahfidz Record (Setoran Harian) ---

export const CreateTahfidzRecordSchema = z
  .object({
    studentId: z.string().uuid("ID siswa tidak valid"),
    teacherId: z.string().uuid("ID guru tidak valid").nullable().optional(),
    type: z.enum(TAHFIDZ_TYPE, {
      errorMap: () => ({ message: "Jenis setoran harus 'Z' (Ziyadah) atau 'M' (Muraja'ah)" }),
    }),
    juz: z.number().int().min(1, "Juz minimal 1").max(30, "Juz maksimal 30"),
    surah: z.number().int().min(1, "Nomor surah minimal 1").max(114, "Nomor surah maksimal 114"),
    ayahStart: z.number().int().min(1, "Ayat awal minimal 1"),
    ayahEnd: z.number().int().min(1, "Ayat akhir minimal 1"),
    tajwidScore: z.number().int().min(0, "Nilai tajwid 0-100").max(100, "Nilai tajwid 0-100"),
    makhrojScore: z.number().int().min(0, "Nilai makhroj 0-100").max(100, "Nilai makhroj 0-100"),
    fluencyScore: z.number().int().min(0, "Nilai kelancaran 0-100").max(100, "Nilai kelancaran 0-100"),
    status: z.enum(TAHFIDZ_STATUS, {
      errorMap: () => ({ message: "Status harus 'lulus' atau 'perlu_perbaikan'" }),
    }),
    notes: z.string().nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  })
  .refine((data) => data.ayahEnd >= data.ayahStart, {
    message: "Ayat akhir harus lebih besar atau sama dengan ayat awal",
    path: ["ayahEnd"],
  });

export const UpdateTahfidzRecordSchema = z
  .object({
    studentId: z.string().uuid("ID siswa tidak valid").optional(),
    teacherId: z.string().uuid("ID guru tidak valid").nullable().optional(),
    type: z.enum(TAHFIDZ_TYPE).optional(),
    juz: z.number().int().min(1).max(30).optional(),
    surah: z.number().int().min(1).max(114).optional(),
    ayahStart: z.number().int().min(1).optional(),
    ayahEnd: z.number().int().min(1).optional(),
    tajwidScore: z.number().int().min(0).max(100).optional(),
    makhrojScore: z.number().int().min(0).max(100).optional(),
    fluencyScore: z.number().int().min(0).max(100).optional(),
    status: z.enum(TAHFIDZ_STATUS).optional(),
    notes: z.string().nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
  })
  .refine(
    (data) => {
      if (data.ayahStart !== undefined && data.ayahEnd !== undefined) {
        return data.ayahEnd >= data.ayahStart;
      }
      return true;
    },
    {
      message: "Ayat akhir harus lebih besar atau sama dengan ayat awal",
      path: ["ayahEnd"],
    },
  );

export type CreateTahfidzRecordInput = z.infer<typeof CreateTahfidzRecordSchema>;
export type UpdateTahfidzRecordInput = z.infer<typeof UpdateTahfidzRecordSchema>;

export const TahfidzQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  studentId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  type: z.enum(TAHFIDZ_TYPE).optional(),
  juz: z.coerce.number().int().min(1).max(30).optional(),
  surah: z.coerce.number().int().min(1).max(114).optional(),
  status: z.enum(TAHFIDZ_STATUS).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type TahfidzQueryParams = z.infer<typeof TahfidzQuerySchema>;

// --- Tasmi' Exam ---

export const CreateTasmiExamSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid"),
  examinerId: z.string().uuid("ID penguji tidak valid").nullable().optional(),
  juz: z.number().int().min(1, "Juz minimal 1").max(30, "Juz maksimal 30"),
  tajwidScore: z.number().int().min(0, "Nilai tajwid 0-100").max(100, "Nilai tajwid 0-100"),
  makhrojScore: z.number().int().min(0, "Nilai makhroj 0-100").max(100, "Nilai makhroj 0-100"),
  fluencyScore: z.number().int().min(0, "Nilai kelancaran 0-100").max(100, "Nilai kelancaran 0-100"),
  finalScore: z.number().int().min(0, "Nilai akhir 0-100").max(100, "Nilai akhir 0-100").optional(),
  status: z.enum(TASMI_STATUS, {
    errorMap: () => ({ message: "Status harus 'lulus', 'tidak_lulus', atau 'perlu_perbaikan'" }),
  }),
  notes: z.string().nullable().optional(),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export const UpdateTasmiExamSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid").optional(),
  examinerId: z.string().uuid("ID penguji tidak valid").nullable().optional(),
  juz: z.number().int().min(1).max(30).optional(),
  tajwidScore: z.number().int().min(0).max(100).optional(),
  makhrojScore: z.number().int().min(0).max(100).optional(),
  fluencyScore: z.number().int().min(0).max(100).optional(),
  finalScore: z.number().int().min(0).max(100).optional(),
  status: z.enum(TASMI_STATUS).optional(),
  notes: z.string().nullable().optional(),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD").optional(),
});

export type CreateTasmiExamInput = z.infer<typeof CreateTasmiExamSchema>;
export type UpdateTasmiExamInput = z.infer<typeof UpdateTasmiExamSchema>;

export const TasmiQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  studentId: z.string().uuid().optional(),
  examinerId: z.string().uuid().optional(),
  juz: z.coerce.number().int().min(1).max(30).optional(),
  status: z.enum(TASMI_STATUS).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type TasmiQueryParams = z.infer<typeof TasmiQuerySchema>;
