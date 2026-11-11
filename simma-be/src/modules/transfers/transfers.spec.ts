import { describe, it, expect, vi } from "vitest";
import {
  evaluateClearanceStatus,
  generateTransferReference,
  generateVerificationCode,
} from "./transfers.clearance.js";
import {
  generateTransferOutLetterPdf,
  generateGraduationSklPdf,
} from "./transfers.pdf.js";
import { TransfersService } from "./transfers.service.js";

describe("Modul 15 Transfers & Graduation Unit Tests", () => {
  describe("Clearance Logic & Helpers", () => {
    it("should evaluate clearance status as pending when nothing cleared", () => {
      const result = evaluateClearanceStatus({
        libraryCleared: false,
        financeCleared: false,
        disciplineCleared: false,
      });
      expect(result.status).toBe("pending");
      expect(result.allCleared).toBe(false);
      expect(result.clearedCount).toBe(0);
    });

    it("should evaluate clearance status as in_progress when partially cleared", () => {
      const result = evaluateClearanceStatus({
        libraryCleared: true,
        financeCleared: false,
        disciplineCleared: false,
      });
      expect(result.status).toBe("in_progress");
      expect(result.allCleared).toBe(false);
      expect(result.clearedCount).toBe(1);
    });

    it("should evaluate clearance status as cleared when all 3 dimensions cleared", () => {
      const result = evaluateClearanceStatus({
        libraryCleared: true,
        financeCleared: true,
        disciplineCleared: true,
      });
      expect(result.status).toBe("cleared");
      expect(result.allCleared).toBe(true);
      expect(result.clearedCount).toBe(3);
    });

    it("should generate proper transfer reference formats", () => {
      const refIn = generateTransferReference("masuk");
      const refOut = generateTransferReference("keluar");
      const year = new Date().getFullYear().toString();

      expect(refIn.startsWith(`MUT-IN/${year}/`)).toBe(true);
      expect(refOut.startsWith(`MUT-OUT/${year}/`)).toBe(true);
    });

    it("should generate 8-character hex verification code", () => {
      const code = generateVerificationCode();
      expect(code).toHaveLength(8);
      expect(/^[0-9A-F]{8}$/.test(code)).toBe(true);
    });
  });

  describe("PDF Generation Native Buffers", () => {
    it("should generate valid PDF buffer for transfer out letter", () => {
      const pdf = generateTransferOutLetterPdf({
        institutionName: "Madrasah Aliyah SIMMA",
        institutionAddress: "Jl. Lapangan No. 5",
        nsm: "131132010001",
        npsn: "69900012",
        referenceNumber: "MUT-OUT/2026/A1B2C3",
        studentName: "Muhammad Farhan",
        nisn: "0061234567",
        nis: "2024001",
        gender: "Laki-laki",
        birthInfo: "Jakarta, 12 Mei 2008",
        currentClass: "X-A",
        destinationSchool: "MAN 2 Model",
        reason: "Pindah domisili orang tua",
        transferDate: "2026-06-20",
        verificationCode: "A1B2C3D4",
        headmasterName: "Dr. H. Ahmad Fauzi, M.Pd",
      });

      expect(Buffer.isBuffer(pdf)).toBe(true);
      const str = pdf.toString("latin1");
      expect(str.startsWith("%PDF-1.4")).toBe(true);
      expect(str.includes("%%EOF")).toBe(true);
      expect(str.includes("Muhammad Farhan")).toBe(true);
      expect(str.includes("A1B2C3D4")).toBe(true);
    });

    it("should generate valid PDF buffer for graduation SKL", () => {
      const pdf = generateGraduationSklPdf({
        institutionName: "Madrasah Aliyah SIMMA",
        institutionAddress: "Jl. Lapangan No. 5",
        sklNumber: "SKL/2026/001",
        studentName: "Fatimah Azzahra",
        nisn: "0069876543",
        nis: "2023055",
        academicYear: "2025/2026",
        graduationDate: "2026-05-15",
        headmasterName: "Dr. H. Ahmad Fauzi, M.Pd",
      });

      expect(Buffer.isBuffer(pdf)).toBe(true);
      const str = pdf.toString("latin1");
      expect(str.startsWith("%PDF-1.4")).toBe(true);
      expect(str.includes("%%EOF")).toBe(true);
      expect(str.includes("Fatimah Azzahra")).toBe(true);
      expect(str.includes("SKL/2026/001")).toBe(true);
    });
  });

  describe("Transfers Service Boundary & State Transitions", () => {
    const mockRepo: any = {
      findTransfers: vi.fn(),
      findTransferById: vi.fn(),
      findTransferByVerificationCode: vi.fn(),
      createTransferIn: vi.fn(),
      createTransferOut: vi.fn(),
      updateClearance: vi.fn(),
      finalizeTransferApproval: vi.fn(),
      getStats: vi.fn(),
      getInstitutionInfo: vi.fn(),
    };
    const mockGradRepo: any = {
      findGraduations: vi.fn(),
      processGraduationBatch: vi.fn(),
      getGraduationStats: vi.fn(),
    };

    const service = new TransfersService(mockRepo, mockGradRepo);

    it("should reject clearance update if transfer status is not pending_clearance", async () => {
      mockRepo.findTransferById.mockResolvedValueOnce({
        id: "trans-1",
        status: "completed",
      });

      await expect(
        service.updateClearance("trans-1", "library", true, "user-1")
      ).rejects.toThrow("Clearance hanya dapat diperbarui pada status pending_clearance");
    });

    it("should reject approval if transfer status is not pending_approval", async () => {
      mockRepo.findTransferById.mockResolvedValueOnce({
        id: "trans-1",
        status: "pending_clearance",
      });

      await expect(
        service.approveTransfer("trans-1", true, "headmaster-1")
      ).rejects.toThrow("Persetujuan hanya dapat dilakukan setelah seluruh clearance selesai");
    });

    it("should reject PDF download if transfer is not completed or not keluar", async () => {
      mockRepo.findTransferById.mockResolvedValueOnce({
        id: "trans-1",
        type: "masuk",
        status: "completed",
      });

      await expect(service.generatePdf("trans-1")).rejects.toThrow(
        "PDF surat keterangan hanya tersedia untuk mutasi keluar yang telah disetujui"
      );
    });

    it("should succeed approval and create verification code when approved", async () => {
      mockRepo.findTransferById.mockResolvedValueOnce({
        id: "trans-1",
        status: "pending_approval",
      });
      mockRepo.finalizeTransferApproval.mockResolvedValueOnce({
        id: "trans-1",
        status: "completed",
      });

      const res = await service.approveTransfer("trans-1", true, "headmaster-1", "Disetujui");
      expect(res.status).toBe("completed");
      expect(mockRepo.finalizeTransferApproval).toHaveBeenCalledWith(
        "trans-1",
        true,
        "headmaster-1",
        "Disetujui",
        expect.any(String)
      );
    });
  });
});
