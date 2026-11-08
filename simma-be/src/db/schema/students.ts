import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { classrooms } from "./setup.js";

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  nik: text("nik").notNull().unique(),
  nisn: text("nisn").unique(),
  nis: text("nis"),
  fullName: text("full_name").notNull(),
  birthPlace: text("birth_place").notNull(),
  birthDate: date("birth_date").notNull(),
  gender: text("gender").notNull(), // 'L' | 'P'
  motherName: text("mother_name").notNull(),
  status: text("status").notNull().default("aktif"),
  photoPath: text("photo_path"),
  emisData: jsonb("emis_data").$type<Record<string, unknown>>().default({}),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const parents = pgTable("parents", {
  id: uuid("id").defaultRandom().primaryKey(),
  nik: text("nik"),
  name: text("name").notNull(),
  birthPlace: text("birth_place"),
  birthDate: date("birth_date"),
  gender: text("gender"),
  education: text("education"),
  occupation: text("occupation"),
  income: text("income"),
  phone: text("phone"),
  address: text("address"),
  emisData: jsonb("emis_data").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentParents = pgTable("student_parents", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parents.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull(), // 'ayah', 'ibu', 'wali'
  isGuardian: boolean("is_guardian").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classStudents = pgTable(
  "class_students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    nisInClass: text("nis_in_class"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("class_students_classroom_student_idx").on(
      table.classroomId,
      table.studentId,
    ),
  ],
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;

export type StudentParent = typeof studentParents.$inferSelect;
export type NewStudentParent = typeof studentParents.$inferInsert;

export type ClassStudent = typeof classStudents.$inferSelect;
export type NewClassStudent = typeof classStudents.$inferInsert;
