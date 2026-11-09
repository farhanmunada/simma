import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { students } from "./students";
import { teachers } from "./setup";

// ==========================================
// 1. Master Klasifikasi Surat Kemenag (KMA 44/2010)
// ==========================================
export const letterClassifications = pgTable("letter_classifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(), // Contoh: PP.00.6, KP.00, KS.01, HM.00, OT.00
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 2. Agenda Surat Masuk (F-TU-01)
// ==========================================
export const incomingLetters = pgTable("incoming_letters", {
  id: uuid("id").defaultRandom().primaryKey(),
  agendaNumber: integer("agenda_number").notNull(),
  year: integer("year").notNull(),
  mailNumber: text("mail_number").notNull(),
  sender: text("sender").notNull(),
  mailDate: date("mail_date").notNull(),
  receivedDate: date("received_date").notNull(),
  subject: text("subject").notNull(),
  summary: text("summary"),
  classificationCode: text("classification_code").notNull(),
  classificationId: uuid("classification_id").references(() => letterClassifications.id, {
    onDelete: "set null",
  }),
  attachmentPath: text("attachment_path"),
  attachmentName: text("attachment_name"),
  status: text("status").notNull().default("waiting_disposition"), // waiting_disposition, disposed, completed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 3. Lembar Disposisi Kamad (F-TU-02)
// ==========================================
export const dispositions = pgTable("dispositions", {
  id: uuid("id").defaultRandom().primaryKey(),
  incomingLetterId: uuid("incoming_letter_id")
    .notNull()
    .references(() => incomingLetters.id, { onDelete: "cascade" }),
  disposedBy: uuid("disposed_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "set null" }),
  targetRole: text("target_role").notNull(),
  urgency: text("urgency").notNull().default("biasa"), // biasa, segera, sangat_segera
  instruction: text("instruction").notNull().default("tindak_lanjuti"), // tindak_lanjuti, tanggapi, hadiri, dll.
  notes: text("notes"),
  deadline: date("deadline"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  followUpNotes: text("follow_up_notes"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 4. Sekuens Penomoran Surat Keluar (F-TU-03)
// ==========================================
export const letterSequences = pgTable("letter_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  year: integer("year").notNull(),
  securityDegree: text("security_degree").notNull().default("B"),
  lastSequence: integer("last_sequence").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 5. Agenda & Surat Keluar Resmi (F-TU-04 s/d 10)
// ==========================================
export const outgoingLetters = pgTable("outgoing_letters", {
  id: uuid("id").defaultRandom().primaryKey(),
  letterNumber: text("letter_number").notNull().unique(), // B-001/Ma.13.04/PP.00.6/05/2026
  securityDegree: text("security_degree").notNull().default("B"), // B, R, SR
  sequenceNumber: integer("sequence_number").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  satkerCode: text("satker_code").notNull().default("Ma.13.04"),
  classificationCode: text("classification_code").notNull(),
  classificationId: uuid("classification_id").references(() => letterClassifications.id, {
    onDelete: "set null",
  }),
  letterDate: date("letter_date").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  signerName: text("signer_name").notNull(),
  signerNip: text("signer_nip"),
  signerRole: text("signer_role").notNull().default("Kepala Madrasah"),
  templateType: text("template_type").notNull().default("custom"), // custom, active_student, duty_teacher, skkb, parent_invitation
  studentId: uuid("student_id").references(() => students.id, { onDelete: "set null" }),
  teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  contentData: jsonb("content_data").$type<Record<string, unknown>>().default({}),
  verificationHash: text("verification_hash").notNull().unique(),
  attachmentPath: text("attachment_path"),
  status: text("status").notNull().default("signed"), // draft, signed, sent, archived
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// 6. Buku Ekspedisi Pengiriman Surat (F-TU-11)
// ==========================================
export const expeditionBooks = pgTable("expedition_books", {
  id: uuid("id").defaultRandom().primaryKey(),
  outgoingLetterId: uuid("outgoing_letter_id")
    .notNull()
    .references(() => outgoingLetters.id, { onDelete: "cascade" }),
  dispatchDate: date("dispatch_date").notNull(),
  courierName: text("courier_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientProof: text("recipient_proof"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LetterClassification = typeof letterClassifications.$inferSelect;
export type NewLetterClassification = typeof letterClassifications.$inferInsert;
export type IncomingLetter = typeof incomingLetters.$inferSelect;
export type NewIncomingLetter = typeof incomingLetters.$inferInsert;
export type Disposition = typeof dispositions.$inferSelect;
export type NewDisposition = typeof dispositions.$inferInsert;
export type LetterSequence = typeof letterSequences.$inferSelect;
export type NewLetterSequence = typeof letterSequences.$inferInsert;
export type OutgoingLetter = typeof outgoingLetters.$inferSelect;
export type NewOutgoingLetter = typeof outgoingLetters.$inferInsert;
export type ExpeditionBook = typeof expeditionBooks.$inferSelect;
export type NewExpeditionBook = typeof expeditionBooks.$inferInsert;
