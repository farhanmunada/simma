import type { PpdbApplicant } from "./ppdb.types.js";

function escapePdfText(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generatePpdbCardPdf(
  applicant: PpdbApplicant,
  academicYearName: string = "2025/2026"
): Buffer {
  const lines: string[] = [];

  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 750) => {
    lines.push(
      `BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 1) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const addRect = (x: number, y: number, w: number, h: number, width = 1) => {
    lines.push(`${width} w ${x} ${y} ${w} ${h} re S`);
  };

  let curY = 800;

  // 1. Header / Kop Resmi Kemenag & Madrasah
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 11, 50, curY);
  curY -= 14;
  addText("PANITIA PENERIMAAN PESERTA DIDIK BARU (PPDB)", "/F2", 12, 50, curY);
  curY -= 13;
  addText(
    "MADRASAH ALIYAH SWASTA / NEGERI — SISTEM INFORMASI MADRASAH (SIMMA)",
    "/F1",
    9,
    50,
    curY
  );
  curY -= 10;
  addLine(50, curY, 545, curY, 2);
  curY -= 2;
  addLine(50, curY, 545, curY, 0.5);
  curY -= 20;

  // 2. Judul Dokumen
  addText("KARTU TANDA PESERTA PPDB MADRASAH ALIYAH", "/F2", 13, 130, curY);
  curY -= 14;
  addText(
    `TAHUN PELAJARAN ${academicYearName.toUpperCase()} — JALUR SELEKSI RESMI`,
    "/F1",
    9,
    170,
    curY
  );
  curY -= 25;

  // 3. Highlight Box: Nomor Pendaftaran & Jalur
  addRect(50, curY - 30, 495, 42, 1);
  addText("NOMOR REGISTRASI PPDB:", "/F1", 8, 65, curY - 5);
  addText(applicant.registrationNumber, "/F2", 16, 65, curY - 24);

  addText("JALUR PENDAFTARAN:", "/F1", 8, 250, curY - 5);
  addText((applicant.track || "REGULER").toUpperCase(), "/F2", 11, 250, curY - 20);

  addText("PEMINATAN / JURUSAN:", "/F1", 8, 390, curY - 5);
  addText(applicant.chosenMajor || "MIPA", "/F2", 11, 390, curY - 20);

  curY -= 50;

  // 4. Data Identitas Calon Siswa
  addText("A. BIODATA CALON PESERTA DIDIK", "/F2", 10, 50, curY);
  curY -= 15;

  const dataRows: [string, string][] = [
    ["Nama Lengkap", applicant.fullName],
    ["Nomor Induk Kependudukan (NIK)", applicant.nik],
    ["Nomor Induk Siswa Nasional (NISN)", applicant.nisn || "-"],
    [
      "Tempat, Tanggal Lahir",
      `${applicant.birthPlace}, ${applicant.birthDate}`
    ],
    [
      "Jenis Kelamin",
      applicant.gender === "L" ? "Laki-laki (Ikhwan)" : "Perempuan (Akhwat)"
    ],
    ["Agama", applicant.religion || "Islam"],
    [
      "Asal Sekolah / Madrasah",
      `${applicant.previousSchoolType} ${applicant.previousSchoolName}`
    ],
    ["NPSN Asal Sekolah", applicant.npsnOrigin || "-"],
    ["Nama Ibu Kandung", applicant.motherName],
    ["Nama Ayah / Wali", applicant.fatherName || applicant.guardianName || "-"],
    ["Nomor Telepon / WhatsApp", applicant.phone || "-"],
    ["Alamat Domisili", applicant.address || "-"]
  ];

  for (const [label, val] of dataRows) {
    addText(label, "/F1", 8.5, 55, curY);
    addText(":", "/F1", 8.5, 205, curY);
    addText(val, "/F2", 8.5, 215, curY);
    curY -= 13;
  }

  // 5. Kotak Pas Foto 3x4 (x=440, y=curY + 70)
  addRect(435, curY + 65, 95, 125, 1);
  addText("PAS FOTO RESMI", "/F1", 7.5, 447, curY + 135);
  addText("3 x 4 cm", "/F1", 7.5, 465, curY + 122);
  addText("(Berwarna)", "/F1", 6.5, 462, curY + 110);

  curY -= 15;

  // 6. Ketentuan & Petunjuk Seleksi
  addText("B. KETENTUAN & JADWAL VERIFIKASI FISIK", "/F2", 10, 50, curY);
  curY -= 14;

  const rules: string[] = [
    "1. Kartu Peserta ini wajib dicetak dan dibawa saat verifikasi berkas dan seleksi wawancara.",
    "2. Membawa berkas fisik asli & fotokopi: Kartu Keluarga, Akta Kelahiran, dan Raport/SKL.",
    "3. Peserta Jalur Prestasi/Tahfidz wajib membawa Piagam/Sertifikat Kejuaraan & Syahadah asli.",
    "4. Peserta Jalur Afirmasi wajib menunjukkan kartu fisik KIP / PKH / KKS yang masih berlaku.",
    "5. Hadir di lokasi madrasah 30 menit sebelum jadwal observasi peminatan dimulai."
  ];

  for (const rule of rules) {
    addText(rule, "/F1", 8, 55, curY);
    curY -= 12;
  }

  curY -= 15;

  // 7. Pengesahan / Tanda Tangan
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  addText(`Dicetak pada: ${printDate}`, "/F1", 8, 50, curY);
  addText("Panitia PPDB Madrasah Aliyah,", "/F1", 9, 370, curY);
  curY -= 45;
  addText("( .................................................... )", "/F1", 8, 370, curY);
  curY -= 10;
  addText("NIP. Panitia Pelaksana PPDB", "/F1", 7.5, 370, curY);

  const streamContent = lines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const objects: string[] = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`
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
