import type { EmisAnomalyItem, EmisEntityReadiness } from "./emis.types.js";

const NIK_REGEX = /^\d{16}$/;
const NISN_REGEX = /^\d{10}$/;
const NSM_REGEX = /^\d{12}$/;
const NPSN_REGEX = /^\d{8}$/;
const INVALID_MOTHER_NAMES = ["-", ".", "tidak tahu", "tidak ada", "unknown", "null", "none"];

export function isValidNik(nik?: string | null): boolean {
  return typeof nik === "string" && NIK_REGEX.test(nik.trim());
}

export function isValidNisn(nisn?: string | null): boolean {
  return typeof nisn === "string" && NISN_REGEX.test(nisn.trim());
}

export function isValidMotherName(name?: string | null): boolean {
  if (!name || typeof name !== "string") return false;
  const cleaned = name.trim().toLowerCase();
  if (cleaned.length < 2) return false;
  return !INVALID_MOTHER_NAMES.includes(cleaned);
}

export function validateStudent(student: {
  id: string;
  nik: string;
  nisn?: string | null;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  motherName: string;
  status: string;
  classroomId?: string | null;
  classroomName?: string | null;
  parents?: Array<{ relationType: string; nik?: string | null; name?: string | null }>;
}): { isReady: boolean; anomalies: EmisAnomalyItem[] } {
  const anomalies: EmisAnomalyItem[] = [];

  // 1. NIK
  if (!isValidNik(student.nik)) {
    anomalies.push({
      id: `${student.id}-nik`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "NIK",
      issueReason: "Format NIK wajib tepat 16 digit angka sesuai Dukcapil",
      severity: "critical",
      resolutionHint: "Lengkapi NIK siswa 16 digit di Buku Induk",
    });
  }

  // 2. NISN
  if (!isValidNisn(student.nisn)) {
    anomalies.push({
      id: `${student.id}-nisn`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "NISN",
      issueReason: "NISN wajib tepat 10 digit numerik Pusdatin",
      severity: "critical",
      resolutionHint: "Periksa kartu NISN atau VervalPD",
    });
  }

  // 3. Nama Ibu Kandung
  if (!isValidMotherName(student.motherName)) {
    anomalies.push({
      id: `${student.id}-mother`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "Nama Ibu Kandung",
      issueReason: "Nama ibu kandung dilarang kosong, tanda hubung (-), atau placeholder",
      severity: "critical",
      resolutionHint: "Sesuaikan dengan Kartu Keluarga (KK) siswa",
    });
  }

  // 4. Tempat & Tanggal Lahir
  if (!student.birthPlace || !student.birthDate) {
    anomalies.push({
      id: `${student.id}-birth`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "Kelahiran",
      issueReason: "Tempat dan tanggal lahir wajib terisi lengkap",
      severity: "critical",
      resolutionHint: "Lengkapi tempat & tanggal lahir",
    });
  }

  // 5. Rombel Assignment
  if (student.status === "aktif" && !student.classroomId) {
    anomalies.push({
      id: `${student.id}-rombel`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "Rombongan Belajar",
      issueReason: "Siswa berstatus aktif belum ditempatkan dalam rombel (Aktif Tanpa Rombel)",
      severity: "warning",
      resolutionHint: "Tempatkan siswa ke kelas pada menu Penempatan Rombel",
    });
  }

  // 6. Data Orang Tua (NIK Ortu)
  const parents = student.parents || [];
  const hasValidParentNik = parents.some((p) => isValidNik(p.nik));
  if (parents.length === 0 || !hasValidParentNik) {
    anomalies.push({
      id: `${student.id}-parent-nik`,
      entityType: "student",
      recordId: student.id,
      identifier: student.nisn || student.nik || "-",
      name: student.fullName,
      fieldName: "NIK Orang Tua",
      issueReason: "Data orang tua belum lengkap atau NIK orang tua belum 16 digit",
      severity: "warning",
      resolutionHint: "Lengkapi NIK Ayah/Ibu di profil orang tua siswa",
    });
  }

  const isReady = anomalies.filter((a) => a.severity === "critical").length === 0;
  return { isReady, anomalies };
}

