import { eq, and, or, ilike, count, desc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { subjects } from "../../../db/schema/setup";
import type { Subject, NewSubject } from "../setup.types.js";

export class SubjectsRepository {
  async findSubjects(params: {
    page: number;
    limit: number;
    phase?: string;
    group?: string;
    search?: string;
  }): Promise<{ data: Subject[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.phase) {
      conditions.push(eq(subjects.phase, params.phase));
    }
    if (params.group) {
      conditions.push(eq(subjects.group, params.group));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(subjects.name, `%${params.search}%`),
          ilike(subjects.code, `%${params.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(subjects)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(subjects)
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);
    return row ?? null;
  }

  async findSubjectByCode(code: string): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, code))
      .limit(1);
    return row ?? null;
  }

  async createSubject(data: NewSubject): Promise<Subject> {
    const db = getDb();
    const [row] = await db.insert(subjects).values(data).returning();
    return row;
  }

  async updateSubject(
    id: string,
    data: Partial<NewSubject>,
  ): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .update(subjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return row ?? null;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();
    return result.length > 0;
  }
}

export const subjectsRepository = new SubjectsRepository();
