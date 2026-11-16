import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma123@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { FinanceService } from "./finance.service.js";
import type { FinanceRepository } from "./finance.repository.js";
import {
  CreateFeeItemSchema,
  GenerateInvoicesSchema,
  ProcessPaymentSchema,
  CreateDispensationSchema,
} from "./finance.schema.js";
import { generatePaymentReceiptPdf } from "./finance.pdf.js";

function createMockFinanceRepo(): FinanceRepository {
  return {
    findFeeItems: vi.fn(),
    findFeeItemById: vi.fn(),
    findFeeItemByCode: vi.fn(),
    createFeeItem: vi.fn(),
    updateFeeItem: vi.fn(),
    deleteFeeItem: vi.fn(),
    findInvoices: vi.fn(),
    findInvoiceById: vi.fn(),
    findExistingInvoice: vi.fn(),
    countInvoicesForYear: vi.fn(),
    findActiveStudentsForGeneration: vi.fn(),
    createInvoicesBulk: vi.fn(),
    searchActiveStudents: vi.fn(),
    findStudentWithClass: vi.fn(),
    findUnpaidInvoicesByStudent: vi.fn(),
    findTransactionsByStudentId: vi.fn(),
    findTransactionById: vi.fn(),
    findTransactionItems: vi.fn(),
    countTransactionsByPeriod: vi.fn(),
    updateInvoicePayment: vi.fn(),
    createTransaction: vi.fn(),
    voidTransaction: vi.fn(),
    findInstitution: vi.fn(),
    findDispensations: vi.fn(),
    findDispensationById: vi.fn(),
    createDispensation: vi.fn(),
    updateDispensation: vi.fn(),
    getCashflowSummary: vi.fn(),
    getArrearsSummary: vi.fn(),
  } as unknown as FinanceRepository;
}

