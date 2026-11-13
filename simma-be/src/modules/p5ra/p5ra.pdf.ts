import type { StudentP5raReportData } from "./p5ra.types.js";

function escapePdfText(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateP5raReportPdf(data: StudentP5raReportData): Buffer {
  const lines: string[] = [];

  const addText = (
    text: string,
    font = "/F1",
    size = 10,
    x = 50,
    y = 750,
  ) => {
    lines.push(
      `BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`,
    );
  };

  let curY = 800;

  // Header / Kop
  addText(
    "KEMENTERIAN AGAMA REPUBLIK INDONESIA",
    "/F2",
    11,
    50,
    curY,
  );
  curY -= 15;
  addText(data.institution.name.toUpperCase(), "/F2", 13, 50, curY);
  curY -= 14;
  addText(
    `NSM: ${data.institution.nsm} | NPSN: ${data.institution.npsn} | ${data.institution.address}`,
    "/F1",
    8,
    50,
    curY,
  );
  curY -= 16;

  // Title
  addText(
    "RAPOR PROJEK PENGUATAN PROFIL PELAJAR PANCASILA & RAHMATAN LIL 'ALAMIN (P5RA)",
    "/F2",
    10,
    50,
    curY,
  );
  curY -= 18;

  // Identity block
  addText(
    `Nama Siswa: ${data.student.fullName}   |   NISN/NIS: ${data.student.nisn ?? "-"} / ${data.student.nis ?? "-"}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 13;
  addText(
    `Kelas: ${data.classroom.name} (Fase ${data.project.targetFase})   |   Semester: ${data.semester.type === 1 ? "1 (Ganjil)" : "2 (Genap)"}   |   Tahun Pelajaran: ${data.academicYear.name}`,
    "/F1",
    9,
    50,
    curY,
  );
  curY -= 13;
  addText(
    `Projek: ${data.project.title} (Tema: ${data.project.theme})`,
    "/F2",
    9,
    50,
    curY,
  );
  curY -= 18;

  // Section A: Capaian Dimensi & Target Projek
  addText("A. CAPAIAN DIMENSI DAN TARGET PROJEK", "/F2", 10, 50, curY);
  curY -= 14;
  addText(
    "No   Dimensi / Rahmatan Lil 'Alamin      Target Capaian & Sub-Elemen              Predikat",
    "/F2",
    8,
    50,
    curY,
  );
  curY -= 12;

  data.targetsWithAssessment.slice(0, 10).forEach((item, idx) => {
    const num = String(idx + 1).padEnd(4, " ");
    const dim = `${item.target.dimension} / ${item.target.valuePra}`
      .slice(0, 32)
      .padEnd(35, " ");
    const desc = (item.target.targetDescription || item.target.element || "-")
      .slice(0, 40)
      .padEnd(45, " ");
    const pred = item.assessment?.predicate ? `[ ${item.assessment.predicate} ]` : "[ - ]";
    addText(`${num}${dim}${desc}${pred}`, "/F1", 8, 50, curY);
    curY -= 12;
  });

  curY -= 8;
  addText(
    "Keterangan Predikat: MB = Mulai Berkembang | SB = Sedang Berkembang | BSH = Berkembang Sesuai Harapan | SAB = Sangat Berkembang",
    "/F1",
    7,
    50,
    curY,
  );
  curY -= 16;

  // Section B: Catatan Proses Perkembangan
  addText("B. CATATAN PROSES PERKEMBANGAN", "/F2", 10, 50, curY);
  curY -= 14;
  const notesText = data.processNotes?.processNotes ?? "Peserta didik telah berpartisipasi aktif dalam kegiatan projek.";
  // Wrap into two lines if long
  const line1 = notesText.slice(0, 95);
  const line2 = notesText.slice(95, 190);
  addText(line1, "/F1", 8, 50, curY);
  curY -= 11;
  if (line2) {
    addText(line2, "/F1", 8, 50, curY);
    curY -= 11;
  }
  curY -= 15;

  // Signatures
  addText(`Diberikan di: Padang, ${data.dateGenerated}`, "/F1", 8, 380, curY);
  curY -= 14;
  addText("Mengetahui,", "/F1", 9, 50, curY);
  addText("Fasilitator Projek / Wali Kelas,", "/F1", 9, 380, curY);
  curY -= 40;
  addText("Kepala Madrasah", "/F2", 9, 50, curY);
  addText("Koordinator P5RA", "/F2", 9, 380, curY);

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
