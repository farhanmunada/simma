import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { students } from "./students.js";
import { classrooms, teachers } from "./setup.js";
import type {
  StudentAttendanceStatus,
  TeacherAttendanceStatus,
} from "@simma/shared";

export const attendanceStudents = pgTable(
  "attendance_students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: text("status").$type<StudentAttendanceStatus>().notNull(),
    note: text("note"),
    teacherId: uuid("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_students_student_classroom_date_idx").on(
      table.studentId,
      table.classroomId,
      table.date,
    ),
  ],
);

export const attendanceTeachers = pgTable(
  "attendance_teachers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: text("status").$type<TeacherAttendanceStatus>().notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("attendance_teachers_teacher_date_idx").on(
      table.teacherId,
      table.date,
    ),
  ],
);

export type AttendanceStudent = typeof attendanceStudents.$inferSelect;
export type NewAttendanceStudent = typeof attendanceStudents.$inferInsert;

export type AttendanceTeacher = typeof attendanceTeachers.$inferSelect;
export type NewAttendanceTeacher = typeof attendanceTeachers.$inferInsert;