export function validateTeacher(teacher: {
  id: string;
  nik: string;
  nuptk?: string | null;
  pegId?: string | null;
  fullName: string;
  employmentType: string;
  dutyStatus?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  totalJtm?: number | null;
}): { isReady: boolean; anomalies: EmisAnomalyItem[] } {
  const anomalies: EmisAnomalyItem[] = [];

  if (!isValidNik(teacher.nik)) {
    anomalies.push({
      id: `${teacher.id}-nik`,
      entityType: "teacher",
      recordId: teacher.id,
      identifier: teacher.nuptk || teacher.nik || "-",
      name: teacher.fullName,
      fieldName: "NIK GTK",
      issueReason: "Format NIK GTK wajib 16 digit angka valid",
      severity: "critical",
      resolutionHint: "Periksa data KTP GTK bersangkutan",
    });
  }

  const hasIdentifier = Boolean(teacher.nuptk?.trim() || teacher.pegId?.trim());
  if (!hasIdentifier) {
    anomalies.push({
      id: `${teacher.id}-nuptk`,
      entityType: "teacher",
      recordId: teacher.id,
      identifier: teacher.nik || "-",
      name: teacher.fullName,
      fieldName: "NUPTK / PegID",
      issueReason: "GTK wajib memiliki NUPTK atau PegID Simpatika",
      severity: "warning",
      resolutionHint: "Input NUPTK atau PegID dari portal Simpatika Kemenag",
    });
  }

  const isReady = anomalies.filter((a) => a.severity === "critical").length === 0;
  return { isReady, anomalies };
}

export function validateClassroom(classroom: {
  id: string;
  name: string;
  gradeLevel: number;
  homeroomTeacherId?: string | null;
  homeroomTeacherName?: string | null;
  studentCount: number;
}): { isReady: boolean; anomalies: EmisAnomalyItem[] } {
  const anomalies: EmisAnomalyItem[] = [];

  if (!classroom.homeroomTeacherId) {
    anomalies.push({
      id: `${classroom.id}-homeroom`,
      entityType: "classroom",
      recordId: classroom.id,
      identifier: classroom.name,
      name: `Kelas ${classroom.name}`,
      fieldName: "Wali Kelas",
      issueReason: "Rombongan belajar belum memiliki wali kelas terdaftar",
      severity: "critical",
      resolutionHint: "Tugaskan guru sebagai wali kelas di Master Setup",
    });
  }

  if (classroom.studentCount === 0) {
    anomalies.push({
      id: `${classroom.id}-students`,
      entityType: "classroom",
      recordId: classroom.id,
      identifier: classroom.name,
      name: `Kelas ${classroom.name}`,
      fieldName: "Jumlah Siswa",
      issueReason: "Rombel kosong, belum ada siswa yang ditempatkan",
      severity: "warning",
      resolutionHint: "Lakukan penempatan siswa ke dalam rombel",
    });
  }

  const isReady = anomalies.filter((a) => a.severity === "critical").length === 0;
  return { isReady, anomalies };
}

export function validateInstitution(inst?: {
  nsm?: string | null;
  npsn?: string | null;
  name?: string | null;
  address?: string | null;
} | null): { isReady: boolean; anomalies: EmisAnomalyItem[] } {
  const anomalies: EmisAnomalyItem[] = [];

  if (!inst) {
    anomalies.push({
      id: "inst-missing",
      entityType: "institution",
      recordId: "institution",
      identifier: "-",
      name: "Profil Lembaga",
      fieldName: "Profil Madrasah",
      issueReason: "Data profil madrasah belum diatur di sistem",
      severity: "critical",
      resolutionHint: "Isi data identitas madrasah di menu Master Setup",
    });
    return { isReady: false, anomalies };
  }

  if (!inst.nsm || !NSM_REGEX.test(inst.nsm.trim())) {
    anomalies.push({
      id: "inst-nsm",
      entityType: "institution",
      recordId: "institution",
      identifier: inst.nsm || "-",
      name: inst.name || "Profil Lembaga",
      fieldName: "NSM",
      issueReason: "Nomor Statistik Madrasah (NSM) wajib 12 digit numerik resmi Kemenag",
      severity: "critical",
      resolutionHint: "Periksa piagam izin operasional madrasah",
    });
  }

  if (!inst.npsn || !NPSN_REGEX.test(inst.npsn.trim())) {
    anomalies.push({
      id: "inst-npsn",
      entityType: "institution",
      recordId: "institution",
      identifier: inst.npsn || "-",
      name: inst.name || "Profil Lembaga",
      fieldName: "NPSN",
      issueReason: "NPSN wajib 8 digit numerik Pusdatin Kemendikbud/Kemenag",
      severity: "critical",
      resolutionHint: "Periksa referensi data Kemendikbud/Pusdatin",
    });
  }

  const isReady = anomalies.length === 0;
  return { isReady, anomalies };
}

export function calculateReadiness(total: number, ready: number): EmisEntityReadiness {
  const percentage = total === 0 ? 100 : Math.round((ready / total) * 100);
  return {
    total,
    ready,
    valid: ready,
    invalid: Math.max(0, total - ready),
    percentage,
  };
}
