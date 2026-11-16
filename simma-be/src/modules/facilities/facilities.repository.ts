import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  facilityAssets,
  facilityLoans,
  facilityMaintenanceTickets,
  users,
} from "../../db/schema/index.js";
import type {
  FacilityAssetRow,
  NewFacilityAssetRow,
  FacilityLoanRow,
  NewFacilityLoanRow,
  FacilityMaintenanceTicketRow,
  NewFacilityMaintenanceTicketRow,
  QueryFacilityAssetsInput,
  FacilityStats,
} from "./facilities.types.js";
import type {
  QueryLoansInput,
  QueryMaintenanceTicketsInput,
} from "./facilities.schema.js";

export class FacilitiesRepository {
  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {}

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  // --- Assets ---
  async findAssets(filters: QueryFacilityAssetsInput): Promise<FacilityAssetRow[]> {
    const conditions = [];

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(facilityAssets.name, term),
          ilike(facilityAssets.code, term),
          ilike(facilityAssets.location, term),
        ),
      );
    }
    if (filters.category) {
      conditions.push(eq(facilityAssets.category, filters.category));
    }
    if (filters.condition) {
      conditions.push(eq(facilityAssets.condition, filters.condition));
    }
    if (filters.status) {
      conditions.push(eq(facilityAssets.status, filters.status));
    }
    if (filters.location) {
      conditions.push(ilike(facilityAssets.location, `%${filters.location}%`));
    }

    return this.db
      .select()
      .from(facilityAssets)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(facilityAssets.createdAt));
  }

  async findAssetById(id: string): Promise<FacilityAssetRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityAssets)
      .where(eq(facilityAssets.id, id));
    return row;
  }

  async findAssetByCode(code: string): Promise<FacilityAssetRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityAssets)
      .where(eq(facilityAssets.code, code));
    return row;
  }

  async findAssetByQrToken(token: string): Promise<FacilityAssetRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityAssets)
      .where(eq(facilityAssets.qrCodeToken, token));
    return row;
  }

  async createAsset(data: NewFacilityAssetRow, txDb?: any): Promise<FacilityAssetRow> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .insert(facilityAssets)
      .values(data)
      .returning();
    return row;
  }

  async updateAsset(
    id: string,
    data: Partial<NewFacilityAssetRow>,
    txDb?: any,
  ): Promise<FacilityAssetRow | undefined> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .update(facilityAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(facilityAssets.id, id))
      .returning();
    return row;
  }

  async deleteAsset(id: string): Promise<boolean> {
    const res = await this.db
      .delete(facilityAssets)
      .where(eq(facilityAssets.id, id))
      .returning();
    return res.length > 0;
  }

  // --- Loans ---
  async findLoans(filters: QueryLoansInput): Promise<FacilityLoanRow[]> {
    const conditions = [];
    if (filters.assetId) {
      conditions.push(eq(facilityLoans.assetId, filters.assetId));
    }
    if (filters.status) {
      conditions.push(eq(facilityLoans.status, filters.status));
    }
    if (filters.borrowerType) {
      conditions.push(eq(facilityLoans.borrowerType, filters.borrowerType));
    }

    return this.db
      .select()
      .from(facilityLoans)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(facilityLoans.createdAt));
  }

  async findLoanById(id: string): Promise<FacilityLoanRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityLoans)
      .where(eq(facilityLoans.id, id));
    return row;
  }

  async findActiveLoanByAssetId(assetId: string): Promise<FacilityLoanRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityLoans)
      .where(
        and(
          eq(facilityLoans.assetId, assetId),
          or(
            eq(facilityLoans.status, "DIPINJAM"),
            eq(facilityLoans.status, "TERLAMBAT"),
          ),
        ),
      );
    return row;
  }

  async createLoan(data: NewFacilityLoanRow, txDb?: any): Promise<FacilityLoanRow> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .insert(facilityLoans)
      .values(data)
      .returning();
    return row;
  }

  async updateLoan(
    id: string,
    data: Partial<NewFacilityLoanRow>,
    txDb?: any,
  ): Promise<FacilityLoanRow | undefined> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .update(facilityLoans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(facilityLoans.id, id))
      .returning();
    return row;
  }

  // --- Maintenance Tickets ---
  async findTickets(
    filters: QueryMaintenanceTicketsInput,
  ): Promise<FacilityMaintenanceTicketRow[]> {
    const conditions = [];
    if (filters.assetId) {
      conditions.push(eq(facilityMaintenanceTickets.assetId, filters.assetId));
    }
    if (filters.status) {
      conditions.push(eq(facilityMaintenanceTickets.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(facilityMaintenanceTickets.priority, filters.priority));
    }

    return this.db
      .select()
      .from(facilityMaintenanceTickets)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(facilityMaintenanceTickets.createdAt));
  }

  async findTicketById(
    id: string,
  ): Promise<FacilityMaintenanceTicketRow | undefined> {
    const [row] = await this.db
      .select()
      .from(facilityMaintenanceTickets)
      .where(eq(facilityMaintenanceTickets.id, id));
    return row;
  }

  async createTicket(
    data: NewFacilityMaintenanceTicketRow,
    txDb?: any,
  ): Promise<FacilityMaintenanceTicketRow> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .insert(facilityMaintenanceTickets)
      .values(data)
      .returning();
    return row;
  }

  async updateTicket(
    id: string,
    data: Partial<NewFacilityMaintenanceTicketRow>,
    txDb?: any,
  ): Promise<FacilityMaintenanceTicketRow | undefined> {
    const dbInstance = txDb || this.db;
    const [row] = await dbInstance
      .update(facilityMaintenanceTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(facilityMaintenanceTickets.id, id))
      .returning();
    return row;
  }

  // --- Aggregations & Stats ---
  async getStats(): Promise<FacilityStats> {
    const assets = await this.db.select().from(facilityAssets);
    const activeLoans = await this.db
      .select()
      .from(facilityLoans)
      .where(
        or(
          eq(facilityLoans.status, "DIPINJAM"),
          eq(facilityLoans.status, "TERLAMBAT"),
        ),
      );
    const pendingTickets = await this.db
      .select()
      .from(facilityMaintenanceTickets)
      .where(
        or(
          eq(facilityMaintenanceTickets.status, "MENUNGGU"),
          eq(facilityMaintenanceTickets.status, "PROSES"),
        ),
      );

    return {
      totalAssets: assets.length,
      availableAssets: assets.filter((a) => a.status === "TERSEDIA").length,
      borrowedAssets: assets.filter((a) => a.status === "DIPINJAM").length,
      underRepairAssets: assets.filter((a) => a.status === "DALAM_PERBAIKAN").length,
      damagedAssets: assets.filter(
        (a) => a.condition === "RUSAK_BERAT" || a.condition === "RUSAK_RINGAN",
      ).length,
      activeLoansCount: activeLoans.length,
      pendingTicketsCount: pendingTickets.length,
    };
  }
}
