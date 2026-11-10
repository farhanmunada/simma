import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { academicYears, semesters, teachers, classrooms } from "./setup.js";
import { students } from "./students.js";
import { users } from "./users.js";
import type {
  P5raTheme,
  P5raFase,
  P5raStatus,
  P5raPredicate,
} from "@simma/shared";

export const p5raProjects = pgTable("p5ra_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  academicYearId: uuid("academic_year_id")
    .notNull()
    .references(() => academicYears.id, { onDelete: "cascade" }),
  semesterId: uuid("semester_id")
    .notNull()
    .references(() => semesters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  theme: text("theme").$type<P5raTheme>().notNull(),
  description: text("description").notNull(),
  targetFase: text("target_fase").$type<P5raFase>().notNull().default("E"),
  coordinatorTeacherId: uuid("coordinator_teacher_id").references(
    () => teachers.id,
    { onDelete: "set null" },
  ),
  status: text("status").$type<P5raStatus>().notNull().default("draft"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const p5raProjectClassrooms = pgTable(
  "p5ra_project_classrooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => p5raProjects.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("p5ra_proj_cls_idx").on(table.projectId, table.classroomId),
  ],
);

export const p5raProjectTargets = pgTable("p5ra_project_targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => p5raProjects.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  element: text("element").notNull(),
  subElement: text("sub_element").notNull(),
  targetDescription: text("target_description").notNull(),
  valuePra: text("value_pra").notNull(),
  subValuePra: text("sub_value_pra"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const p5raAssessments = pgTable(
  "p5ra_assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => p5raProjects.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => p5raProjectTargets.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    predicate: text("predicate").$type<P5raPredicate>().notNull(),
    notes: text("notes"),
    assessedBy: uuid("assessed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("p5ra_assessments_proj_target_student_idx").on(
      table.projectId,
      table.targetId,
      table.studentId,
    ),
  ],
);

export const p5raStudentNotes = pgTable(
  "p5ra_student_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => p5raProjects.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    processNotes: text("process_notes").notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("p5ra_student_notes_proj_student_idx").on(
      table.projectId,
      table.studentId,
    ),
  ],
);

export type P5raProject = typeof p5raProjects.$inferSelect;
export type NewP5raProject = typeof p5raProjects.$inferInsert;

export type P5raProjectClassroom = typeof p5raProjectClassrooms.$inferSelect;
export type NewP5raProjectClassroom = typeof p5raProjectClassrooms.$inferInsert;

export type P5raProjectTarget = typeof p5raProjectTargets.$inferSelect;
export type NewP5raProjectTarget = typeof p5raProjectTargets.$inferInsert;

export type P5raAssessment = typeof p5raAssessments.$inferSelect;
export type NewP5raAssessment = typeof p5raAssessments.$inferInsert;

export type P5raStudentNote = typeof p5raStudentNotes.$inferSelect;
export type NewP5raStudentNote = typeof p5raStudentNotes.$inferInsert;
