import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateQrCodeToken } from "./facilities.utils.js";
import { FacilitiesService } from "./facilities.service.js";
import type { FacilitiesRepository } from "./facilities.repository.js";
import {
  ConflictError,
  ValidationError,
  NotFoundError,
} from "../../core/errors/index.js";
import type {
  FacilityAssetRow,
  FacilityLoanRow,
  FacilityMaintenanceTicketRow,
} from "./facilities.types.js";

describe("Modul 19 Sarana & Prasarana - Unit Tests", () => {
  describe("QR Code Generator", () => {
    it("should generate QR code token with expected prefix and unique entropy", () => {
      const token1 = generateQrCodeToken("AST");
      const token2 = generateQrCodeToken("AST");

      expect(token1.startsWith("AST-")).toBe(true);
      expect(token2.startsWith("AST-")).toBe(true);
      expect(token1).not.toBe(token2);
    });
  });

  describe("FacilitiesService", () => {
    let mockRepo: any;
    let service: FacilitiesService;

    const dummyAsset: FacilityAssetRow = {
      id: "ast-1",
      code: "AST-INV-001",
      name: "Proyektor Epson EB-X500",
      category: "ELEKTRONIK",
      condition: "BAIK",
      location: "Ruang Guru",
      purchaseDate: "2024-01-10",
      sourceOfFund: "BOS",
      status: "TERSEDIA",
      qrCodeToken: "AST-QR-12345",
      notes: "Kondisi mulus",
      frontImageUrl: null,
      detailImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockRepo = {
        transaction: vi.fn(async (cb) => cb(mockRepo)),
        findAssets: vi.fn(),
        findAssetById: vi.fn(),
        findAssetByCode: vi.fn(),
        findAssetByQrToken: vi.fn(),
        createAsset: vi.fn(),
        updateAsset: vi.fn(),
        deleteAsset: vi.fn(),
        findLoans: vi.fn(),
        findLoanById: vi.fn(),
        findActiveLoanByAssetId: vi.fn(),
        createLoan: vi.fn(),
        updateLoan: vi.fn(),
        findTickets: vi.fn(),
        findTicketById: vi.fn(),
        createTicket: vi.fn(),
        updateTicket: vi.fn(),
        getStats: vi.fn(),
      };
      service = new FacilitiesService(mockRepo as unknown as FacilitiesRepository);
    });

    it("should throw ConflictError if asset code already exists on create", async () => {
      mockRepo.findAssetByCode.mockResolvedValueOnce(dummyAsset);

      await expect(
        service.createAsset({
          code: "AST-INV-001",
          name: "Duplicate Name",
          category: "ELEKTRONIK",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should create asset with auto-generated QR token and TERSEDIA status", async () => {
      mockRepo.findAssetByCode.mockResolvedValueOnce(undefined);
      mockRepo.createAsset.mockImplementationOnce(async (data: any) => ({
        id: "ast-created",
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.createAsset({
        code: "AST-INV-002",
        name: "Laptop HP Pavillion",
        category: "ELEKTRONIK",
      });

      expect(result.code).toBe("AST-INV-002");
      expect(result.status).toBe("TERSEDIA");
      expect(result.qrCodeToken).toBeDefined();
      expect(mockRepo.createAsset).toHaveBeenCalled();
    });

    it("should prevent borrowing an asset that is currently not available (DIPINJAM)", async () => {
      mockRepo.findAssetById.mockResolvedValueOnce({
        ...dummyAsset,
        status: "DIPINJAM",
      });

      await expect(
        service.createLoan({
          assetId: "ast-1",
          borrowerName: "Ahmad Siswa",
          borrowerType: "SISWA",
          loanDate: "2024-03-01",
          dueDate: "2024-03-03",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("should prevent borrowing an asset that is RUSAK_BERAT", async () => {
      mockRepo.findAssetById.mockResolvedValueOnce({
        ...dummyAsset,
        condition: "RUSAK_BERAT",
      });

      await expect(
        service.createLoan({
          assetId: "ast-1",
          borrowerName: "Ahmad Siswa",
          borrowerType: "SISWA",
          loanDate: "2024-03-01",
          dueDate: "2024-03-03",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("should create loan and update asset status to DIPINJAM atomically", async () => {
      mockRepo.findAssetById.mockResolvedValueOnce(dummyAsset);
      const createdLoan: FacilityLoanRow = {
        id: "loan-1",
        assetId: "ast-1",
        borrowerName: "Ustadz Mansur",
        borrowerType: "GTK",
        loanDate: "2024-03-01",
        dueDate: "2024-03-03",
        returnDate: null,
        status: "DIPINJAM",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.createLoan.mockResolvedValueOnce(createdLoan);

      const result = await service.createLoan({
        assetId: "ast-1",
        borrowerName: "Ustadz Mansur",
        borrowerType: "GTK",
        loanDate: "2024-03-01",
        dueDate: "2024-03-03",
      });

      expect(result.status).toBe("DIPINJAM");
      expect(mockRepo.updateAsset).toHaveBeenCalledWith(
        "ast-1",
        { status: "DIPINJAM" },
        expect.anything(),
      );
    });

    it("should return loan and restore asset status to TERSEDIA", async () => {
      const activeLoan: FacilityLoanRow = {
        id: "loan-1",
        assetId: "ast-1",
        borrowerName: "Ustadz Mansur",
        borrowerType: "GTK",
        loanDate: "2024-03-01",
        dueDate: "2024-03-03",
        returnDate: null,
        status: "DIPINJAM",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.findLoanById.mockResolvedValueOnce(activeLoan);
      mockRepo.updateLoan.mockResolvedValueOnce({
        ...activeLoan,
        status: "DIKEMBALIKAN",
        returnDate: "2024-03-03",
      });

      const result = await service.returnLoan("loan-1", {
        returnDate: "2024-03-03",
        condition: "BAIK",
      });

      expect(result.status).toBe("DIKEMBALIKAN");
      expect(mockRepo.updateAsset).toHaveBeenCalledWith(
        "ast-1",
        { status: "TERSEDIA", condition: "BAIK" },
        expect.anything(),
      );
    });

    it("should handle maintenance ticket lifecycle and update asset status accordingly", async () => {
      // Create ticket transitions asset condition
      mockRepo.findAssetById.mockResolvedValueOnce(dummyAsset);
      const ticket: FacilityMaintenanceTicketRow = {
        id: "ticket-1",
        assetId: "ast-1",
        reporterId: "user-1",
        reporterName: "Staff",
        title: "Lampu proyektor mati",
        description: "Mati mendadak saat presentasi",
        priority: "TINGGI",
        status: "MENUNGGU",
        cost: 150000,
        completedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.createTicket.mockResolvedValueOnce(ticket);

      await service.createTicket({
        assetId: "ast-1",
        title: "Lampu proyektor mati",
        description: "Mati mendadak saat presentasi",
        priority: "TINGGI",
      });

      expect(mockRepo.updateAsset).toHaveBeenCalledWith(
        "ast-1",
        { condition: "RUSAK_RINGAN" },
        expect.anything(),
      );

      // Transition ticket to PROSES updates asset to DALAM_PERBAIKAN
      mockRepo.findTicketById.mockResolvedValueOnce(ticket);
      mockRepo.updateTicket.mockResolvedValueOnce({
        ...ticket,
        status: "PROSES",
      });

      await service.updateTicket("ticket-1", { status: "PROSES" });
      expect(mockRepo.updateAsset).toHaveBeenCalledWith(
        "ast-1",
        { status: "DALAM_PERBAIKAN" },
        expect.anything(),
      );

      // Transition ticket to SELESAI restores asset to TERSEDIA & BAIK
      mockRepo.findTicketById.mockResolvedValueOnce({
        ...ticket,
        status: "PROSES",
      });
      mockRepo.updateTicket.mockResolvedValueOnce({
        ...ticket,
        status: "SELESAI",
        completedAt: new Date(),
      });

      await service.updateTicket("ticket-1", { status: "SELESAI" });
      expect(mockRepo.updateAsset).toHaveBeenCalledWith(
        "ast-1",
        { status: "TERSEDIA", condition: "BAIK" },
        expect.anything(),
      );
    });

    it("should reject deleting an asset that is currently DIPINJAM or DALAM_PERBAIKAN", async () => {
      mockRepo.findAssetById.mockResolvedValueOnce({
        ...dummyAsset,
        status: "DIPINJAM",
      });

      await expect(service.deleteAsset("ast-1")).rejects.toThrow(ValidationError);

      mockRepo.findAssetById.mockResolvedValueOnce({
        ...dummyAsset,
        status: "DALAM_PERBAIKAN",
      });

      await expect(service.deleteAsset("ast-1")).rejects.toThrow(ValidationError);
    });
  });
});
