import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { academicYears } from "./setup";
import { students } from "./students";

export const ppdbApplicants = pgTable("ppdb_applicants", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  nik: text("nik").notNull(),
  nisn: text("nisn"),
  birthPlace: text("birth_place").notNull(),
  birthDate: date("birth_date").notNull(),
  gender: text("gender").notNull(), // 'L' | 'P'
  religion: text("religion").notNull().default("Islam"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  previousSchoolType: text("previous_school_type").notNull().default("MTs"),
  previousSchoolName: text("previous_school_name").notNull(),
  npsnOrigin: text("npsn_origin"),
  fatherName: text("father_name"),
  fatherPhone: text("father_phone"),
  motherName: text("mother_name").notNull(),
  motherPhone: text("mother_phone"),
  guardianName: text("guardian_name"),
  chosenMajor: text("chosen_major").notNull().default("MIPA"),
  status: text("status").notNull().default("submitted"), // 'draft' | 'submitted' | 'verified' | 'accepted' | 'rejected' | 'enrolled'
  notes: text("notes"),
  documents: jsonb("documents").$type<Record<string, unknown>>().default({}),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "set null",
  }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpdbApplicant = typeof ppdbApplicants.$inferSelect;
export type NewPpdbApplicant = typeof ppdbApplicants.$inferInsert;
