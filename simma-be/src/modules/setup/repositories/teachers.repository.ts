import { eq, and, or, ilike, count, desc, isNull } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { teachers } from "../../../db/schema/setup";
import type { Teacher, NewTeacher } from "../setup.types.js";

export class TeachersRepository {
  async findTeachers(params: {
    page: number;
    limit: number;
    search?: string;
    employmentType?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: Teacher[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (!params.includeDeleted) {
      conditions.push(isNull(teachers.deletedAt));
    }
    if (params.employmentType) {
      conditions.push(eq(teachers.employmentType, params.employmentType));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(teachers.fullName, `%${params.search}%`),
          ilike(teachers.nik, `%${params.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(teachers)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(teachers)
      .where(whereClause)
      .orderBy(desc(teachers.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findTeacherById(
    id: string,
    includeDeleted = false,
  ): Promise<Teacher | null> {
    const db = getDb();
    const conditions = [eq(teachers.id, id)];
    if (!includeDeleted) {
      conditions.push(isNull(teachers.deletedAt));
    }
    const [row] = await db
      .select()
      .from(teachers)
      .where(and(...conditions))
      .limit(1);
    return row ?? null;
  }

  async findTeacherByNik(nik: string): Promise<Teacher | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.nik, nik))
      .limit(1);
    return row ?? null;
  }

  async createTeacher(data: NewTeacher): Promise<Teacher> {
    const db = getDb();
    const [row] = await db.insert(teachers).values(data).returning();
    return row;
  }

  async updateTeacher(
    id: string,
    data: Partial<NewTeacher>,
  ): Promise<Teacher | null> {
    const db = getDb();
    const [row] = await db
      .update(teachers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return row ?? null;
  }

  async softDeleteTeacher(id: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .update(teachers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return Boolean(row);
  }
}

export const teachersRepository = new TeachersRepository();
