import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const institutions = pgTable("institutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  nsm: text("nsm").notNull(),
  npsn: text("npsn").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("swasta"),
  address: text("address").notNull(),
  logoPath: text("logo_path"),
  emisData: jsonb("emis_data").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const academicYears = pgTable("academic_years", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const semesters = pgTable("semesters", {
  id: uuid("id").defaultRandom().primaryKey(),
  academicYearId: uuid("academic_year_id")
    .notNull()
    .references(() => academicYears.id, { onDelete: "cascade" }),
  type: integer("type").notNull(), // 1 or 2
  isActive: boolean("is_active").notNull().default(false),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  positionId: uuid("position_id").references(() => positions.id, { onDelete: "set null" }),
  nik: text("nik").notNull().unique(),
  nuptk: text("nuptk"),
  fullName: text("full_name").notNull(),
  employmentType: text("employment_type").notNull(), // PNS, PPPK, GTY, GTT
  certification: text("certification"),
  emisData: jsonb("emis_data").$type<Record<string, unknown>>().default({}),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Pendidik"), // Pendidik, Tenaga Kependidikan
  isLeadership: boolean("is_leadership").notNull().default(false),
  allowance: integer("allowance").notNull().default(0),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classrooms = pgTable("classrooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  semesterId: uuid("semester_id")
    .notNull()
    .references(() => semesters.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  gradeLevel: integer("grade_level").notNull(),
  homeroomTeacherId: uuid("homeroom_teacher_id").references(() => teachers.id, {
    onDelete: "set null",
  }),
  capacity: integer("capacity").notNull().default(36),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  group: text("group").notNull(),
  jpPerWeek: integer("jp_per_week").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  phase: text("phase").notNull(), // E, F
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Institution = typeof institutions.$inferSelect;
export type NewInstitution = typeof institutions.$inferInsert;

export type AcademicYear = typeof academicYears.$inferSelect;
export type NewAcademicYear = typeof academicYears.$inferInsert;

export type Semester = typeof semesters.$inferSelect;
export type NewSemester = typeof semesters.$inferInsert;

export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

export type Classroom = typeof classrooms.$inferSelect;
export type NewClassroom = typeof classrooms.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
