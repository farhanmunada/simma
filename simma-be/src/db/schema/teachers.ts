import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teachers, academicYears, semesters, classrooms, subjects } from "./setup";

export const teacherProfiles = pgTable("teacher_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" })
    .unique(),
  nip: text("nip"),
  pegId: text("peg_id"),
  nrg: text("nrg"),
  noKk: text("no_kk"),
  birthPlace: text("birth_place"),
  birthDate: date("birth_date"),
  gender: text("gender"),
  religion: text("religion").notNull().default("Islam"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  marriageStatus: text("marriage_status"),
  tmtFirst: date("tmt_first"),
  tmtPns: date("tmt_pns"),
  dutyStatus: text("duty_status").notNull().default("aktif"),
  gtkType: text("gtk_type").notNull().default("pendidik"),
  certificationField: text("certification_field"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherEducation = pgTable("teacher_education", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  institution: text("institution").notNull(),
  major: text("major").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  gpa: text("gpa"),
  certificateNumber: text("certificate_number"),
  isLinear: boolean("is_linear").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherRanks = pgTable("teacher_ranks", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  rank: text("rank").notNull(),
  gradeGroup: text("grade_group").notNull(),
  skNumber: text("sk_number").notNull(),
  skDate: date("sk_date").notNull(),
  tmtRank: date("tmt_rank").notNull(),
  salary: integer("salary"),
  nextPromotionDate: date("next_promotion_date"),
  nextKgbDate: date("next_kgb_date"),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherDocuments = pgTable("teacher_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  documentNumber: text("document_number"),
  issueDate: date("issue_date"),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type").default("application/pdf"),
  verificationStatus: text("verification_status").notNull().default("verified"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherWorkloads = pgTable("teacher_workloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  academicYearId: uuid("academic_year_id")
    .notNull()
    .references(() => academicYears.id, { onDelete: "cascade" }),
  semesterId: uuid("semester_id")
    .notNull()
    .references(() => semesters.id, { onDelete: "cascade" }),
  teachingJtm: integer("teaching_jtm").notNull().default(0),
  additionalDutyType: text("additional_duty_type").default("tidak_ada"),
  additionalDutyJtm: integer("additional_duty_jtm").notNull().default(0),
  totalJtm: integer("total_jtm").notNull().default(0),
  isEligibleTpg: boolean("is_eligible_tpg").notNull().default(false),
  simpatikaStatus: text("simpatika_status").notNull().default("layak"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherSubjectAssignments = pgTable(
  "teacher_subject_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("teacher_subject_assignments_unique_idx").on(
      table.teacherId,
      table.semesterId,
      table.classroomId,
      table.subjectId,
    ),
  ],
);

export const teacherClassroomScopes = pgTable(
  "teacher_classroom_scopes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    scopeType: text("scope_type").$type<"tahfidz" | "mutabaah" | "p5ra">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("teacher_classroom_scopes_unique_idx").on(
      table.teacherId,
      table.semesterId,
      table.classroomId,
      table.scopeType,
    ),
  ],
);

export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;
export type TeacherEducation = typeof teacherEducation.$inferSelect;
export type NewTeacherEducation = typeof teacherEducation.$inferInsert;
export type TeacherRankRecord = typeof teacherRanks.$inferSelect;
export type NewTeacherRankRecord = typeof teacherRanks.$inferInsert;
export type TeacherDocument = typeof teacherDocuments.$inferSelect;
export type NewTeacherDocument = typeof teacherDocuments.$inferInsert;
export type TeacherWorkload = typeof teacherWorkloads.$inferSelect;
export type NewTeacherWorkload = typeof teacherWorkloads.$inferInsert;
export type TeacherSubjectAssignment = typeof teacherSubjectAssignments.$inferSelect;
export type NewTeacherSubjectAssignment = typeof teacherSubjectAssignments.$inferInsert;
export type TeacherClassroomScope = typeof teacherClassroomScopes.$inferSelect;
export type NewTeacherClassroomScope = typeof teacherClassroomScopes.$inferInsert;
