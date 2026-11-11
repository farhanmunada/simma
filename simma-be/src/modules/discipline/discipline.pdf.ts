import type { SummonLetterPdfData } from "./discipline.types.js";

function escapePdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateParentSummonPdf(data: SummonLetterPdfData): Buffer {
  const lines: string[] = [];

  const addText = (
    text: string,
    font = "/F1",
    size = 10,
    x = 54,
    y = 750,
  ) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  };

  const addLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width = 1,
  ) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  let curY = 800;

  // 1. Kop Surat Resmi Kemenag
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 11, 140, curY);
  curY -= 14;
  addText(data.institution.name.toUpperCase(), "/F2", 12, 130, curY);
  curY -= 13;
  addText(
    `NSM: ${data.institution.nsm ?? "131232010001"} | NPSN: ${data.institution.npsn ?? "20278910"} | ${data.institution.address ?? "Jl. Pendidikan No. 44"}`,
    "/F1",
    8.5,
    90,
    curY,
  );
  curY -= 8;

  // Garis Kop Ganda
  addLine(54, curY, 540, curY, 2);
  curY -= 2;
  addLine(54, curY, 540, curY, 0.5);
  curY -= 24;

  // 2. Metadata Surat (Nomor, Sifat, Lampiran, Hal) & Tanggal
  const formattedCreated = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  addText(`Nomor      : ${data.summon.letterNumber}`, "/F1", 9.5, 54, curY);
  addText(`${formattedCreated}`, "/F1", 9.5, 410, curY);
  curY -= 14;
  addText("Sifat         : Penting / Terbatas", "/F1", 9.5, 54, curY);
  curY -= 14;
  addText("Lampiran  : Lembar Catatan Disiplin", "/F1", 9.5, 54, curY);
  curY -= 14;
  addText("Hal           : SURAT PANGGILAN ORANG TUA / WALI", "/F2", 9.5, 54, curY);
  curY -= 26;

  // 3. Penerima
  addText("Kepada Yth.", "/F1", 9.5, 54, curY);
  curY -= 13;
  addText(`Bapak / Ibu Orang Tua / Wali dari:`, "/F1", 9.5, 54, curY);
  curY -= 13;
  addText(
    `${data.student.fullName} (Kelas: ${data.student.className ?? "-"})`,
    "/F2",
    10,
    70,
    curY,
  );
  curY -= 13;
  addText("di Tempat", "/F1", 9.5, 54, curY);
  curY -= 24;

  // 4. Paragraf Pembuka
  addText("Assalamu'alaikum Warahmatullahi Wabarakatuh,", "/F1", 9.5, 54, curY);
  curY -= 14;
  addText(
    "Sehubungan dengan pembinaan tata tertib dan kedisiplinan santri di lingkungan madrasah,",
    "/F1",
    9.5,
    54,
    curY,
  );
  curY -= 13;
  addText(
    `dengan ini kami beritahukan bahwa putra/putri Bapak/Ibu telah mencapai akumulasi ${data.infractionsSummary.netPoints} poin`,
    "/F1",
    9.5,
    54,
    curY,
  );
  curY -= 13;
  addText(
    `dengan status penindakan: ${data.summon.sanctionLevel.toUpperCase().replace("_", " ")}.`,
    "/F2",
    9.5,
    54,
    curY,
  );
  curY -= 22;

  // 5. Rincian Undangan / Jadwal Temu
  addText(
    "Untuk itu kami mengharap kehadiran Bapak/Ibu ke madrasah pada:",
    "/F1",
    9.5,
    54,
    curY,
  );
  curY -= 16;

  addText(`Hari / Tanggal : ${data.summon.summonDate}`, "/F2", 9.5, 74, curY);
  curY -= 14;
  addText(`Waktu Pertemuan : ${data.summon.summonTime}`, "/F2", 9.5, 74, curY);
  curY -= 14;
  addText(`Tempat         : ${data.summon.location}`, "/F2", 9.5, 74, curY);
  curY -= 14;
  addText(`Keperluan      : ${data.summon.reason}`, "/F1", 9.5, 74, curY);
  curY -= 22;

  // 6. Ringkasan Pelanggaran Terakhir
  if (data.infractionsSummary.items.length > 0) {
    addText("Ringkasan Catatan Kejadian Pelanggaran Terakhir:", "/F2", 9, 54, curY);
    curY -= 13;
    addLine(54, curY, 540, curY, 0.5);
    curY -= 11;

    for (const item of data.infractionsSummary.items.slice(0, 3)) {
      addText(
        `- [${item.date}] ${item.title} (${item.category}, ${item.points} poin)`,
        "/F1",
        8.5,
        60,
        curY,
      );
      curY -= 11;
    }
    curY -= 8;
  }

  // 7. Paragraf Penutup
  addText(
    "Mengingat pentingnya pembinaan karakter santri, kami mohon Bapak/Ibu hadir tepat waktu.",
    "/F1",
    9.5,
    54,
    curY,
  );
  curY -= 13;
  addText(
    "Demikian surat undangan ini kami sampaikan. Atas kerja samanya kami ucapkan terima kasih.",
    "/F1",
    9.5,
    54,
    curY,
  );
  curY -= 14;
  addText("Wassalamu'alaikum Warahmatullahi Wabarakatuh.", "/F1", 9.5, 54, curY);
  curY -= 36;

  // 8. Tanda Tangan Resmi
  addText("Guru Bimbingan Konseling (BK),", "/F1", 9.5, 54, curY);
  addText("Mengetahui, Waka Kesiswaan,", "/F1", 9.5, 360, curY);
  curY -= 55;

  addText(data.counselorName ?? "( Guru BK )", "/F2", 9.5, 54, curY);
  addText(data.principalName ?? "( Waka Kesiswaan )", "/F2", 9.5, 360, curY);
  curY -= 12;
  addText("NIP. -", "/F1", 8.5, 54, curY);
  addText("NIP. -", "/F1", 8.5, 360, curY);

  // PDF stream wrapping
  const streamContent = lines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

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
stream
${streamContent}
endstream
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
0000000244 00000 n 
${String(300 + streamLength).padStart(10, "0")} 00000 n 
${String(367 + streamLength).padStart(10, "0")} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${440 + streamLength}
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}
