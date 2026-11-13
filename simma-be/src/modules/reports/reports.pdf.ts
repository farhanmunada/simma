import type { StudentReportCard } from "./reports.types.js";

function escapePdfText(str: string): string {
  // Sanitize to ASCII safe characters and escape PDF special chars
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateReportPdf(report: StudentReportCard): Buffer {
  const lines: string[] = [];

  // Helper to add text line
  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 750) => {
    lines.push(
      `BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`,
    );
  };

  let curY = 800;

  // Header / Kop
  addText(
    "KEMENTERIAN AGAMA REPUBLIK INDONESIA",
    "/F2",
    12,
    50,
    curY,
  );
  curY -= 15;
  addText(
    report.institution.name.toUpperCase(),
    "/F2",
    13,
    50,
    curY,
  );
  curY -= 14;
  addText(
    `NSM: ${report.institution.nsm} | NPSN: ${report.institution.npsn} | ${report.institution.address}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 16;

  // Title
  addText(
    "LAPORAN HASIL BELAJAR PESERTA DIDIK (RDM KEMENAG)",
    "/F2",
    11,
    50,
    curY,
  );
  curY -= 18;

  // Student Identity
  addText(
    `Nama: ${report.student.fullName}   |   NISN/NIS: ${report.student.nisn ?? "-"} / ${report.student.nis ?? "-"}   |   Jenis Kelamin: ${report.student.gender === "L" ? "Laki-laki" : "Perempuan"}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 13;
  addText(
    `Kelas: ${report.classroom.name} (Tingkat ${report.classroom.gradeLevel})   |   Semester: ${report.semester.type === 1 ? "1 (Ganjil)" : "2 (Genap)"}   |   Tahun Pelajaran: ${report.academicYear.name}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 18;

  // Table header
  addText("A. NILAI AKADEMIK & CAPAIAN KOMPETENSI", "/F2", 10, 50, curY);
  curY -= 14;
  addText(
    "No   Mata Pelajaran                  Nilai  Predikat  Capaian",
    "/F2",
    9,
    50,
    curY,
  );
  curY -= 12;

  // Subjects
  report.grades.slice(0, 15).forEach((g, idx) => {
    const num = String(idx + 1).padEnd(4, " ");
    const name = g.subjectName.slice(0, 28).padEnd(30, " ");
    const score = String(Math.round(g.finalScore)).padStart(5, " ");
    const pred = g.letterGrade.padStart(8, " ");
    const desc = ("   " + g.description).slice(0, 45);
    addText(`${num}${name}${score}${pred}${desc}`, "/F1", 8, 50, curY);
    curY -= 11;
  });

  curY -= 8;
  addText(
    `Jumlah Nilai: ${Math.round(report.summary.totalScore)}   |   Rata-rata: ${report.summary.averageScore}   |   Peringkat: ${report.summary.rankInClass ?? "-"} dari ${report.summary.totalStudentsInClass} siswa`,
    "/F2",
    9,
    50,
    curY,
  );
  curY -= 16;

  // Attendance & Tahfidz
  addText("B. PRESENSI & TAHFIDZ", "/F2", 10, 50, curY);
  curY -= 13;
  addText(
    `Presensi: Sakit: ${report.attendance.sakit} hari | Izin: ${report.attendance.izin} hari | Alpa: ${report.attendance.alpa} hari | Kehadiran: ${report.attendance.percentage}%`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 12;
  addText(
    `Tahfidz: Total ${report.tahfidz.totalJuz} Juz disetorkan | Ujian Tasmi Lulus: ${report.tahfidz.passedExamsCount}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 16;

  // Notes & Attitude
  addText("C. CATATAN & DESKRIPSI SIKAP", "/F2", 10, 50, curY);
  curY -= 13;
  if (report.notes.spiritualAttitude) {
    addText(
      `Sikap Spiritual: ${report.notes.spiritualAttitude}`,
      "/F1",
      8,
      50,
      curY,
    );
    curY -= 11;
  }
  if (report.notes.socialAttitude) {
    addText(
      `Sikap Sosial   : ${report.notes.socialAttitude}`,
      "/F1",
      8,
      50,
      curY,
    );
    curY -= 11;
  }
  if (report.notes.teacherNotes) {
    addText(
      `Catatan Wali   : ${report.notes.teacherNotes}`,
      "/F1",
      8,
      50,
      curY,
    );
    curY -= 14;
  }

  // Signatures
  curY -= 15;
  addText("Mengetahui,", "/F1", 9, 50, curY);
  addText("Wali Kelas,", "/F1", 9, 380, curY);
  curY -= 40;
  addText(
    report.classroom.homeroomTeacher?.fullName ?? "Wali Kelas",
    "/F2",
    9,
    380,
    curY,
  );
  addText("Kepala Madrasah", "/F2", 9, 50, curY);

  const streamContent = lines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const objects: string[] = [
    // 1: Catalog
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    // 2: Pages
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    // 3: Page
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    // 4: Font F1 (Helvetica)
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    // 5: Font F2 (Helvetica-Bold)
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    // 6: Stream contents
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let body = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0]; // offset 0 is dummy

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, "utf-8"));
    body += obj;
  }

  const startXref = Buffer.byteLength(body, "utf-8");
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;

  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, "utf-8");
}
