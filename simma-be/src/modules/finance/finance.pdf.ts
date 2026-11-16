import type { ReceiptPdfData } from "./finance.types.js";

function escapePdfText(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function generatePaymentReceiptPdf(data: ReceiptPdfData): Buffer {
  const lines: string[] = [];

  const addText = (text: string, font = "/F1", size = 10, x = 50, y = 750) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, width = 1) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  let curY = 800;

  // Header / Kop Kwitansi Madrasah
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 10, 50, curY);
  curY -= 14;
  addText(data.institution.name.toUpperCase(), "/F2", 12, 50, curY);
  curY -= 12;
  addText(
    `NSM: ${data.institution.nsm ?? "-"} | NPSN: ${data.institution.npsn ?? "-"} | ${data.institution.address ?? "Madrasah Aliyah SIMMA"}`,
    "/F1",
    8,
    50,
    curY,
  );
  curY -= 12;

  // Separator Line
  addLine(50, curY, 545, curY, 1.5);
  curY -= 16;

  // Title
  addText("TANDA TERIMA PEMBAYARAN SAH (KWITANSI KASIR)", "/F2", 11, 140, curY);
  curY -= 18;

  // Metadata Box
  const dateFormatted = new Date(data.transaction.paymentDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  addText(`No. Kwitansi  : ${data.transaction.receiptNumber}`, "/F2", 9, 50, curY);
  addText(`Tanggal Transaksi : ${dateFormatted}`, "/F1", 9, 320, curY);
  curY -= 14;

  addText(`Nama Siswa    : ${data.student.fullName}`, "/F2", 9, 50, curY);
  addText(`Metode Bayar      : ${data.transaction.paymentMethod.toUpperCase()}`, "/F1", 9, 320, curY);
  curY -= 14;

  addText(`NIS / NISN    : ${data.student.nis ?? "-"} / ${data.student.nisn ?? "-"}`, "/F1", 9, 50, curY);
  addText(`Kelas / Rombel    : ${data.student.classroomName ?? "-"}`, "/F1", 9, 320, curY);
  curY -= 14;

  addText(`Kasir Loket   : ${data.cashierName}`, "/F1", 9, 50, curY);
  addText(`Status            : ${data.transaction.status.toUpperCase()}`, "/F2", 9, 320, curY);
  curY -= 20;

  // Items Table Header
  addLine(50, curY, 545, curY, 0.75);
  curY -= 12;
  addText("No", "/F2", 8.5, 54, curY);
  addText("Pos Tagihan / Keterangan", "/F2", 8.5, 80, curY);
  addText("No. Invoice", "/F2", 8.5, 270, curY);
  addText("Periode", "/F2", 8.5, 390, curY);
  addText("Nominal", "/F2", 8.5, 470, curY);
  curY -= 6;
  addLine(50, curY, 545, curY, 0.75);
  curY -= 14;

  // Items Rows
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  data.items.forEach((item, idx) => {
    const periodStr = item.month ? `${monthNames[item.month - 1]} ${item.year}` : `${item.year}`;
    addText(String(idx + 1), "/F1", 8.5, 54, curY);
    addText(item.feeName, "/F1", 8.5, 80, curY);
    addText(item.invoiceNumber, "/F1", 8.5, 270, curY);
    addText(periodStr, "/F1", 8.5, 390, curY);
    addText(formatRupiah(item.amount), "/F1", 8.5, 470, curY);
    curY -= 14;
  });

  // Items Table Footer
  curY += 2;
  addLine(50, curY, 545, curY, 0.75);
  curY -= 14;

  // Total, Received, Change
  addText("Total Bayar :", "/F2", 9.5, 380, curY);
  addText(formatRupiah(data.transaction.totalAmount), "/F2", 9.5, 470, curY);
  curY -= 14;

  addText("Nominal Diterima :", "/F1", 9, 380, curY);
  addText(formatRupiah(data.transaction.receivedAmount), "/F1", 9, 470, curY);
  curY -= 14;

  addText("Kembalian :", "/F1", 9, 380, curY);
  addText(formatRupiah(data.transaction.changeAmount), "/F1", 9, 470, curY);
  curY -= 28;

  // Stempel Digital & QR Note
  addText("* Dokumen ini merupakan bukti pembayaran sah yang diterbitkan oleh SIMMA Madrasah.", "/F1", 7.5, 50, curY);
  curY -= 10;
  addText("* Simpan tanda terima ini sebagai bukti pembayaran dan syarat pengambilan kartu ujian.", "/F1", 7.5, 50, curY);
  curY -= 30;

  // Signatures
  addText("Penyetor / Wali Murid,", "/F1", 9, 80, curY);
  addText("Petugas Kasir / Bendahara,", "/F1", 9, 380, curY);
  curY -= 50;
  addText("( .............................. )", "/F1", 9, 70, curY);
  addText(`( ${data.cashierName} )`, "/F2", 9, 370, curY);

  // Assemble PDF structure
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
