import { z } from "zod";
import {
  DAY_OF_WEEKS,
  SESSION_TYPES,
  SCHEDULE_STATUSES,
  ROOM_TYPES,
} from "../constants.js";

// Room Schemas
export const CreateScheduleRoomSchema = z.object({
  name: z.string().min(1, "Nama ruangan wajib diisi").max(100),
  code: z.string().min(1, "Kode ruangan wajib diisi").max(50),
  capacity: z.coerce.number().int().min(1).default(36),
  location: z.string().nullable().optional(),
  roomType: z.enum(ROOM_TYPES).default("teori"),
});

export const UpdateScheduleRoomSchema = CreateScheduleRoomSchema.partial();
export type CreateScheduleRoomInput = z.input<typeof CreateScheduleRoomSchema>;
export type UpdateScheduleRoomInput = z.input<typeof UpdateScheduleRoomSchema>;

// TimeSlot Schemas
export const ScheduleTimeSlotBaseSchema = z.object({
  name: z.string().min(1, "Nama slot jam wajib diisi").max(100),
  sessionType: z.enum(SESSION_TYPES).default("formal"),
  dayOfWeek: z.enum(DAY_OF_WEEKS),
  periodOrder: z.coerce.number().int().min(1).max(30),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM (contoh: 07:00)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM (contoh: 07:45)"),
  isTeachingTime: z.boolean().default(true),
});

export const CreateScheduleTimeSlotSchema = ScheduleTimeSlotBaseSchema.refine(
  (data) => data.startTime < data.endTime,
  {
    message: "Jam mulai harus lebih awal dari jam selesai",
    path: ["endTime"],
  },
);

export const UpdateScheduleTimeSlotSchema = ScheduleTimeSlotBaseSchema.partial();
export type CreateScheduleTimeSlotInput = z.input<typeof CreateScheduleTimeSlotSchema>;
export type UpdateScheduleTimeSlotInput = z.input<typeof UpdateScheduleTimeSlotSchema>;

// Schedule Plotting Schemas
export const CreateSchedulePlotSchema = z.object({
  academicYearId: z.string().uuid("ID Tahun Ajaran tidak valid"),
  semesterId: z.string().uuid("ID Semester tidak valid"),
  classroomId: z.string().uuid("ID Kelas tidak valid"),
  subjectId: z.string().uuid("ID Mapel tidak valid").nullable().optional(),
  teacherId: z.string().uuid("ID Guru tidak valid").nullable().optional(),
  roomId: z.string().uuid("ID Ruangan tidak valid").nullable().optional(),
  roomName: z.string().max(100).nullable().optional(),
  dayOfWeek: z.enum(DAY_OF_WEEKS),
  timeSlotId: z.string().uuid("ID Slot Jam tidak valid"),
  status: z.enum(SCHEDULE_STATUSES).default("published"),
  notes: z.string().max(255).nullable().optional(),
});

export const UpdateSchedulePlotSchema = CreateSchedulePlotSchema.partial();
export type CreateSchedulePlotInput = z.input<typeof CreateSchedulePlotSchema>;
export type UpdateSchedulePlotInput = z.input<typeof UpdateSchedulePlotSchema>;

// Collision Check Schema
export const CheckScheduleCollisionSchema = z.object({
  academicYearId: z.string().uuid("ID Tahun Ajaran tidak valid"),
  semesterId: z.string().uuid("ID Semester tidak valid"),
  classroomId: z.string().uuid("ID Kelas tidak valid"),
  dayOfWeek: z.enum(DAY_OF_WEEKS),
  timeSlotId: z.string().uuid("ID Slot Jam tidak valid"),
  teacherId: z.string().uuid("ID Guru tidak valid").nullable().optional(),
  roomId: z.string().uuid("ID Ruangan tidak valid").nullable().optional(),
  excludeScheduleId: z.string().uuid("ID Jadwal tidak valid").optional(),
});
export type CheckScheduleCollisionInput = z.input<typeof CheckScheduleCollisionSchema>;

// Query Filter Schema
export const ScheduleQueryFilterSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  classroomId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  dayOfWeek: z.enum(DAY_OF_WEEKS).optional(),
  sessionType: z.enum(SESSION_TYPES).optional(),
  status: z.enum(SCHEDULE_STATUSES).optional(),
});
export type ScheduleQueryFilterInput = z.input<typeof ScheduleQueryFilterSchema>;

// Batch Plot Schema
export const BatchSchedulePlotSchema = z.object({
  academicYearId: z.string().uuid(),
  semesterId: z.string().uuid(),
  plots: z.array(CreateSchedulePlotSchema).min(1, "Minimal 1 plot jadwal"),
});
export type BatchSchedulePlotInput = z.input<typeof BatchSchedulePlotSchema>;
