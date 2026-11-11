// RBAC roles matching PRD Section 2.1
export const ROLES = [
  "super_admin",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "waka_sarpras",
  "guru",
  "guru_mapel",
  "wali_kelas",
  "guru_tahfidz",
  "pembina_ekskul",
  "admin_tu",
  "bendahara",
  "calon_siswa",
] as const;

export type Role = (typeof ROLES)[number];

// Attendance status
export const ATTENDANCE_STATUS = ["H", "S", "I", "A", "T"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

export const STUDENT_ATTENDANCE_STATUS = [
  "hadir",
  "izin",
  "sakit",
  "alpa",
] as const;
export type StudentAttendanceStatus = (typeof STUDENT_ATTENDANCE_STATUS)[number];

export const TEACHER_ATTENDANCE_STATUS = [
  "hadir",
  "izin",
  "sakit",
  "alpa",
  "dinas_luar",
] as const;
export type TeacherAttendanceStatus = (typeof TEACHER_ATTENDANCE_STATUS)[number];

// Semester type
export const SEMESTER_TYPE = [1, 2] as const;
export type SemesterType = (typeof SEMESTER_TYPE)[number];

// Assessment type (Kurikulum Merdeka)
export const ASSESSMENT_TYPE = ["SLM", "SAS"] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPE)[number];

// Academic assessment types (Harian, Tugas, UTS, UAS)
export const GRADE_ASSESSMENT_TYPES = ["harian", "tugas", "uts", "uas"] as const;
export type GradeAssessmentType = (typeof GRADE_ASSESSMENT_TYPES)[number];

// Letter grades
export const LETTER_GRADES = ["A", "B", "C", "D"] as const;
export type LetterGrade = (typeof LETTER_GRADES)[number];

