function escapePdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export interface TransferLetterPdfData {
  institutionName: string;
  institutionAddress: string;
  nsm: string;
  npsn: string;
  referenceNumber: string;
  studentName: string;
  nisn: string;
  nis: string;
  gender: string;
  birthInfo: string;
  currentClass: string;
  destinationSchool: string;
  reason: string;
  transferDate: string;
  verificationCode: string;
  headmasterName: string;
}

export function generateTransferOutLetterPdf(data: TransferLetterPdfData): Buffer {
  const lines: string[] = [];
  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 700) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  };
  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 0.5) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // A4 Portrait: 595 x 842 pt
  let curY = 780;
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 10, 50, curY);
  curY -= 14;
  addText(data.institutionName.toUpperCase(), "/F2", 13, 50, curY);
  curY -= 12;
  addText(`NSM: ${data.nsm} | NPSN: ${data.npsn} | ${data.institutionAddress}`, "/F1", 8.5, 50, curY);
  curY -= 10;
  addLine(50, curY, 545, curY, 1.2);
  curY -= 25;

  addText("SURAT KETERANGAN PINDAH / MUTASI SISWA", "/F2", 12, 140, curY);
  curY -= 14;
  addText(`Nomor: ${data.referenceNumber}`, "/F1", 10, 200, curY);
  curY -= 25;

  addText("Yang bertanda tangan di bawah ini Kepala Madrasah menerangkan bahwa:", "/F1", 10, 50, curY);
  curY -= 20;

  const rows: [string, string][] = [
    ["Nama Peserta Didik", `: ${data.studentName}`],
    ["Nomor Induk Siswa (NIS)", `: ${data.nis || "-"}`],
    ["NISN", `: ${data.nisn || "-"}`],
    ["Jenis Kelamin", `: ${data.gender === "L" ? "Laki-laki" : "Perempuan"}`],
    ["Tempat, Tanggal Lahir", `: ${data.birthInfo}`],
    ["Tingkat / Kelas Terakhir", `: ${data.currentClass}`],
    ["Madrasah / Sekolah Tujuan", `: ${data.destinationSchool}`],
    ["Alasan Pindah", `: ${data.reason}`],
    ["Tanggal Mutasi Berlaku", `: ${data.transferDate}`],
  ];

  for (const [label, val] of rows) {
    addText(label, "/F2", 9.5, 70, curY);
    addText(val, "/F1", 9.5, 230, curY);
    curY -= 16;
  }

  curY -= 15;
  addText("Siswa bersangkutan telah menyelesaikan seluruh kewajiban administrasi perpustakaan,", "/F1", 9.5, 50, curY);
  curY -= 14;
  addText("keuangan, dan tata tertib madrasah (Clearance Status: CLEARED).", "/F1", 9.5, 50, curY);

  curY -= 35;
  addText(`Kode Verifikasi: [ ${data.verificationCode} ]`, "/F2", 9, 50, curY);

  const signX = 360;
  addText("Ditetapkan di: Madrasah", "/F1", 9.5, signX, curY);
  curY -= 14;
  addText("Kepala Madrasah,", "/F2", 9.5, signX, curY);
  curY -= 45;
  addText(data.headmasterName, "/F2", 9.5, signX, curY);

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

export interface GraduationSklPdfData {
  institutionName: string;
  institutionAddress: string;
  sklNumber: string;
  studentName: string;
  nisn: string;
  nis: string;
  academicYear: string;
  graduationDate: string;
  headmasterName: string;
}

export function generateGraduationSklPdf(data: GraduationSklPdfData): Buffer {
  const lines: string[] = [];
  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 700) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  };
  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 0.5) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  let curY = 780;
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 10, 50, curY);
  curY -= 14;
  addText(data.institutionName.toUpperCase(), "/F2", 13, 50, curY);
  curY -= 12;
  addText(data.institutionAddress, "/F1", 8.5, 50, curY);
  curY -= 10;
  addLine(50, curY, 545, curY, 1.2);
  curY -= 25;

  addText("SURAT KETERANGAN LULUS (SKL)", "/F2", 12, 180, curY);
  curY -= 14;
  addText(`Nomor: ${data.sklNumber}`, "/F1", 10, 200, curY);
  curY -= 30;

  addText("Kepala Madrasah menerangkan bahwa peserta didik berikut ini:", "/F1", 10, 50, curY);
  curY -= 22;

  const rows: [string, string][] = [
    ["Nama Peserta Didik", `: ${data.studentName}`],
    ["Nomor Induk Siswa (NIS)", `: ${data.nis || "-"}`],
    ["NISN", `: ${data.nisn || "-"}`],
    ["Tahun Ajaran", `: ${data.academicYear}`],
    ["Tanggal Kelulusan", `: ${data.graduationDate}`],
  ];

  for (const [label, val] of rows) {
    addText(label, "/F2", 9.5, 70, curY);
    addText(val, "/F1", 9.5, 230, curY);
    curY -= 18;
  }

  curY -= 20;
  addText("DINYATAKAN LULUS", "/F2", 14, 230, curY);
  curY -= 20;
  addText("dari satuan pendidikan Madrasah Aliyah setelah memenuhi kriteria kelulusan.", "/F1", 10, 50, curY);

  curY -= 50;
  const signX = 360;
  addText("Kepala Madrasah,", "/F2", 9.5, signX, curY);
  curY -= 45;
  addText(data.headmasterName, "/F2", 9.5, signX, curY);

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
