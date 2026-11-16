import { eq, and, ilike, count, desc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { academicYears } from "../../../db/schema/setup";
import type { AcademicYear, NewAcademicYear } from "../setup.types.js";

export class AcademicYearsRepository {
  async findAcademicYears(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: AcademicYear[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.search) {
      conditions.push(ilike(academicYears.name, `%${params.search}%`));
    }
    if (params.isActive !== undefined) {
      conditions.push(eq(academicYears.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(academicYears)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(academicYears)
      .where(whereClause)
      .orderBy(desc(academicYears.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findAcademicYearById(id: string): Promise<AcademicYear | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, id))
      .limit(1);
    return row ?? null;
  }

  async createAcademicYear(data: NewAcademicYear): Promise<AcademicYear> {
    const db = getDb();
    if (data.isActive) {
      return await db.transaction(async (tx) => {
        await tx
          .update(academicYears)
          .set({ isActive: false, updatedAt: new Date() });
        const [row] = await tx.insert(academicYears).values(data).returning();
        return row;
      });
    }
    const [row] = await db.insert(academicYears).values(data).returning();
    return row;
  }

  async updateAcademicYear(
    id: string,
    data: Partial<NewAcademicYear>,
  ): Promise<AcademicYear | null> {
    const db = getDb();
    if (data.isActive) {
      return await db.transaction(async (tx) => {
        await tx
          .update(academicYears)
          .set({ isActive: false, updatedAt: new Date() });
        const [row] = await tx
          .update(academicYears)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(academicYears.id, id))
          .returning();
        return row ?? null;
      });
    }
    const [row] = await db
      .update(academicYears)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return row ?? null;
  }

  async deleteAcademicYear(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(academicYears)
      .where(eq(academicYears.id, id))
      .returning();
    return result.length > 0;
  }

  async setActiveAcademicYear(id: string): Promise<AcademicYear | null> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      await tx
        .update(academicYears)
        .set({ isActive: false, updatedAt: new Date() });
      const [row] = await tx
        .update(academicYears)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(academicYears.id, id))
        .returning();
      return row ?? null;
    });
  }
}

export const academicYearsRepository = new AcademicYearsRepository();
