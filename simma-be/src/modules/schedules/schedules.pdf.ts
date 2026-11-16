import type { SchedulePdfData } from "./schedules.types.js";

function escapePdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateScheduleLandscapePdf(data: SchedulePdfData): Buffer {
  const lines: string[] = [];

  const addText = (
    text: string,
    font = "/F1",
    size = 9,
    x = 40,
    y = 500,
  ) => {
    lines.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escapePdf(text)}) Tj ET`);
  };

  const addLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width = 0.5,
  ) => {
    lines.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Canvas bounds: A4 Landscape is 842 pt width, 595 pt height
  const pageWidth = 842;
  let curY = 560;

  // Header / Kop
  addText("KEMENTERIAN AGAMA REPUBLIK INDONESIA", "/F2", 9, 40, curY);
  curY -= 12;
  addText(data.institution.name.toUpperCase(), "/F2", 12, 40, curY);
  curY -= 11;
  addText(
    `NSM: ${data.institution.nsm ?? "-"} | NPSN: ${data.institution.npsn ?? "-"} | ${data.institution.address ?? "Madrasah Aliyah SIMMA"}`,
    "/F1",
    8,
    40,
    curY,
  );
  curY -= 10;
  addLine(40, curY, pageWidth - 40, curY, 1.2);
  curY -= 16;

  // Title & Metadata
  addText(data.title.toUpperCase(), "/F2", 11, 40, curY);
  curY -= 12;
  addText(
    `${data.subTitle} | ${data.targetName} | Semester ${data.semesterType} TA ${data.academicYearName}`,
    "/F1",
    8.5,
    40,
    curY,
  );
  curY -= 15;

  // Table Setup
  const tableX = 40;
  const colTimeWidth = 86;
  const colDayWidth = (pageWidth - 80 - colTimeWidth) / data.days.length; // 6 days = 119 pt each
  const rowHeight = 22;

  // Table Header Background & Text
  const headerY = curY;
  addLine(tableX, headerY, pageWidth - 40, headerY, 1);
  addText("JAM / WAKTU", "/F2", 8, tableX + 8, headerY - 14);

  data.days.forEach((day, index) => {
    const colX = tableX + colTimeWidth + index * colDayWidth;
    addText(day.toUpperCase(), "/F2", 8, colX + 8, headerY - 14);
  });

  curY -= rowHeight;
  addLine(tableX, curY, pageWidth - 40, curY, 1);

  // Table Body Rows (cap max 12 slots per single landscape page view)
  const displaySlots = data.timeSlots.slice(0, 12);
  displaySlots.forEach((slot) => {
    const rowY = curY;

    // Slot time & label
    addText(`${slot.name}`, "/F2", 7.5, tableX + 4, rowY - 10);
    addText(`${slot.startTime}-${slot.endTime}`, "/F1", 6.5, tableX + 4, rowY - 18);

    if (!slot.isTeachingTime) {
      // Non-teaching break row
      const label =
        slot.sessionType === "sholat"
          ? "SHOLAT BERJAMA'AH"
          : slot.sessionType === "istirahat"
            ? "ISTIRAHAT"
            : slot.name.toUpperCase();
      addText(label, "/F2", 8, tableX + colTimeWidth + 20, rowY - 14);
    } else {
      // Day cells
      data.days.forEach((day, dayIndex) => {
        const colX = tableX + colTimeWidth + dayIndex * colDayWidth;
        const cellData = data.matrix[slot.id]?.[day];

        if (cellData && cellData.title) {
          addText(cellData.title.slice(0, 18), "/F2", 7.5, colX + 4, rowY - 9);
          const sub = cellData.subtitle ? cellData.subtitle.slice(0, 20) : "";
          addText(sub, "/F1", 6.5, colX + 4, rowY - 17);
        } else {
          addText("-", "/F1", 7, colX + 10, rowY - 13);
        }
      });
    }

    curY -= rowHeight;
    addLine(tableX, curY, pageWidth - 40, curY, 0.5);
  });

  // Vertical lines for table
  addLine(tableX, headerY, tableX, curY, 1);
  addLine(tableX + colTimeWidth, headerY, tableX + colTimeWidth, curY, 0.8);
  data.days.forEach((_, idx) => {
    const x = tableX + colTimeWidth + (idx + 1) * colDayWidth;
    addLine(x, headerY, x, curY, 0.8);
  });

  curY -= 15;

  // Signatures
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  addText(
    `* Dokumen ini digenerate otomatis melalui SIMMA Timetabling Engine pada ${dateStr}`,
    "/F1",
    7,
    40,
    curY,
  );

  const signX = pageWidth - 200;
  addText("Mengetahui,", "/F1", 8.5, signX, curY);
  curY -= 11;
  addText(data.signatoryTitle, "/F2", 8.5, signX, curY);
  curY -= 36;
  addText(`( ${data.signatoryName} )`, "/F2", 8.5, signX, curY);

  // Assemble PDF stream
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
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
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
