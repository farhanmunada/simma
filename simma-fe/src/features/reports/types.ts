export interface StudentReportGrade {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  group: string;
  finalScore: number;
  letterGrade: string;
  description: string;
}

export interface ReportAttendanceSummary {
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total: number;
  percentage: number;
}

export interface ReportTahfidzSummary {
  totalJuz: number;
  recordsCount: number;
  lastSurah: string | null;
  passedExamsCount: number;
}

export interface ExtracurricularItem {
  name: string;
  score?: string;
  description?: string;
}

export interface AchievementItem {
  description: string;
  type?: string;
}

export interface StudentReportNotes {
  teacherNotes: string;
  spiritualAttitude: string;
  socialAttitude: string;
  extracurriculars: ExtracurricularItem[];
  achievements: AchievementItem[];
  updatedAt?: string;
}

export interface StudentReportCard {
  student: {
    id: string;
    fullName: string;
    nisn: string | null;
    nis: string | null;
    gender: string;
    birthPlace: string;
    birthDate: string;
  };
  institution: {
    name: string;
    nsm: string;
    npsn: string;
    address: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  semester: {
    id: string;
    type: number;
  };
  classroom: {
    id: string;
    name: string;
    gradeLevel: number;
    homeroomTeacher: {
      id: string;
      fullName: string;
      nuptk?: string | null;
    } | null;
  };
  grades: StudentReportGrade[];
  attendance: ReportAttendanceSummary;
  tahfidz: ReportTahfidzSummary;
  notes: StudentReportNotes;
  summary: {
    totalScore: number;
    averageScore: number;
    rankInClass: number | null;
    totalStudentsInClass: number;
  };
}

export interface LeggerStudentGrade {
  subjectId: string;
  subjectCode: string;
  score: number;
  letterGrade: string;
}

export interface LeggerStudentEntry {
  studentId: string;
  fullName: string;
  nisn: string | null;
  nis: string | null;
  gender: string;
  grades: LeggerStudentGrade[];
  totalScore: number;
  averageScore: number;
  rank: number;
  attendance: {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
  };
}

export interface ClassroomLegger {
  classroom: {
    id: string;
    name: string;
    gradeLevel: number;
    homeroomTeacher: {
      id: string;
      fullName: string;
      nuptk?: string | null;
    } | null;
  };
  academicYear: {
    id: string;
    name: string;
  };
  semester: {
    id: string;
    type: number;
  };
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    group: string;
  }>;
  students: LeggerStudentEntry[];
  classStatistics: {
    totalStudents: number;
    classAverage: number;
    highestScore: number;
    lowestScore: number;
  };
}

export interface ReportCardQueryParams {
  includeTahfidz?: boolean;
  includeAttendance?: boolean;
}

export interface LeggerQueryParams {
  sortBy?: "rank" | "name" | "nisn" | "totalScore";
  order?: "asc" | "desc";
}

export interface ReportNotesBodyInput {
  semesterId: string;
  classroomId?: string;
  teacherNotes: string;
  spiritualAttitude?: string;
  socialAttitude?: string;
  extracurriculars?: ExtracurricularItem[];
  achievements?: AchievementItem[];
}

/**
 * Standard RDM letter grade calculation
 */
export function calculateLetterGrade(score: number): "A" | "B" | "C" | "D" {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

/**
 * Letter grade badge CSS styles
 * A: emerald, B: sky, C: amber, D: rose
 */
export function getLetterGradeBadgeClass(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold";
    case "B":
      return "bg-sky-50 text-sky-700 border border-sky-200 font-semibold";
    case "C":
      return "bg-amber-50 text-amber-700 border border-amber-200 font-semibold";
    case "D":
      return "bg-rose-50 text-rose-700 border border-rose-200 font-semibold";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200 font-medium";
  }
}

/**
 * Formats semester type number to label
 */
export function formatSemesterType(type: number | string): string {
  const num = Number(type);
  if (num === 1) return "Ganjil (1)";
  if (num === 2) return "Genap (2)";
  return `Semester ${type}`;
}

/**
 * Helper to escape RFC 4180 CSV cell
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds RFC 4180 CSV string with UTF-8 BOM for Classroom Legger
 */
export function generateLeggerCsvContent(legger: ClassroomLegger): string {
  const lines: string[] = [];

  // Metadata headers
  lines.push(
    `BUKU LEGGER NILAI KELAS - ${escapeCsvCell(legger.classroom?.name || "Kelas")} (${escapeCsvCell(legger.academicYear?.name || "")} - Semester ${escapeCsvCell(legger.semester?.type || "")})`
  );
  lines.push(
    `Wali Kelas: ${escapeCsvCell(legger.classroom?.homeroomTeacher?.fullName || "-")}`
  );
  lines.push("");

  // Table header line
  const headers = [
    "No",
    "NISN",
    "NIS",
    "Nama Siswa",
    "L/P",
    ...legger.subjects.map((s) => s.code || s.name),
    "Total Nilai",
    "Rata-rata",
    "Peringkat",
    "Hadir",
    "Izin",
    "Sakit",
    "Alpa",
  ];
  lines.push(headers.map(escapeCsvCell).join(","));

  // Data rows
  legger.students.forEach((student, index) => {
    const gradesMap = new Map<string, number>();
    student.grades.forEach((g) => {
      gradesMap.set(g.subjectId, g.score);
    });

    const subjectScores = legger.subjects.map((sub) => {
      const score = gradesMap.get(sub.id);
      return score !== undefined ? score : "";
    });

    const row = [
      index + 1,
      student.nisn || "",
      student.nis || "",
      student.fullName,
      student.gender || "",
      ...subjectScores,
      student.totalScore,
      student.averageScore,
      student.rank,
      student.attendance?.hadir ?? 0,
      student.attendance?.izin ?? 0,
      student.attendance?.sakit ?? 0,
      student.attendance?.alpa ?? 0,
    ];
    lines.push(row.map(escapeCsvCell).join(","));
  });

  // Footer summary
  lines.push("");
  lines.push(
    `Statistik Kelas: Total Siswa: ${escapeCsvCell(legger.classStatistics?.totalStudents ?? 0)}, Rata-rata: ${escapeCsvCell(legger.classStatistics?.classAverage ?? 0)}, Nilai Tertinggi: ${escapeCsvCell(legger.classStatistics?.highestScore ?? 0)}, Nilai Terendah: ${escapeCsvCell(legger.classStatistics?.lowestScore ?? 0)}`
  );

  return "\uFEFF" + lines.join("\r\n");
}

/**
 * Triggers browser download of Legger CSV file
 */
export function exportLeggerToCsv(legger: ClassroomLegger): void {
  const csvContent = generateLeggerCsvContent(legger);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = `legger-${legger.classroom?.name || "kelas"}-semester-${legger.semester?.type || "1"}.csv`.replace(/\s+/g, "_");
  anchor.href = url;
  anchor.setAttribute("download", filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
