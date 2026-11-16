import type { EmisBapRecord, EmisInstitutionExportRow } from "./emis.types.js";

function escapePdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateEmisBapPdf(
  bap: EmisBapRecord,
  institution: EmisInstitutionExportRow
): Buffer {
  const lines: string[] = [];
  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 700) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  };
  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 0.5) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // A4 Portrait: 595 x 842 pt
  let curY = 790;

  // Header Kop Madrasah
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 10, 50, curY);
  curY -= 14;
  addText(institution.name.toUpperCase(), "/F2", 13, 50, curY);
  curY -= 12;
  addText(
    `NSM: ${institution.nsm} | NPSN: ${institution.npsn} | ${institution.address}`,
    "/F1",
    8.5,
    50,
    curY
  );
  curY -= 10;
  addLine(50, curY, 545, curY, 1.2);
  curY -= 25;

  // Title
  addText("BERITA ACARA PENDATAAN (BAP) EMIS 4.0", "/F2", 12, 140, curY);
  curY -= 14;
  addText(`Nomor: ${bap.bapNumber}`, "/F1", 9.5, 195, curY);
  curY -= 25;

  // Statement
  addText(
    "Pada hari ini telah dilakukan finalisasi audit kesiapan data pangkalan EMIS 4.0",
    "/F1",
    9.5,
    50,
    curY
  );
  curY -= 14;
  addText(
    `Tahun Ajaran ${bap.academicYear} Semester ${bap.semester} dengan rekapitulasi data sebagai berikut:`,
    "/F1",
    9.5,
    50,
    curY
  );
  curY -= 20;

  // Table Rekapitulasi Data
  const dataRows: [string, string][] = [
    ["1. Satuan Pendidikan", `: ${institution.name}`],
    ["2. Nomor Statistik Madrasah (NSM)", `: ${institution.nsm}`],
    ["3. Nomor Pokok Sekolah Nasional (NPSN)", `: ${institution.npsn}`],
    ["4. Total Peserta Didik", `: ${bap.totalStudents} Siswa (L: ${bap.maleStudents}, P: ${bap.femaleStudents})`],
    ["5. Total Rombongan Belajar (Rombel)", `: ${bap.totalClassrooms} Rombel`],
    ["6. Pendidik & Tenaga Kependidikan (GTK)", `: ${bap.totalTeachers} GTK (PNS: ${bap.pnsTeachers}, Non-PNS: ${bap.nonPnsTeachers})`],
    ["7. Skor Kesiapan Data (Readiness)", `: ${bap.readinessPercentage}% (Status Kesiapan: ${bap.readinessPercentage === 100 ? "Lengkap & Siap Kirim" : "Perlu Perbaikan"})`],
    ["8. Status Berita Acara", `: ${bap.status.toUpperCase()}`],
  ];

  for (const [label, val] of dataRows) {
    addText(label, "/F2", 9, 60, curY);
    addText(val, "/F1", 9, 270, curY);
    curY -= 16;
  }

  curY -= 10;
  addText(
    "Demikian Berita Acara Pendataan ini dibuat dengan sesungguhnya untuk dapat dipergunakan",
    "/F1",
    9,
    50,
    curY
  );
  curY -= 12;
  addText(
    "sebagai dasar pemutakhiran data EMIS 4.0 Kementerian Agama Republik Indonesia.",
    "/F1",
    9,
    50,
    curY
  );

  // Signatures
  curY -= 45;
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  addText(`Ditetapkan pada: ${dateStr}`, "/F1", 8.5, 360, curY + 15);

  const leftSignX = 70;
  const rightSignX = 360;

  addText("Operator EMIS Madrasah,", "/F2", 9, leftSignX, curY);
  addText("Kepala Madrasah,", "/F2", 9, rightSignX, curY);

  curY -= 50;
  addText(bap.operatorName || "Operator EMIS", "/F2", 9, leftSignX, curY);
  addText(bap.headmasterName || institution.headmasterName || "Kepala Madrasah", "/F2", 9, rightSignX, curY);

  const content = lines.join("\n");
  const contentStream = `stream\n${content}\nendstream`;
  const streamLength = Buffer.byteLength(contentStream, "utf-8");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
${contentStream}
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000247 00000 n 
0000000300 00000 n 
0000000371 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
445
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}
