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
