import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { academicYears, semesters, classrooms, subjects, teachers } from "./setup";
import type {
  DayOfWeek,
  SessionType,
  ScheduleStatus,
  RoomType,
} from "@simma/shared";

export const scheduleRooms = pgTable("schedule_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  capacity: integer("capacity").notNull().default(36),
  location: text("location"),
  roomType: text("room_type").$type<RoomType>().notNull().default("teori"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scheduleTimeSlots = pgTable(
  "schedule_time_slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    sessionType: text("session_type").$type<SessionType>().notNull().default("formal"),
    dayOfWeek: text("day_of_week").$type<DayOfWeek>().notNull(),
    periodOrder: integer("period_order").notNull(),
    startTime: text("start_time").notNull(), // HH:MM
    endTime: text("end_time").notNull(),     // HH:MM
    isTeachingTime: boolean("is_teaching_time").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("schedule_time_slots_day_order_idx").on(
      table.dayOfWeek,
      table.periodOrder,
    ),
    index("schedule_time_slots_day_idx").on(table.dayOfWeek),
  ],
);

export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    teacherId: uuid("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    roomId: uuid("room_id").references(() => scheduleRooms.id, {
      onDelete: "set null",
    }),
    roomName: text("room_name"),
    dayOfWeek: text("day_of_week").$type<DayOfWeek>().notNull(),
    timeSlotId: uuid("time_slot_id")
      .notNull()
      .references(() => scheduleTimeSlots.id, { onDelete: "cascade" }),
    status: text("status").$type<ScheduleStatus>().notNull().default("published"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Unique: Satu rombel hanya boleh punya 1 jadwal di slot jam & hari yang sama
    uniqueIndex("schedules_classroom_slot_unique_idx").on(
      table.semesterId,
      table.classroomId,
      table.dayOfWeek,
      table.timeSlotId,
    ),
    index("schedules_semester_classroom_idx").on(table.semesterId, table.classroomId),
    index("schedules_semester_teacher_idx").on(table.semesterId, table.teacherId),
    index("schedules_semester_room_idx").on(table.semesterId, table.roomId),
    index("schedules_day_slot_idx").on(table.dayOfWeek, table.timeSlotId),
  ],
);

export type ScheduleRoom = typeof scheduleRooms.$inferSelect;
export type NewScheduleRoom = typeof scheduleRooms.$inferInsert;

export type ScheduleTimeSlot = typeof scheduleTimeSlots.$inferSelect;
export type NewScheduleTimeSlot = typeof scheduleTimeSlots.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
