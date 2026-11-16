import type { ClassroomLegger } from "../features/reports/types";

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
