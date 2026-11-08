import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { teachers } from "./setup.js";
import type { TahfidzType, TahfidzStatus, TasmiStatus } from "@simma/shared";

export const tahfidzRecords = pgTable("tahfidz_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(), // FK referencing students(id) — students table created in students.ts
  teacherId: uuid("teacher_id").references(() => teachers.id, {
    onDelete: "set null",
  }),
  type: text("type").$type<TahfidzType>().notNull(), // 'Z' (ziyadah) | 'M' (muraja'ah)
  juz: integer("juz").notNull(), // 1 - 30
  surah: integer("surah").notNull(), // 1 - 114
  ayahStart: integer("ayah_start").notNull(),
  ayahEnd: integer("ayah_end").notNull(),
  tajwidScore: integer("tajwid_score").notNull(), // 0 - 100
  makhrojScore: integer("makhroj_score").notNull(), // 0 - 100
  fluencyScore: integer("fluency_score").notNull(), // 0 - 100
  status: text("status").$type<TahfidzStatus>().notNull(), // 'lulus' | 'perlu_perbaikan'
  notes: text("notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasmiExams = pgTable("tasmi_exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull(), // FK referencing students(id) — students table created in students.ts
  examinerId: uuid("examiner_id").references(() => teachers.id, {
    onDelete: "set null",
  }),
  juz: integer("juz").notNull(), // 1 - 30
  tajwidScore: integer("tajwid_score").notNull(), // 0 - 100
  makhrojScore: integer("makhroj_score").notNull(), // 0 - 100
  fluencyScore: integer("fluency_score").notNull(), // 0 - 100
  finalScore: integer("final_score").notNull(), // 0 - 100
  status: text("status").$type<TasmiStatus>().notNull(), // 'lulus' | 'tidak_lulus' | 'perlu_perbaikan'
  notes: text("notes"),
  examDate: date("exam_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TahfidzRecord = typeof tahfidzRecords.$inferSelect;
export type NewTahfidzRecord = typeof tahfidzRecords.$inferInsert;

export type TasmiExam = typeof tasmiExams.$inferSelect;
export type NewTasmiExam = typeof tasmiExams.$inferInsert;
