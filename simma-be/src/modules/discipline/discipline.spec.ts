import { describe, it, expect } from "vitest";
import {
  calculateDisciplineBalance,
  determineSanctionLevel,
  evaluateEscalation,
  formatSummonLetterNumber,
} from "./discipline.escalation.js";
import { generateParentSummonPdf } from "./discipline.pdf.js";
import type { StudentInfractionRecord, SummonLetterPdfData } from "./discipline.types.js";

describe("Modul 16 Tata Tertib & Kedisiplinan BK - Logic & Unit Tests", () => {
  it("harus menghitung poin netral santri secara tepat dengan reduksi reward", () => {
    const records = [
      { points: 15, type: "infraction" as const, status: "approved" as const },
      { points: 30, type: "infraction" as const, status: "approved" as const },
      { points: 10, type: "reward" as const, status: "approved" as const },
      { points: 100, type: "infraction" as const, status: "pending_approval" as const }, // belum di-approve, jangan dihitung
    ];

    const result = calculateDisciplineBalance(records);

    expect(result.infractionPoints).toBe(45);
    expect(result.rewardPoints).toBe(10);
    expect(result.netPoints).toBe(35);
    expect(result.totalInfractions).toBe(2);
    expect(result.totalRewards).toBe(1);
  });

  it("poin netral santri tidak boleh kurang dari nol jika reward melebihi pelanggaran", () => {
    const records = [
      { points: 10, type: "infraction" as const, status: "approved" as const },
      { points: 50, type: "reward" as const, status: "approved" as const },
    ];

    const result = calculateDisciplineBalance(records);
    expect(result.netPoints).toBe(0);
  });

  it("harus menentukan level sanksi berjenjang sesuai PRD Kemenag", () => {
    expect(determineSanctionLevel(10)).toBe("normal");
    expect(determineSanctionLevel(25)).toBe("teguran_lisan");
    expect(determineSanctionLevel(45)).toBe("teguran_lisan");
    expect(determineSanctionLevel(50)).toBe("sp_1");
    expect(determineSanctionLevel(60)).toBe("sp_1");
    expect(determineSanctionLevel(75)).toBe("sp_2");
    expect(determineSanctionLevel(90)).toBe("sp_2");
    expect(determineSanctionLevel(100)).toBe("sp_3");
    expect(determineSanctionLevel(120)).toBe("sp_3");
  });

  it("harus memicu rekomendasi eskalasi dan panggilan ortu saat melampaui 50 poin (Acceptance Criteria)", () => {
    // Given Siswa Farid memiliki 45 poin
    const initialRecords = [
      { points: 30, type: "infraction" as const, status: "approved" as const },
      { points: 15, type: "infraction" as const, status: "approved" as const },
    ];
    const initialEscalation = evaluateEscalation("student-farid", initialRecords);
    expect(initialEscalation.sanctionLevel).toBe("teguran_lisan");
    expect(initialEscalation.requiresSummon).toBe(false);

    // When guru menginput pelanggaran 15 poin tambahan sehingga total = 60 poin
    const updatedRecords = [
      ...initialRecords,
      { points: 15, type: "infraction" as const, status: "approved" as const },
    ];
    const updatedEscalation = evaluateEscalation("student-farid", updatedRecords);

    // Then status eskalasi berubah menjadi SP-1 Aktif dan memicu panggilan ortu
    expect(updatedEscalation.netPoints).toBe(60);
    expect(updatedEscalation.sanctionLevel).toBe("sp_1");
    expect(updatedEscalation.requiresSummon).toBe(true);
    expect(updatedEscalation.exceededFiftyPoints).toBe(true);
    expect(updatedEscalation.recommendedAction).toContain("SP-1 aktif");
  });

  it("harus memformat nomor surat panggilan resmi naskah dinas secara tepat", () => {
    const numSp1 = formatSummonLetterNumber(1, "sp_1", 2026);
    expect(numSp1).toBe("001/MA.SIMMA/BK.SP-1/2026");

    const numSp2 = formatSummonLetterNumber(14, "sp_2", 2026);
    expect(numSp2).toBe("014/MA.SIMMA/BK.SP-2/2026");

    const numSp3 = formatSummonLetterNumber(105, "sp_3", 2026);
    expect(numSp3).toBe("105/MA.SIMMA/BK.SP-3/2026");
  });

  it("harus menghasilkan buffer PDF resmi Surat Panggilan Orang Tua yang valid", () => {
    const pdfData: SummonLetterPdfData = {
      institution: {
        name: "Madrasah Aliyah Negeri SIMMA",
        nsm: "131232010001",
        npsn: "20278910",
        address: "Jl. Pendidikan No. 44 Jakarta Selatan",
      },
      summon: {
        id: "summon-uuid-1",
        letterNumber: "001/MA.SIMMA/BK.SP-1/2026",
        studentId: "student-uuid-farid",
        parentName: "Bapak Rahmat Hidayat",
        summonDate: "2026-11-15",
        summonTime: "09:00 WIB",
        location: "Ruang Bimbingan Konseling (BK) Lantai 2",
        reason: "Pembinaan akumulasi 60 poin pelanggaran disiplin (Merokok di belakang kantin)",
        sanctionLevel: "sp_1",
        status: "terbit",
        notes: null,
        issuedById: "teacher-bk-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      student: {
        fullName: "Farid Ahmad",
        nisn: "0081234567",
        nis: "20261001",
        className: "XI-IPA-1",
      },
      infractionsSummary: {
        totalPoints: 60,
        netPoints: 60,
        items: [
          {
            date: "2026-11-10",
            title: "Merokok di Belakang Kantin",
            category: "sedang",
            points: 15,
          },
          {
            date: "2026-11-02",
            title: "Meninggalkan Kelas Tanpa Izin (Bolos)",
            category: "sedang",
            points: 30,
          },
          {
            date: "2026-10-25",
            title: "Terlambat Masuk Madrasah",
            category: "ringan",
            points: 15,
          },
        ],
      },
      counselorName: "Dra. Siti Rahmah, M.Pd (Guru BK)",
      principalName: "H. Ahmad Fauzi, M.Pd (Waka Kesiswaan)",
    };

    const pdfBuffer = generateParentSummonPdf(pdfData);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500);

    const pdfString = pdfBuffer.toString("utf-8");
    expect(pdfString.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfString).toContain("SURAT PANGGILAN ORANG TUA");
    expect(pdfString).toContain("Farid Ahmad");
    expect(pdfString).toContain("001/MA.SIMMA/BK.SP-1/2026");
    expect(pdfString).toContain("%%EOF");
  });
});
