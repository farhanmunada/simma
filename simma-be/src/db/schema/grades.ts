import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  subjects,
  classrooms,
  teachers,
  academicYears,
  semesters,
} from "./setup.js";
import { students } from "./students.js";
import type { GradeAssessmentType, LetterGrade } from "@simma/shared";

export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  classroomId: uuid("classroom_id")
    .notNull()
    .references(() => classrooms.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .references(() => teachers.id, { onDelete: "set null" }),
  academicYearId: uuid("academic_year_id")
    .notNull()
    .references(() => academicYears.id, { onDelete: "cascade" }),
  semesterId: uuid("semester_id")
    .notNull()
    .references(() => semesters.id, { onDelete: "cascade" }),
  type: text("type").$type<GradeAssessmentType>().notNull(), // 'harian', 'tugas', 'uts', 'uas'
  title: text("title").notNull(),
  maxScore: doublePrecision("max_score").notNull().default(100),
  weight: doublePrecision("weight").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentGrades = pgTable(
  "student_grades",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    score: doublePrecision("score").notNull(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("student_grades_assessment_student_idx").on(
      table.assessmentId,
      table.studentId,
    ),
  ],
);

// Alias matching ARCHITECTURE.md
export const grades = studentGrades;

export const semesterGrades = pgTable(
  "semester_grades",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    finalScore: doublePrecision("final_score").notNull(),
    letterGrade: text("letter_grade").$type<LetterGrade>().notNull(), // 'A', 'B', 'C', 'D'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("semester_grades_student_class_subject_semester_idx").on(
      table.studentId,
      table.classroomId,
      table.subjectId,
      table.semesterId,
    ),
  ],
);

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;

export type StudentGrade = typeof studentGrades.$inferSelect;
export type NewStudentGrade = typeof studentGrades.$inferInsert;

export type SemesterGrade = typeof semesterGrades.$inferSelect;
export type NewSemesterGrade = typeof semesterGrades.$inferInsert;
