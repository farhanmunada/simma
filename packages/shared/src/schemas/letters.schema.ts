import { z } from "zod";
import {
  LETTER_SECURITY_DEGREES,
  DISPOSITION_URGENCY,
  DISPOSITION_INSTRUCTIONS,
  DISPOSITION_STATUS,
  INCOMING_LETTER_STATUS,
  OUTGOING_LETTER_STATUS,
  LETTER_TEMPLATE_TYPES,
} from "../constants.js";

// ==========================================
// 1. Klasifikasi Surat (KMA 44/2010)
// ==========================================
export const LetterClassificationSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1, "Kode klasifikasi wajib diisi"),
  name: z.string().min(1, "Nama klasifikasi wajib diisi"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

export const CreateLetterClassificationSchema = z.object({
  code: z.string().min(1, "Kode klasifikasi wajib diisi"),
  name: z.string().min(1, "Nama klasifikasi wajib diisi"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const LetterClassificationQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ==========================================
// 2. Agenda Surat Masuk (F-TU-01)
// ==========================================
export const CreateIncomingLetterSchema = z.object({
  mailNumber: z.string().min(1, "Nomor surat pengirim wajib diisi"),
  sender: z.string().min(1, "Asal pengirim wajib diisi"),
  mailDate: z.string().min(1, "Tanggal surat wajib diisi"),
  receivedDate: z.string().min(1, "Tanggal diterima wajib diisi"),
  subject: z.string().min(1, "Perihal surat wajib diisi"),
  summary: z.string().optional(),
  classificationCode: z.string().min(1, "Kode klasifikasi wajib diisi"),
  classificationId: z.string().uuid().optional(),
  attachmentPath: z.string().optional(),
  attachmentName: z.string().optional(),
});

export const UpdateIncomingLetterSchema = CreateIncomingLetterSchema.partial().extend({
  status: z.enum(INCOMING_LETTER_STATUS).optional(),
});

export const IncomingLetterQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(INCOMING_LETTER_STATUS).optional(),
  year: z.coerce.number().optional(),
  classificationCode: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ==========================================
// 3. Lembar Disposisi Digital Kamad (F-TU-02)
// ==========================================
export const CreateDispositionSchema = z.object({
  incomingLetterId: z.string().uuid("ID surat masuk wajib valid"),
  disposedBy: z.string().default("Kepala Madrasah"),
  targetUserId: z.string().uuid().optional(),
  targetRole: z.string().min(1, "Target disposisi wajib diisi"),
  urgency: z.enum(DISPOSITION_URGENCY).default("biasa"),
  instruction: z.enum(DISPOSITION_INSTRUCTIONS).default("tindak_lanjuti"),
  notes: z.string().optional(),
  deadline: z.string().optional(),
});

export const UpdateDispositionStatusSchema = z.object({
  status: z.enum(DISPOSITION_STATUS),
  followUpNotes: z.string().optional(),
});

// ==========================================
// 4. Agenda & Penomoran Surat Keluar (F-TU-03 & 04)
// ==========================================
export const CreateOutgoingLetterSchema = z.object({
  securityDegree: z.enum(LETTER_SECURITY_DEGREES).default("B"),
  classificationCode: z.string().min(1, "Kode klasifikasi wajib diisi"),
  satkerCode: z.string().default("Ma.13.04"),
  letterDate: z.string().min(1, "Tanggal surat wajib diisi"),
  recipient: z.string().min(1, "Tujuan penerima surat wajib diisi"),
  subject: z.string().min(1, "Perihal surat wajib diisi"),
  signerName: z.string().min(1, "Nama penandatangan wajib diisi"),
  signerNip: z.string().optional(),
  signerRole: z.string().default("Kepala Madrasah"),
  templateType: z.enum(LETTER_TEMPLATE_TYPES).default("custom"),
  studentId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  contentData: z.record(z.unknown()).optional(),
  attachmentPath: z.string().optional(),
  status: z.enum(OUTGOING_LETTER_STATUS).default("signed"),
});

export const OutgoingLetterQuerySchema = z.object({
  search: z.string().optional(),
  templateType: z.enum(LETTER_TEMPLATE_TYPES).optional(),
  status: z.enum(OUTGOING_LETTER_STATUS).optional(),
  year: z.coerce.number().optional(),
  classificationCode: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ==========================================
// 5. Generator Surat Spesifik (F-TU-06 s/d 09)
// ==========================================
export const GenerateStudentLetterSchema = z.object({
  studentId: z.string().uuid("ID Siswa wajib valid"),
  purpose: z.string().min(3, "Tujuan/keperluan surat wajib diisi"),
  classificationCode: z.string().default("PP.00.6"),
  signerName: z.string().default("H. Ahmad Syarif, M.Pd.I"),
  signerNip: z.string().default("197508152003121002"),
  signerRole: z.string().default("Kepala Madrasah"),
});

export const GenerateTeacherDutyLetterSchema = z.object({
  teacherId: z.string().uuid("ID Guru/GTK wajib valid"),
  assignmentName: z.string().min(3, "Nama tugas dinas wajib diisi"),
  destination: z.string().min(2, "Tempat pelaksanaan tugas wajib diisi"),
  startDate: z.string().min(1, "Tanggal mulai dinas wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai dinas wajib diisi"),
  transportation: z.string().default("Kendaraan Dinas / Umum"),
  budgetSource: z.string().default("DIPA Madrasah Aliyah"),
  classificationCode: z.string().default("KP.00"),
  signerName: z.string().default("H. Ahmad Syarif, M.Pd.I"),
  signerNip: z.string().default("197508152003121002"),
  signerRole: z.string().default("Kepala Madrasah"),
});

export const GenerateParentInvitationSchema = z.object({
  classroomId: z.string().uuid().optional(),
  gradeLevel: z.coerce.number().optional(),
  eventName: z.string().min(3, "Nama acara / agenda pertemuan wajib diisi"),
  eventDate: z.string().min(1, "Hari & tanggal acara wajib diisi"),
  eventTime: z.string().min(1, "Waktu acara wajib diisi"),
  eventLocation: z.string().min(2, "Tempat acara wajib diisi"),
  agenda: z.string().min(3, "Isi susunan acara wajib diisi"),
  classificationCode: z.string().default("HM.00"),
  signerName: z.string().default("H. Ahmad Syarif, M.Pd.I"),
  signerNip: z.string().default("197508152003121002"),
  signerRole: z.string().default("Kepala Madrasah"),
});

// ==========================================
// 6. Buku Ekspedisi Pengiriman Surat (F-TU-11)
// ==========================================
export const CreateExpeditionSchema = z.object({
  outgoingLetterId: z.string().uuid("ID Surat keluar wajib valid"),
  dispatchDate: z.string().min(1, "Tanggal kirim wajib diisi"),
  courierName: z.string().min(1, "Nama kurir / ekspedisi wajib diisi"),
  recipientName: z.string().min(1, "Nama penerima dinas wajib diisi"),
  recipientProof: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateExpeditionSchema = CreateExpeditionSchema.partial();

export const ExpeditionQuerySchema = z.object({
  search: z.string().optional(),
  outgoingLetterId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const UpdateIncomingLetterStatusSchema = z.object({
  status: z.enum(INCOMING_LETTER_STATUS),
});

export const UpdateOutgoingLetterStatusSchema = z.object({
  status: z.enum(OUTGOING_LETTER_STATUS),
});

export const GenerateStudentActiveLetterSchema = GenerateStudentLetterSchema;
export const GenerateStudentBehaviorLetterSchema = GenerateStudentLetterSchema;
export const GenerateParentInvitationLetterSchema = GenerateParentInvitationSchema;
export const CreateExpeditionBookSchema = CreateExpeditionSchema;
export const UpdateExpeditionBookSchema = UpdateExpeditionSchema;
export const VerifyLetterHashSchema = z.object({
  hash: z.string().min(1, "Hash verifikasi wajib diisi"),
});

// Re-export enums and types for direct import from letters.schema
export {
  LETTER_SECURITY_DEGREES,
  DISPOSITION_URGENCY,
  DISPOSITION_INSTRUCTIONS,
  DISPOSITION_STATUS,
  INCOMING_LETTER_STATUS,
  OUTGOING_LETTER_STATUS,
  LETTER_TEMPLATE_TYPES,
  DEFAULT_SATKER_CODE,
  DELIVERY_METHODS,
  LETTER_URGENCIES,
  LETTER_STATUSES,
} from "../constants.js";

export type {
  LetterSecurityDegree,
  DispositionUrgency,
  DispositionInstruction,
  DispositionStatus,
  IncomingLetterStatus,
  OutgoingLetterStatus,
  LetterTemplateType,
  DeliveryMethod,
  LetterUrgency,
  LetterStatus,
} from "../constants.js";

// Type inference using z.infer
export type LetterClassification = z.infer<typeof LetterClassificationSchema>;
export type CreateLetterClassificationInput = z.infer<typeof CreateLetterClassificationSchema>;
export type CreateClassificationInput = CreateLetterClassificationInput;
export type LetterClassificationQueryInput = z.infer<typeof LetterClassificationQuerySchema>;

export type CreateIncomingLetterInput = z.infer<typeof CreateIncomingLetterSchema>;
export type UpdateIncomingLetterInput = z.infer<typeof UpdateIncomingLetterSchema>;
export type UpdateIncomingLetterStatusInput = z.infer<typeof UpdateIncomingLetterStatusSchema>;
export type IncomingLetterQueryInput = z.infer<typeof IncomingLetterQuerySchema>;

export type CreateDispositionInput = z.infer<typeof CreateDispositionSchema>;
export type UpdateDispositionStatusInput = z.infer<typeof UpdateDispositionStatusSchema>;

export type CreateOutgoingLetterInput = z.infer<typeof CreateOutgoingLetterSchema>;
export type OutgoingLetterQueryInput = z.infer<typeof OutgoingLetterQuerySchema>;
export type UpdateOutgoingLetterStatusInput = z.infer<typeof UpdateOutgoingLetterStatusSchema>;

export type GenerateStudentLetterInput = z.infer<typeof GenerateStudentLetterSchema>;
export type GenerateStudentActiveLetterInput = z.infer<typeof GenerateStudentActiveLetterSchema>;
export type GenerateStudentBehaviorLetterInput = z.infer<typeof GenerateStudentBehaviorLetterSchema>;
export type GenerateTeacherDutyLetterInput = z.infer<typeof GenerateTeacherDutyLetterSchema>;
export type GenerateParentInvitationLetterInput = z.infer<typeof GenerateParentInvitationLetterSchema>;

export type CreateExpeditionSchemaInput = z.infer<typeof CreateExpeditionSchema>;
export type CreateExpeditionBookInput = z.infer<typeof CreateExpeditionBookSchema>;
export type UpdateExpeditionBookInput = z.infer<typeof UpdateExpeditionBookSchema>;
export type ExpeditionQueryInput = z.infer<typeof ExpeditionQuerySchema>;
export type VerifyLetterHashInput = z.infer<typeof VerifyLetterHashSchema>;

