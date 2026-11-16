import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teachers, academicYears } from "./setup";
import { students } from "./students";
import type {
  ExtracurricularCategory,
  ExtracurricularRole,
  ExtracurricularMemberStatus,
  ExtracurricularGradeScore,
} from "@simma/shared";

export const extracurriculars = pgTable(
  "extracurriculars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").$type<ExtracurricularCategory>().notNull(),
    coachId: uuid("coach_id").references(() => teachers.id, { onDelete: "set null" }),
    scheduleDay: text("schedule_day"),
    scheduleTime: text("schedule_time"),
    venue: text("venue"),
    maxCapacity: integer("max_capacity"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("extracurriculars_code_idx").on(table.code),
    index("extracurriculars_category_idx").on(table.category),
    index("extracurriculars_coach_idx").on(table.coachId),
    index("extracurriculars_is_active_idx").on(table.isActive),
  ]
);

export const extracurricularMembers = pgTable(
  "extracurricular_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    extracurricularId: uuid("extracurricular_id")
      .references(() => extracurriculars.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => students.id, { onDelete: "cascade" })
      .notNull(),
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id, { onDelete: "cascade" })
      .notNull(),
    semester: text("semester").notNull(), // 'ganjil' | 'genap'
    role: text("role").$type<ExtracurricularRole>().notNull().default("MEMBER"),
    joinedDate: text("joined_date").notNull(), // YYYY-MM-DD
    status: text("status").$type<ExtracurricularMemberStatus>().notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("extracurricular_members_student_idx").on(table.studentId),
    index("extracurricular_members_ekskul_idx").on(table.extracurricularId),
    index("extracurricular_members_period_idx").on(table.academicYearId, table.semester),
    uniqueIndex("extracurricular_members_unique_idx").on(
      table.extracurricularId,
      table.studentId,
      table.academicYearId,
      table.semester
    ),
  ]
);

export const extracurricularGrades = pgTable(
  "extracurricular_grades",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    extracurricularMemberId: uuid("extracurricular_member_id")
      .references(() => extracurricularMembers.id, { onDelete: "cascade" })
      .notNull(),
    academicYearId: uuid("academic_year_id")
      .references(() => academicYears.id, { onDelete: "cascade" })
      .notNull(),
    semester: text("semester").notNull(), // 'ganjil' | 'genap'
    score: text("score").$type<ExtracurricularGradeScore>().notNull(), // 'A' | 'B' | 'C' | 'D'
    notes: text("notes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("extracurricular_grades_member_idx").on(table.extracurricularMemberId),
    index("extracurricular_grades_period_idx").on(table.academicYearId, table.semester),
    uniqueIndex("extracurricular_grades_unique_idx").on(
      table.extracurricularMemberId,
      table.academicYearId,
      table.semester
    ),
  ]
);

export type ExtracurricularRow = typeof extracurriculars.$inferSelect;
export type NewExtracurricularRow = typeof extracurriculars.$inferInsert;
export type ExtracurricularMemberRow = typeof extracurricularMembers.$inferSelect;
export type NewExtracurricularMemberRow = typeof extracurricularMembers.$inferInsert;
export type ExtracurricularGradeRow = typeof extracurricularGrades.$inferSelect;
export type NewExtracurricularGradeRow = typeof extracurricularGrades.$inferInsert;
