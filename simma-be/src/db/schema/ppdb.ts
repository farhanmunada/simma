import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { academicYears } from "./setup";
import { students } from "./students";
import { users } from "./users";

export const ppdbApplicants = pgTable("ppdb_applicants", {
  id: uuid("id").defaultRandom().primaryKey(),
  registrationNumber: text("registration_number").notNull().unique(),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id, {
    onDelete: "set null",
  }),
  passwordHash: text("password_hash"),
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
  track: text("track").notNull().default("reguler"), // 'reguler' | 'prestasi' | 'afirmasi' | 'perpindahan_ortu'
  previousSchoolType: text("previous_school_type").notNull().default("MTs"),
  previousSchoolName: text("previous_school_name").notNull(),
  npsnOrigin: text("npsn_origin"),
  fatherName: text("father_name"),
  fatherPhone: text("father_phone"),
  fatherJob: text("father_job"),
  motherName: text("mother_name").notNull(),
  motherPhone: text("mother_phone"),
  motherJob: text("mother_job"),
  guardianName: text("guardian_name"),
  chosenMajor: text("chosen_major").notNull().default("MIPA"),
  tahfidzJuzCount: integer("tahfidz_juz_count"),
  achievementNotes: text("achievement_notes"),
  status: text("status").notNull().default("submitted"), // 'draft' | 'submitted' | 'verified' | 'accepted' | 'rejected' | 'enrolled'
  isFinalized: boolean("is_finalized").notNull().default(false),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  notes: text("notes"),
  documents: jsonb("documents").$type<Record<string, unknown>>().default({}),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "set null",
  }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ppdbDocuments = pgTable("ppdb_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => ppdbApplicants.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // 'pas_foto' | 'kartu_keluarga' | 'akta_kelahiran' | 'ijazah_skl' | 'rapor' | 'prestasi_tahfidz' | 'kip_pkh' | 'sptjm'
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), // 'pending' | 'valid' | 'invalid'
  verificationNotes: text("verification_notes"),
  verifiedBy: uuid("verified_by").references(() => users.id, {
    onDelete: "set null",
  }),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PpdbApplicant = typeof ppdbApplicants.$inferSelect;
export type NewPpdbApplicant = typeof ppdbApplicants.$inferInsert;
export type PpdbDocument = typeof ppdbDocuments.$inferSelect;
export type NewPpdbDocument = typeof ppdbDocuments.$inferInsert;
