import type { StudentMonthlyReportData } from "./mutabaah.types.js";

function escapePdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateMutabaahPdf(data: StudentMonthlyReportData): Buffer {
  const lines: string[] = [];

  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 750) => {
    lines.push(
      `BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`,
    );
  };

  let curY = 800;

  // Header / Kop
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 11, 50, curY);
  curY -= 15;
  addText(data.institution.name.toUpperCase(), "/F2", 12, 50, curY);
  curY -= 13;
  addText(
    `NSM: ${data.institution.nsm ?? "-"} | NPSN: ${data.institution.npsn ?? "-"} | ${data.institution.address ?? "Madrasah Aliyah SIMMA"}`,
    "/F1",
    8,
    50,
    curY,
  );
  curY -= 18;

  // Separator line
  lines.push("0.5 w 50 " + curY + " m 545 " + curY + " l S");
  curY -= 18;

  // Title
  addText("LEMBAR RAPOR MUTABA'AH YAUMIYAH & KARTU KENDALI IBADAH SANTRI", "/F2", 11, 50, curY);
  curY -= 16;

  // Period & Identity
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const periodLabel = `${monthNames[data.period.month - 1]} ${data.period.year}`;

  addText(`Nama Santri: ${data.student.fullName}`, "/F2", 9, 50, curY);
  addText(`Kelas / Rombel: ${data.classroom.name}`, "/F1", 9, 320, curY);
  curY -= 14;
  addText(`NISN / NIS: ${data.student.nisn ?? "-"} / ${data.student.nis ?? "-"}`, "/F1", 9, 50, curY);
  addText(`Periode Pemantauan: ${periodLabel}`, "/F1", 9, 320, curY);
  curY -= 14;
  addText(`Jenis Kelamin: ${data.student.gender === "L" ? "Laki-laki" : "Perempuan"}`, "/F1", 9, 50, curY);
  const statusLabel =
    data.summary.status === "istiqamah"
      ? "ISTIQAMAH (Sangat Baik)"
      : data.summary.status === "perhatian"
      ? "PERLU PERHATIAN"
      : "MEMBUTUHKAN KONSELING";
  addText(`Indeks Kepatuhan: ${data.summary.complianceScore}% [${statusLabel}]`, "/F2", 9, 320, curY);
  curY -= 20;

  // Ringkasan Statistik Box
  addText("RINGKASAN INDEKS IBADAH HARIAN", "/F2", 10, 50, curY);
  curY -= 14;
  addText(
    `Total Kegiatan: ${data.summary.totalMandatoryActivities} | Terlaksana: ${data.summary.completedActivities} | Masbuk: ${data.summary.masbukActivities} | Uzur: ${data.summary.uzurActivities} | Lalai: ${data.summary.missedActivities}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 20;

  // Activity Breakdown Table
  addText("DETAIL CAPAIAN AMALAN YAUMIYAH", "/F2", 10, 50, curY);
  curY -= 15;

  // Table header
  addText("No", "/F2", 8, 50, curY);
  addText("Nama Amalan / Ibadah", "/F2", 8, 75, curY);
  addText("Kategori", "/F2", 8, 260, curY);
  addText("Target", "/F2", 8, 320, curY);
  addText("Hadir", "/F2", 8, 360, curY);
  addText("Masbuk", "/F2", 8, 400, curY);
  addText("Uzur", "/F2", 8, 445, curY);
  addText("Lalai", "/F2", 8, 480, curY);
  addText("Skor (%)", "/F2", 8, 515, curY);
  curY -= 6;
  lines.push("0.3 w 50 " + curY + " m 545 " + curY + " l S");
  curY -= 12;

  // Rows
  let idx = 1;
  for (const stat of data.activityStats) {
    if (curY < 120) break;
    addText(String(idx++), "/F1", 8, 50, curY);
    addText(stat.activityName.slice(0, 32), "/F1", 8, 75, curY);
    addText(stat.category.toUpperCase(), "/F1", 8, 260, curY);
    addText(String(stat.targetCount), "/F1", 8, 320, curY);
    addText(String(stat.completedCount), "/F1", 8, 360, curY);
    addText(String(stat.masbukCount), "/F1", 8, 400, curY);
    addText(String(stat.uzurCount), "/F1", 8, 445, curY);
    addText(String(stat.missedCount), "/F1", 8, 480, curY);
    addText(`${stat.percentage}%`, "/F2", 8, 515, curY);
    curY -= 13;
  }

  curY -= 15;
  // Notes / Catatan Pembinaan
  addText("Catatan Pembina Asrama / Wali Kelas:", "/F2", 9, 50, curY);
  curY -= 13;
  const noteDesc =
    data.summary.complianceScore >= 80
      ? "Alhamdulillah, ananda menunjukkan komitmen istiqamah dalam shalat fardhu dan amalan sunnah."
      : data.summary.complianceScore >= 60
      ? "Ananda perlu meningkatkan kedisiplinan shalat berjama'ah tepat waktu di masjid."
      : "Perlu perhatian khusus dan bimbingan konseling terkait pembiasaan shalat fardhu berjama'ah.";
  addText(noteDesc, "/F1", 8, 50, curY);
  curY -= 35;

  // Signatures
  addText("Mengetahui,", "/F1", 9, 80, curY);
  addText("Musyrif / Wali Kelas,", "/F1", 9, 380, curY);
  curY -= 45;
  addText("( ______________________ )", "/F1", 9, 60, curY);
  addText("( ______________________ )", "/F1", 9, 360, curY);
  curY -= 12;
  addText("Kepala Madrasah / Mudir", "/F1", 8, 75, curY);
  addText("Pembina Asrama Pondok", "/F1", 8, 380, curY);

  const streamContent = lines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const objects: string[] = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let body = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0];

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
