import { eq, and, count, desc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { semesters } from "../../../db/schema/setup";
import type { Semester, NewSemester } from "../setup.types.js";

export class SemestersRepository {
  async findSemesters(params: {
    page: number;
    limit: number;
    academicYearId?: string;
    isActive?: boolean;
  }): Promise<{ data: Semester[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.academicYearId) {
      conditions.push(eq(semesters.academicYearId, params.academicYearId));
    }
    if (params.isActive !== undefined) {
      conditions.push(eq(semesters.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(semesters)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(semesters)
      .where(whereClause)
      .orderBy(desc(semesters.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findSemesterById(id: string): Promise<Semester | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, id))
      .limit(1);
    return row ?? null;
  }

  async createSemester(data: NewSemester): Promise<Semester> {
    const db = getDb();
    if (data.isActive) {
      return await db.transaction(async (tx) => {
        await tx
          .update(semesters)
          .set({ isActive: false, updatedAt: new Date() });
        const [row] = await tx.insert(semesters).values(data).returning();
        return row;
      });
    }
    const [row] = await db.insert(semesters).values(data).returning();
    return row;
  }

  async updateSemester(
    id: string,
    data: Partial<NewSemester>,
  ): Promise<Semester | null> {
    const db = getDb();
    if (data.isActive) {
      return await db.transaction(async (tx) => {
        await tx
          .update(semesters)
          .set({ isActive: false, updatedAt: new Date() });
        const [row] = await tx
          .update(semesters)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(semesters.id, id))
          .returning();
        return row ?? null;
      });
    }
    const [row] = await db
      .update(semesters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(semesters.id, id))
      .returning();
    return row ?? null;
  }

  async deleteSemester(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(semesters)
      .where(eq(semesters.id, id))
      .returning();
    return result.length > 0;
  }

  async setActiveSemester(id: string): Promise<Semester | null> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      await tx
        .update(semesters)
        .set({ isActive: false, updatedAt: new Date() });
      const [row] = await tx
        .update(semesters)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(semesters.id, id))
        .returning();
      return row ?? null;
    });
  }
}

export const semestersRepository = new SemestersRepository();
