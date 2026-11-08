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

