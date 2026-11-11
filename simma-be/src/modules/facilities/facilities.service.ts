import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../core/errors/index.js";
import { FacilitiesRepository } from "./facilities.repository.js";
import { generateQrCodeToken } from "./facilities.utils.js";
import type {
  CreateFacilityAssetInput,
  UpdateFacilityAssetInput,
  CreateFacilityLoanInput,
  ReturnFacilityLoanInput,
  CreateFacilityMaintenanceTicketInput,
  UpdateFacilityMaintenanceTicketInput,
  QueryFacilityAssetsInput,
  FacilityAssetRow,
  FacilityLoanRow,
  FacilityMaintenanceTicketRow,
  FacilityStats,
} from "./facilities.types.js";
import type {
  QueryLoansInput,
  QueryMaintenanceTicketsInput,
} from "./facilities.schema.js";

export class FacilitiesService {
  constructor(private readonly repo = new FacilitiesRepository()) {}

  // --- Assets ---
  async getAssets(filters: QueryFacilityAssetsInput): Promise<FacilityAssetRow[]> {
    return this.repo.findAssets(filters);
  }

  async getAssetById(id: string): Promise<FacilityAssetRow> {
    const asset = await this.repo.findAssetById(id);
    if (!asset) {
      throw new NotFoundError(`Aset fasilitas dengan ID ${id} tidak ditemukan`);
    }
    return asset;
  }

  async getAssetByQrToken(token: string): Promise<FacilityAssetRow> {
    const asset = await this.repo.findAssetByQrToken(token);
    if (!asset) {
      throw new NotFoundError(`Aset dengan QR token ${token} tidak ditemukan`);
    }
    return asset;
  }

  async createAsset(input: CreateFacilityAssetInput): Promise<FacilityAssetRow> {
    const existing = await this.repo.findAssetByCode(input.code);
    if (existing) {
      throw new ConflictError(`Aset dengan kode '${input.code}' sudah terdaftar`);
    }

    const qrCodeToken = generateQrCodeToken("SIMMA");
    return this.repo.createAsset({
      code: input.code,
      name: input.name,
      category: input.category,
      condition: input.condition || "BAIK",
      location: input.location ?? null,
      purchaseDate: input.purchaseDate ?? null,
      sourceOfFund: input.sourceOfFund ?? null,
      notes: input.notes ?? null,
      status: input.status || "TERSEDIA",
      qrCodeToken,
    });
  }

  async updateAsset(
    id: string,
    input: UpdateFacilityAssetInput,
  ): Promise<FacilityAssetRow> {
    const asset = await this.getAssetById(id);

    if (input.code && input.code !== asset.code) {
      const codeDuplicate = await this.repo.findAssetByCode(input.code);
      if (codeDuplicate) {
        throw new ConflictError(`Aset dengan kode '${input.code}' sudah ada`);
      }
    }

    const updated = await this.repo.updateAsset(id, {
      ...input,
      location: input.location !== undefined ? input.location : asset.location,
      notes: input.notes !== undefined ? input.notes : asset.notes,
      sourceOfFund:
        input.sourceOfFund !== undefined ? input.sourceOfFund : asset.sourceOfFund,
      purchaseDate:
        input.purchaseDate !== undefined ? input.purchaseDate : asset.purchaseDate,
    });

    return updated!;
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.getAssetById(id);
    if (asset.status === "DIPINJAM") {
      throw new ValidationError("Aset tidak dapat dihapus karena sedang dipinjam");
    }
    if (asset.status === "DALAM_PERBAIKAN") {
      throw new ValidationError(
        "Aset tidak dapat dihapus karena dalam proses perbaikan",
      );
    }
    await this.repo.deleteAsset(id);
  }

  // --- Loans (Atomic) ---
  async getLoans(filters: QueryLoansInput): Promise<FacilityLoanRow[]> {
    return this.repo.findLoans(filters);
  }

  async getLoanById(id: string): Promise<FacilityLoanRow> {
    const loan = await this.repo.findLoanById(id);
    if (!loan) {
      throw new NotFoundError(`Data peminjaman dengan ID ${id} tidak ditemukan`);
    }
    return loan;
  }