export function calculateLetterGrade(score: number): LetterGrade {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

// Tahfidz type: Ziyadah (new memorization) / Muraja'ah (review)
export const TAHFIDZ_TYPE = ["Z", "M"] as const;
export type TahfidzType = (typeof TAHFIDZ_TYPE)[number];

// Tahfidz status: Lulus / Perlu Perbaikan
export const TAHFIDZ_STATUS = ["lulus", "perlu_perbaikan"] as const;
export type TahfidzStatus = (typeof TAHFIDZ_STATUS)[number];

// Tasmi' exam status: Lulus / Tidak Lulus / Perlu Perbaikan
export const TASMI_STATUS = ["lulus", "tidak_lulus", "perlu_perbaikan"] as const;
export type TasmiStatus = (typeof TASMI_STATUS)[number];

// Gender
export const GENDER = ["L", "P"] as const;
export type Gender = (typeof GENDER)[number];

// Grade submission status
export const GRADE_STATUS = ["draft", "submitted"] as const;
export type GradeStatus = (typeof GRADE_STATUS)[number];

// Student status
export const STUDENT_STATUS = [
  "aktif",
  "tidak_aktif",
  "aktif_tanpa_rombel",
  "lulus",
  "mutasi_keluar",
  "do",
] as const;
export type StudentStatus = (typeof STUDENT_STATUS)[number];

// Parent relation type
export const PARENT_RELATION_TYPE = ["ayah", "ibu", "wali"] as const;
export type ParentRelationType = (typeof PARENT_RELATION_TYPE)[number];

// Letters & Correspondence (Modul 03 - Tata Usaha)
export const LETTER_SECURITY_DEGREES = ["B", "R", "SR"] as const;
export type LetterSecurityDegree = (typeof LETTER_SECURITY_DEGREES)[number];

export const DISPOSITION_URGENCY = ["biasa", "segera", "sangat_segera"] as const;
export type DispositionUrgency = (typeof DISPOSITION_URGENCY)[number];

export const DISPOSITION_INSTRUCTIONS = [
  "tindak_lanjuti",
  "tanggapi",
  "hadiri",
  "koordinasikan",
  "arsipkan",
  "lainnya",
] as const;
export type DispositionInstruction = (typeof DISPOSITION_INSTRUCTIONS)[number];

export const DISPOSITION_STATUS = [
  "pending",
  "in_progress",
  "completed",
] as const;
export type DispositionStatus = (typeof DISPOSITION_STATUS)[number];

export const INCOMING_LETTER_STATUS = [
  "waiting_disposition",
  "disposed",
  "completed",
] as const;
export type IncomingLetterStatus = (typeof INCOMING_LETTER_STATUS)[number];

export const OUTGOING_LETTER_STATUS = [
  "draft",
  "signed",
  "sent",
  "archived",
] as const;
export type OutgoingLetterStatus = (typeof OUTGOING_LETTER_STATUS)[number];

export const LETTER_TEMPLATE_TYPES = [
  "custom",
  "active_student",
  "duty_teacher",
  "skkb",
  "parent_invitation",
] as const;
export type LetterTemplateType = (typeof LETTER_TEMPLATE_TYPES)[number];

export const DEFAULT_SATKER_CODE = "Ma.13.04";

// Delivery Methods & Urgency aliases
export const DELIVERY_METHODS = ["kurir", "pos", "email", "langsung", "lainnya"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const LETTER_URGENCIES = DISPOSITION_URGENCY;
export type LetterUrgency = DispositionUrgency;

export const LETTER_STATUSES = [
  ...INCOMING_LETTER_STATUS,
  ...OUTGOING_LETTER_STATUS,
  ...DISPOSITION_STATUS,
] as const;
export type LetterStatus = IncomingLetterStatus | OutgoingLetterStatus | DispositionStatus;

// Modul 10 - P5RA (Profil Pelajar Pancasila & Rahmatan Lil 'Alamin)
export const P5RA_THEMES = [
  "Gaya Hidup Berkelanjutan",
  "Kearifan Lokal",
  "Bhinneka Tunggal Ika",
  "Bangunlah Jiwa dan Raganya",
  "Suara Demokrasi",
  "Rekayasa & Teknologi",
  "Kewirausahaan",
  "Kebekerjaan",
] as const;
export type P5raTheme = (typeof P5RA_THEMES)[number];

export const P5RA_FASES = ["E", "F"] as const;
export type P5raFase = (typeof P5RA_FASES)[number];

export const P5RA_STATUSES = ["draft", "active", "completed"] as const;
export type P5raStatus = (typeof P5RA_STATUSES)[number];

export const P5RA_DIMENSIONS = [
  "Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia",
  "Berkebhinekaan Global",
  "Bergotong Royong",
  "Mandiri",
  "Bernalar Kritis",
  "Kreatif",
] as const;
export type P5raDimension = (typeof P5RA_DIMENSIONS)[number];

export const P5RA_VALUES = [
  "Berkeadaban (Ta'addub)",
  "Keteladanan (Qudwah)",
  "Kewarganegaraan dan Kebangsaan (Muwathanah)",
  "Mengambil Jalan Tengah (Tawassuth)",
  "Berimbang (Tawazun)",
  "Lurus dan Tegas (I'tidal)",
  "Kesetaraan (Musawah)",
  "Musyawarah (Syura)",
  "Toleransi (Tasamuh)",
  "Dinamis dan Inovatif (Tathawwur wa Ibtikar)",
] as const;
export type P5raValue = (typeof P5RA_VALUES)[number];

export const P5RA_PREDICATES = ["MB", "SB", "BSH", "SAB"] as const;
export type P5raPredicate = (typeof P5RA_PREDICATES)[number];

export const P5RA_PREDICATE_LABELS: Record<P5raPredicate, string> = {
  MB: "Mulai Berkembang",
  SB: "Sedang Berkembang",
  BSH: "Berkembang Sesuai Harapan",
  SAB: "Sangat Berkembang",
};

// Mutaba'ah Yaumiyah (Modul 11 - Ibadah Harian Santri)
export const MUTABAAH_ACTIVITY_CATEGORIES = [
  "fardhu",
  "sunnah",
  "quran",
  "dzikir",
  "kajian",
] as const;
export type MutabaahActivityCategory =
  (typeof MUTABAAH_ACTIVITY_CATEGORIES)[number];

export const MUTABAAH_ENTRY_STATUSES = [
  "terlaksana",
  "masbuk",
  "uzur",
  "tidak_terlaksana",
] as const;
export type MutabaahEntryStatus = (typeof MUTABAAH_ENTRY_STATUSES)[number];

export const MUTABAAH_UZUR_TYPES = [
  "haidh",
  "sakit",
  "nifas",
  "lainnya",
] as const;
export type MutabaahUzurType = (typeof MUTABAAH_UZUR_TYPES)[number];

export const MUTABAAH_COMPLIANCE_STATUS = [
  "istiqamah",
  "perhatian",
  "konseling",
] as const;
export type MutabaahComplianceStatus =
  (typeof MUTABAAH_COMPLIANCE_STATUS)[number];

// Modul 13 - Kepegawaian GTK (Guru & Tenaga Kependidikan)
export const EMPLOYMENT_TYPES = ["PNS", "PPPK", "GTY", "GTT", "PTT"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const GTK_TYPES = ["pendidik", "tenaga_kependidikan"] as const;
export type GtkType = (typeof GTK_TYPES)[number];

export const DUTY_STATUSES = [
  "aktif",
  "cuti",
  "tugas_belajar",
  "mutasi",
  "pensiun",
  "keluar",
] as const;
export type DutyStatus = (typeof DUTY_STATUSES)[number];

export const EDUCATION_LEVELS = ["D3", "S1", "S2", "S3"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const GRADE_GROUPS = [
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
  "IV/c",
  "IV/d",
  "IV/e",
  "Non-PNS",
] as const;
export type GradeGroup = (typeof GRADE_GROUPS)[number];

export const TEACHER_RANKS = [
  "Pengatur Muda",
  "Pengatur Muda Tk. I",
  "Pengatur",
  "Pengatur Tk. I",
  "Penata Muda",
  "Penata Muda Tk. I",
  "Penata",
  "Penata Tk. I",
  "Pembina",
  "Pembina Tk. I",
  "Pembina Utama Muda",
  "Pembina Utama Madya",
  "Pembina Utama",
  "Tenaga Honorer / Non-PNS",
] as const;
export type TeacherRank = (typeof TEACHER_RANKS)[number];

export const TEACHER_DOCUMENT_TYPES = [
  "sk_pengangkatan",
  "sk_penugasan",
  "ijazah",
  "sertifikat_pendidik",
  "pak",
  "ktp",
  "npwp",
  "karpeg",
  "sk_kgb",
  "sk_pangkat",
  "lainnya",
] as const;
export type TeacherDocumentType = (typeof TEACHER_DOCUMENT_TYPES)[number];

export const ADDITIONAL_DUTY_TYPES = [
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "waka_sarpras",
  "waka_humas",
  "wali_kelas",
  "kepala_lab",
  "kepala_perpustakaan",
  "pembina_ekskul",
  "pembina_asrama",
  "guru_piket",
  "tidak_ada",
] as const;
export type AdditionalDutyType = (typeof ADDITIONAL_DUTY_TYPES)[number];

export const ADDITIONAL_DUTY_JTM_MAP: Record<AdditionalDutyType, number> = {
  kepala_madrasah: 18,
  waka_kurikulum: 12,
  waka_kesiswaan: 12,
  waka_sarpras: 12,
  waka_humas: 12,
  wali_kelas: 2,
  kepala_lab: 12,
  kepala_perpustakaan: 12,
  pembina_ekskul: 2,
  pembina_asrama: 12,
  guru_piket: 1,
  tidak_ada: 0,
};

export const MIN_JTM_TPG = 24;

export const SIMPATIKA_STATUSES = ["layak", "tidak_layak", "dalam_proses"] as const;
export type SimpatikaStatus = (typeof SIMPATIKA_STATUSES)[number];

// Finance & SPP (Modul 12 - Keuangan Madrasah & Kasir)
export const FEE_TYPES = ["rutin", "non_rutin"] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const FEE_CATEGORIES = [
  "spp",
  "asrama",
  "komite",
  "uang_pangkal",
  "seragam",
  "buku",
  "ujian",
  "kegiatan",
  "lainnya",
] as const;
export type FeeCategory = (typeof FEE_CATEGORIES)[number];

export const PAYMENT_METHODS = ["tunai", "transfer", "qris"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const INVOICE_STATUSES = [
  "unpaid",
  "partial",
  "paid",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const TRANSACTION_STATUSES = ["success", "void"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const DISPENSATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type DispensationStatus = (typeof DISPENSATION_STATUSES)[number];

// Schedules & Timetable (Modul 14)
export const DAY_OF_WEEKS = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "ahad",
] as const;
export type DayOfWeek = (typeof DAY_OF_WEEKS)[number];

export const SESSION_TYPES = [
  "formal",
  "diniyah",
  "istirahat",
  "sholat",
  "upacara",
] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SCHEDULE_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export const ROOM_TYPES = [
  "teori",
  "laboratorium",
  "masjid",
  "aula",
  "lapangan",
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

// Transfers & Graduation (Modul 15 - Mutasi & Kelulusan Siswa)
export const TRANSFER_TYPES = ["masuk", "keluar"] as const;
export type TransferType = (typeof TRANSFER_TYPES)[number];

export const TRANSFER_STATUSES = [
  "draft",
  "pending_clearance",
  "pending_approval",
  "approved",
  "rejected",
  "completed",
] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

export const CLEARANCE_STATUSES = [
  "pending",
  "in_progress",
  "cleared",
  "rejected",
] as const;
export type ClearanceStatus = (typeof CLEARANCE_STATUSES)[number];

export const CLEARANCE_DIMENSIONS = [
  "library",
  "finance",
  "discipline",
] as const;
export type ClearanceDimension = (typeof CLEARANCE_DIMENSIONS)[number];

export const GRADUATION_STATUSES = [
  "lulus",
  "tidak_lulus",
  "ditunda",
] as const;
export type GraduationStatus = (typeof GRADUATION_STATUSES)[number];

export const TRANSFER_PERMISSIONS = {
  read: [
    "super_admin",
    "kepala_madrasah",
    "waka_kesiswaan",
    "admin_tu",
    "bendahara",
    "wali_kelas",
  ],
  write: [
    "super_admin",
    "kepala_madrasah",
    "waka_kesiswaan",
    "admin_tu",
  ],
  clearance_library: [
    "super_admin",
    "admin_tu",
    "waka_kesiswaan",
  ],
  clearance_finance: [
    "super_admin",
    "bendahara",
  ],
  clearance_discipline: [
    "super_admin",
    "waka_kesiswaan",
  ],
  approval: [
    "super_admin",
    "kepala_madrasah",
  ],
} as const;

