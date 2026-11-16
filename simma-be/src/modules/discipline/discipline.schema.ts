import { z } from "zod";
export {
  CreateDisciplineRuleSchema,
  UpdateDisciplineRuleSchema,
  CreateStudentInfractionSchema,
  UpdateInfractionApprovalSchema,
  QueryStudentInfractionsSchema,
  CreateCounselingSessionSchema,
  UpdateCounselingSessionSchema,
  CreateParentSummonSchema,
  UpdateParentSummonSchema,
} from "@simma/shared";

export const DisciplineIdParamSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

export const StudentIdParamSchema = z.object({
  studentId: z.string().uuid("ID Siswa tidak valid"),
});

export const LeaderboardQuerySchema = z.object({
  classroomId: z.string().uuid().optional(),
  type: z.enum(["points_highest", "merits_highest"]).default("points_highest"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CounselingQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  counselorId: z.string().uuid().optional(),
  status: z.enum(["dijadwalkan", "berlangsung", "selesai", "tindak_lanjut"]).optional(),
  issueCategory: z.enum(["akademik", "kedisiplinan", "sosial_emosional", "karir_minat", "keluarga"]).optional(),
});

export const ParentSummonQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  sanctionLevel: z.enum(["normal", "teguran_lisan", "sp_1", "sp_2", "sp_3"]).optional(),
  status: z.enum(["terbit", "terkirim", "hadir", "selesai"]).optional(),
});
