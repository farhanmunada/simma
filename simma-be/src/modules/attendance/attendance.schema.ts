import { z } from "zod";

export * from "@simma/shared";

export const IdParamSchema = z.object({
  id: z.string().uuid("Format ID harus UUID yang valid"),
});
export type IdParamInput = z.infer<typeof IdParamSchema>;

export const StudentIdParamSchema = z.object({
  studentId: z.string().uuid("Format ID siswa harus UUID yang valid"),
});
export type StudentIdParamInput = z.infer<typeof StudentIdParamSchema>;

export const TeacherIdParamSchema = z.object({
  teacherId: z.string().uuid("Format ID guru harus UUID yang valid"),
});
export type TeacherIdParamInput = z.infer<typeof TeacherIdParamSchema>;

export const ClassroomDateParamSchema = z.object({
  classId: z.string().uuid("Format ID kelas harus UUID yang valid"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});
export type ClassroomDateParamInput = z.infer<typeof ClassroomDateParamSchema>;
