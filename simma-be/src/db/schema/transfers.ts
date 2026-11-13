import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { students } from "./students";
import { classrooms, academicYears } from "./setup";

export const studentTransfers = pgTable(
  "student_transfers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // 'masuk' | 'keluar'
    referenceNumber: text("reference_number").notNull().unique(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    transferDate: date("transfer_date").notNull(),

    // Mutasi Keluar
    destinationSchool: text("destination_school"),
    reason: text("reason"),
    approvalNotes: text("approval_notes"),
    approvedById: uuid("approved_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    verificationCode: text("verification_code"),

    // Mutasi Masuk
    originSchool: text("origin_school"),
    originLetterNumber: text("origin_letter_number"),
    originNpsn: text("origin_npsn"),
    previousClassLevel: integer("previous_class_level").default(10),
    targetClassroomId: uuid("target_classroom_id").references(
      () => classrooms.id,
      { onDelete: "set null" }
    ),
    stambukNumber: text("stambuk_number"),

    notes: text("notes"),
    createdById: uuid("created_by_id").references(() => users.id, {
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
    uniqueIndex("student_transfers_ref_idx").on(table.referenceNumber),
  ]
);

export const transferClearances = pgTable("transfer_clearances", {
  id: uuid("id").defaultRandom().primaryKey(),
  transferId: uuid("transfer_id")
    .notNull()
    .references(() => studentTransfers.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),

  libraryCleared: boolean("library_cleared").notNull().default(false),
  libraryClearedById: uuid("library_cleared_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  libraryClearedAt: timestamp("library_cleared_at", { withTimezone: true }),
  libraryNotes: text("library_notes"),

  financeCleared: boolean("finance_cleared").notNull().default(false),
  financeClearedById: uuid("finance_cleared_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  financeClearedAt: timestamp("finance_cleared_at", { withTimezone: true }),
  financeNotes: text("finance_notes"),

  disciplineCleared: boolean("discipline_cleared").notNull().default(false),
  disciplineClearedById: uuid("discipline_cleared_by_id").references(
    () => users.id,
    { onDelete: "set null" }
  ),
  disciplineClearedAt: timestamp("discipline_cleared_at", { withTimezone: true }),
  disciplineNotes: text("discipline_notes"),

  status: text("status").notNull().default("pending"), // 'pending' | 'cleared' | 'rejected'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const studentGraduations = pgTable(
  "student_graduations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    academicYearId: uuid("academic_year_id")
      .notNull()
      .references(() => academicYears.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classroomId: uuid("classroom_id").references(() => classrooms.id, {
      onDelete: "set null",
    }),
    graduationStatus: text("graduation_status").notNull().default("lulus"), // 'lulus' | 'tidak_lulus' | 'ditunda'
    graduationDate: date("graduation_date").notNull(),
    certificateNumber: text("certificate_number"),
    sklNumber: text("skl_number"),
    notes: text("notes"),
    createdById: uuid("created_by_id").references(() => users.id, {
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
    uniqueIndex("student_graduations_year_student_idx").on(
      table.academicYearId,
      table.studentId
    ),
  ]
);

export type StudentTransferRow = typeof studentTransfers.$inferSelect;
export type NewStudentTransferRow = typeof studentTransfers.$inferInsert;

export type TransferClearanceRow = typeof transferClearances.$inferSelect;
export type NewTransferClearanceRow = typeof transferClearances.$inferInsert;

export type StudentGraduationRow = typeof studentGraduations.$inferSelect;
export type NewStudentGraduationRow = typeof studentGraduations.$inferInsert;