  async createLoan(input: CreateFacilityLoanInput): Promise<FacilityLoanRow> {
    const asset = await this.getAssetById(input.assetId);

    if (asset.status !== "TERSEDIA") {
      throw new ValidationError(
        `Aset '${asset.name}' tidak tersedia untuk dipinjam (Status saat ini: ${asset.status})`,
      );
    }

    if (asset.condition === "RUSAK_BERAT") {
      throw new ValidationError(
        `Aset '${asset.name}' mengalami kondisi rusak berat dan tidak layak dipinjam`,
      );
    }

    return this.repo.transaction(async (tx) => {
      const loan = await this.repo.createLoan(
        {
          assetId: input.assetId,
          borrowerName: input.borrowerName,
          borrowerType: input.borrowerType,
          loanDate: input.loanDate,
          dueDate: input.dueDate,
          status: "DIPINJAM",
          notes: input.notes ?? null,
        },
        tx,
      );

      await this.repo.updateAsset(
        input.assetId,
        { status: "DIPINJAM" },
        tx,
      );

      return loan;
    });
  }

  async returnLoan(
    id: string,
    input: ReturnFacilityLoanInput,
  ): Promise<FacilityLoanRow> {
    const loan = await this.getLoanById(id);
    if (loan.status === "DIKEMBALIKAN") {
      throw new ValidationError("Peminjaman ini sudah tercatat dikembalikan");
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const returnDate = input.returnDate || todayStr;

    return this.repo.transaction(async (tx) => {
      const updatedLoan = await this.repo.updateLoan(
        id,
        {
          returnDate,
          status: "DIKEMBALIKAN",
          notes: input.notes !== undefined ? input.notes : loan.notes,
        },
        tx,
      );

      const assetUpdate: Partial<FacilityAssetRow> = { status: "TERSEDIA" };
      if (input.condition) {
        assetUpdate.condition = input.condition;
      }
      await this.repo.updateAsset(loan.assetId, assetUpdate, tx);

      return updatedLoan!;
    });
  }

  // --- Maintenance Tickets (Atomic) ---
  async getTickets(
    filters: QueryMaintenanceTicketsInput,
  ): Promise<FacilityMaintenanceTicketRow[]> {
    return this.repo.findTickets(filters);
  }

  async getTicketById(id: string): Promise<FacilityMaintenanceTicketRow> {
    const ticket = await this.repo.findTicketById(id);
    if (!ticket) {
      throw new NotFoundError(`Tiket pemeliharaan dengan ID ${id} tidak ditemukan`);
    }
    return ticket;
  }

  async createTicket(
    input: CreateFacilityMaintenanceTicketInput,
    reporterId?: string,
  ): Promise<FacilityMaintenanceTicketRow> {
    const asset = await this.getAssetById(input.assetId);

    return this.repo.transaction(async (tx) => {
      const ticket = await this.repo.createTicket(
        {
          assetId: input.assetId,
          reporterId: reporterId ?? null,
          reporterName: input.reporterName ?? null,
          title: input.title,
          description: input.description,
          priority: input.priority || "SEDANG",
          status: "MENUNGGU",
          cost: input.cost ?? 0,
        },
        tx,
      );

      if (asset.condition === "BAIK") {
        await this.repo.updateAsset(
          input.assetId,
          { condition: "RUSAK_RINGAN" },
          tx,
        );
      }

      return ticket;
    });
  }

  async updateTicket(
    id: string,
    input: UpdateFacilityMaintenanceTicketInput,
  ): Promise<FacilityMaintenanceTicketRow> {
    const ticket = await this.getTicketById(id);

    return this.repo.transaction(async (tx) => {
      const updateData: Partial<FacilityMaintenanceTicketRow> = {
        status: input.status,
        priority: input.priority,
        cost: input.cost,
        notes: input.notes,
        completedAt: input.completedAt
          ? new Date(input.completedAt)
          : input.status === "SELESAI"
            ? new Date()
            : undefined,
      };

      const updatedTicket = await this.repo.updateTicket(id, updateData, tx);

      if (input.status === "PROSES") {
        await this.repo.updateAsset(
          ticket.assetId,
          { status: "DALAM_PERBAIKAN" },
          tx,
        );
      } else if (input.status === "SELESAI") {
        await this.repo.updateAsset(
          ticket.assetId,
          { status: "TERSEDIA", condition: "BAIK" },
          tx,
        );
      } else if (input.status === "DITOLAK") {
        const asset = await this.repo.findAssetById(ticket.assetId);
        if (asset && asset.status === "DALAM_PERBAIKAN") {
          await this.repo.updateAsset(ticket.assetId, { status: "TERSEDIA" }, tx);
        }
      }

      return updatedTicket!;
    });
  }

  // --- Stats ---
  async getStats(): Promise<FacilityStats> {
    return this.repo.getStats();
  }
}
