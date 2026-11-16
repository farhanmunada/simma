import { z } from "zod";

export * from "@simma/shared";

export const IdParamSchema = z.object({
  id: z.string().uuid("Format ID harus UUID yang valid"),
});
export type IdParamInput = z.infer<typeof IdParamSchema>;

export const AssessmentIdParamSchema = z.object({
  assessmentId: z.string().uuid("Format ID penilaian harus UUID yang valid"),
});
export type AssessmentIdParamInput = z.infer<typeof AssessmentIdParamSchema>;

export const StudentIdParamSchema = z.object({
  studentId: z.string().uuid("Format ID siswa harus UUID yang valid"),
});
export type StudentIdParamInput = z.infer<typeof StudentIdParamSchema>;

export const ClassroomIdParamSchema = z.object({
  classroomId: z.string().uuid("Format ID kelas harus UUID yang valid"),
});
export type ClassroomIdParamInput = z.infer<typeof ClassroomIdParamSchema>;
