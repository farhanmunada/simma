import { z } from "zod";
export {
  CreateScheduleRoomSchema,
  UpdateScheduleRoomSchema,
  ScheduleTimeSlotBaseSchema,
  CreateScheduleTimeSlotSchema,
  UpdateScheduleTimeSlotSchema,
  CreateSchedulePlotSchema,
  UpdateSchedulePlotSchema,
  CheckScheduleCollisionSchema,
  ScheduleQueryFilterSchema,
  BatchSchedulePlotSchema,
} from "@simma/shared";

export const ScheduleIdParamSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

export const ScheduleClassroomParamSchema = z.object({
  classroomId: z.string().uuid("ID Kelas tidak valid"),
});

export const ScheduleTeacherParamSchema = z.object({
  teacherId: z.string().uuid("ID Guru tidak valid"),
});

export const ScheduleRoomParamSchema = z.object({
  roomId: z.string().uuid("ID Ruangan tidak valid"),
});

export const MatrixQuerySchema = z.object({
  semesterId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
});

export const BatchCreateTimeSlotsSchema = z.object({
  slots: z.array(
    z.object({
      name: z.string().min(1),
      sessionType: z.enum(["formal", "diniyah", "istirahat", "sholat", "upacara"]).default("formal"),
      dayOfWeek: z.enum(["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "ahad"]),
      periodOrder: z.coerce.number().int().min(1),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isTeachingTime: z.boolean().default(true),
    }),
  ).min(1, "Minimal 1 slot"),
});

export const SchedulePdfQuerySchema = z.object({
  semesterId: z.string().uuid().optional(),
  viewType: z.enum(["classroom", "teacher", "room"]).default("classroom"),
  targetId: z.string().uuid("ID Target tidak valid"),
});
