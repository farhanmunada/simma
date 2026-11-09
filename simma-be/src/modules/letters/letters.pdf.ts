import type { OutgoingLetter } from "./letters.types.js";

function escapePdfText(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateOfficialLetterPdf(
  letter: OutgoingLetter,
  institutionName = "MADRASAH ALIYAH NEGERI SIMMA"
): Buffer {
  const lines: string[] = [];

  const addText = (text: string, font = "/F1", size = 10, x = 54, y = 750) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 1) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  const addRect = (x: number, y: number, w: number, h: number, width = 1) => {
    lines.push(`${width} w ${x} ${y} ${w} ${h} re S`);
  };

  let curY = 800;

  // 1. Kop Surat Resmi Kemenag
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 11, 140, curY);
  curY -= 14;
  addText("KANTOR KEMENTERIAN AGAMA KABUPATEN/KOTA", "/F2", 10, 130, curY);
  curY -= 14;
  addText(institutionName.toUpperCase(), "/F2", 12, 160, curY);
  curY -= 12;
  addText("Jl. Pendidikan No. 44, Telp (021) 7891011 — Website: www.madrasah.sch.id", "/F1", 8.5, 120, curY);
  curY -= 8;

  // Garis Kop Ganda
  addLine(54, curY, 540, curY, 2);
  curY -= 2;
  addLine(54, curY, 540, curY, 0.5);
  curY -= 25;

  // 2. Metadata Surat (Nomor, Sifat, Lampiran, Hal) & Tanggal
  const letterDateFormatted = new Date(letter.letterDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  addText(`Nomor      : ${letter.letterNumber}`, "/F1", 9.5, 54, curY);
  addText(`Jakarta, ${letterDateFormatted}`, "/F1", 9.5, 380, curY);
  curY -= 14;
  addText(`Sifat         : ${letter.securityDegree === "SR" ? "Sangat Rahasia" : letter.securityDegree === "R" ? "Rahasia" : "Biasa"}`, "/F1", 9.5, 54, curY);
  curY -= 14;
  addText("Lampiran  : -", "/F1", 9.5, 54, curY);
  curY -= 14;
  addText(`Hal           : ${letter.subject.length > 50 ? letter.subject.slice(0, 47) + "..." : letter.subject}`, "/F2", 9.5, 54, curY);
  curY -= 28;

  // 3. Penerima
  addText("Kepada Yth.", "/F1", 9.5, 54, curY);
  curY -= 14;
  addText(letter.recipient, "/F2", 10, 54, curY);
  curY -= 14;
  addText("di Tempat", "/F1", 9.5, 54, curY);
  curY -= 24;

  // 4. Isi Surat (Body Text)
  const contentBody = (letter.contentData as Record<string, string>)?.body || letter.subject;
  const rawParagraphs = contentBody.split("\n");

  for (const para of rawParagraphs) {
    if (para.trim().length === 0) {
      curY -= 10;
      continue;
    }
    // Simple line wrap at ~78 chars
    let remaining = para;
    while (remaining.length > 0) {
      const chunk = remaining.slice(0, 78);
      remaining = remaining.slice(78);
      const isBold = chunk.includes(":") && (chunk.startsWith("Nama") || chunk.startsWith("NISN") || chunk.startsWith("Hari"));
      addText(chunk, isBold ? "/F2" : "/F1", 9, 54, curY);
      curY -= 12;
      if (curY < 180) break;
    }
    curY -= 3;
    if (curY < 180) break;
  }

  // 5. Tanda Tangan & QR Code Verifikasi
  const sigY = Math.max(curY - 15, 120);

  // Box Verifikasi Dokumen Kemenag PMA 12/2024
  addRect(54, sigY - 45, 230, 50, 0.75);
  addText("VERIFIKASI KEASLIAN DOKUMEN DIGITAL", "/F2", 7, 60, sigY - 5);
  addText("Sesuai PMA RI No. 12 Tahun 2024 (Tata Naskah Dinas)", "/F1", 6.5, 60, sigY - 15);
  addText(`Hash: ${letter.verificationHash}`, "/F1", 6.5, 60, sigY - 26);
  addText("Pindai QR / Cek Validasi di Portal SIMMA", "/F2", 6.5, 60, sigY - 37);

  // Area Tanda Tangan Pejabat
  addText(letter.signerRole, "/F1", 9.5, 360, sigY);
  addText("Madrasah Aliyah SIMMA,", "/F1", 9.5, 360, sigY - 13);
  addText(`[ TTD Digital - ${letter.status.toUpperCase()} ]`, "/F2", 8, 360, sigY - 32);
  addText(letter.signerName, "/F2", 9.5, 360, sigY - 50);
  if (letter.signerNip) {
    addText(`NIP. ${letter.signerNip}`, "/F1", 8.5, 360, sigY - 62);
  }

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