const mockFeeItem = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "SPP Bulanan Kelas X",
  code: "SPP-X",
  type: "rutin" as const,
  category: "spp" as const,
  amount: 250000,
  academicYearId: null,
  gradeLevel: 10,
  description: "SPP reguler kelas 10",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Finance Module", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid fee item creation", () => {
      const valid = {
        name: "SPP Bulanan Kelas X",
        code: "SPP-X",
        type: "rutin",
        category: "spp",
        amount: 250000,
        gradeLevel: 10,
      };
      const parsed = CreateFeeItemSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid fee item amount", () => {
      const invalid = {
        name: "SPP",
        code: "SPP-1",
        type: "rutin",
        category: "spp",
        amount: -1000,
      };
      const parsed = CreateFeeItemSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates bulk invoice generation schema", () => {
      const valid = {
        feeItemId: "22222222-2222-2222-2222-222222222222",
        year: 2026,
        month: 7,
        dueDate: "2026-07-10",
      };
      const parsed = GenerateInvoicesSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("validates cashier payment checkout schema", () => {
      const valid = {
        studentId: "33333333-3333-3333-3333-333333333333",
        paymentMethod: "tunai",
        receivedAmount: 300000,
        items: [
          {
            invoiceId: "44444444-4444-4444-4444-444444444444",
            amount: 250000,
          },
        ],
      };
      const parsed = ProcessPaymentSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("validates dispensation request schema", () => {
      const valid = {
        studentId: "33333333-3333-3333-3333-333333333333",
        reason: "Menunggu pencairan beasiswa BAZNAS",
      };
      const parsed = CreateDispensationSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe("FinanceService", () => {
    let mockRepo: FinanceRepository;
    let service: FinanceService;

    beforeEach(() => {
      mockRepo = createMockFinanceRepo();
      service = new FinanceService(mockRepo);
    });

    it("lists fee items with filter", async () => {
      vi.mocked(mockRepo.findFeeItems).mockResolvedValue([mockFeeItem]);
      const res = await service.listFeeItems({ category: "spp" });
      expect(res).toHaveLength(1);
      expect(res[0].code).toBe("SPP-X");
    });

    it("creates fee item successfully", async () => {
      vi.mocked(mockRepo.findFeeItemByCode).mockResolvedValue(null);
      vi.mocked(mockRepo.createFeeItem).mockResolvedValue(mockFeeItem);

      const res = await service.createFeeItem({
        name: "SPP Bulanan Kelas X",
        code: "SPP-X",
        type: "rutin",
        category: "spp",
        amount: 250000,
      });

      expect(res.name).toBe("SPP Bulanan Kelas X");
      expect(mockRepo.createFeeItem).toHaveBeenCalled();
    });

    it("throws error when creating duplicate fee item code", async () => {
      vi.mocked(mockRepo.findFeeItemByCode).mockResolvedValue(mockFeeItem);
      await expect(
        service.createFeeItem({
          name: "SPP Bulanan Kelas X Baru",
          code: "SPP-X",
          type: "rutin",
          category: "spp",
          amount: 250000,
        })
      ).rejects.toThrow("sudah digunakan");
    });

    it("generates bulk invoices for eligible students", async () => {
      vi.mocked(mockRepo.findFeeItemById).mockResolvedValue(mockFeeItem);
      vi.mocked(mockRepo.findActiveStudentsForGeneration).mockResolvedValue([
        { studentId: "std-1", classroomId: "cls-1" },
        { studentId: "std-2", classroomId: "cls-1" },
      ]);
      vi.mocked(mockRepo.countInvoicesForYear).mockResolvedValue(10);
      vi.mocked(mockRepo.findExistingInvoice).mockResolvedValue(null as any);
      vi.mocked(mockRepo.createInvoicesBulk).mockResolvedValue(2);

      const result = await service.generateBulkInvoices({
        feeItemId: mockFeeItem.id,
        year: 2026,
        month: 7,
      });

      expect(result.totalEligible).toBe(2);
      expect(result.generated).toBe(2);
      expect(result.skipped).toBe(0);
    });

    it("retrieves student billing profile", async () => {
      vi.mocked(mockRepo.findStudentWithClass).mockResolvedValue({
        id: "std-1",
        fullName: "Ahmad Zaki",
        nis: "2026001",
        nisn: "0012345678",
        gender: "L",
        status: "aktif",
        classroomId: "cls-1",
        classroomName: "X-A",
      });
      vi.mocked(mockRepo.findUnpaidInvoicesByStudent).mockResolvedValue([
        {
          invoice: {
            id: "inv-1",
            invoiceNumber: "INV/2026/00001",
            studentId: "std-1",
            feeItemId: mockFeeItem.id,
            classroomId: "cls-1",
            amount: 250000,
            paidAmount: 0,
            remainingAmount: 250000,
            status: "unpaid",
            month: 7,
            year: 2026,
            dueDate: "2026-07-10",
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          feeName: "SPP Bulan Juli",
          feeCategory: "spp",
        },
      ]);
      vi.mocked(mockRepo.findTransactionsByStudentId).mockResolvedValue([]);
      vi.mocked(mockRepo.findDispensations).mockResolvedValue([]);

      const profile = await service.getStudentBillingProfile("std-1");
      expect(profile.student.fullName).toBe("Ahmad Zaki");
      expect(profile.totalArrears).toBe(250000);
      expect(profile.unpaidInvoices).toHaveLength(1);
    });
  });

  describe("Receipt PDF Generator", () => {
    it("generates a valid PDF buffer for receipt", async () => {
      const receiptData = {
        transaction: {
          id: "trx-123",
          receiptNumber: "KW/2026/03/0001",
          totalAmount: 250000,
          receivedAmount: 300000,
          changeAmount: 50000,
          paymentMethod: "tunai" as const,
          status: "success" as const,
          paymentDate: new Date("2026-03-31T10:00:00Z"),
          notes: "Lunas",
        },
        student: {
          fullName: "Fatimah Zahra",
          nis: "2026002",
          nisn: "0012345679",
          classroomName: "X-IPA-1",
        },
        cashierName: "Ustadz Bendahara",
        items: [
          {
            feeName: "SPP Bulan Maret 2026",
            invoiceNumber: "INV/2026/00045",
            month: 3,
            year: 2026,
            amount: 250000,
          },
        ],
        institution: {
          name: "MA Negeri 1 SIMMA",
          nsm: "131132010001",
          npsn: "20100001",
          address: "Jl. Pendidikan No. 45, Jakarta",
        },
      };

      const pdfBuffer = await generatePaymentReceiptPdf(receiptData as any);
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(500);
      expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
    });
  });
});
