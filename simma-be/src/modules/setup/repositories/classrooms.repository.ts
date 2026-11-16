import { eq, and, ilike, count, desc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { classrooms } from "../../../db/schema/setup";
import type { Classroom, NewClassroom } from "../setup.types.js";

export class ClassroomsRepository {
  async findClassrooms(params: {
    page: number;
    limit: number;
    semesterId?: string;
    gradeLevel?: number;
    search?: string;
  }): Promise<{ data: Classroom[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.semesterId) {
      conditions.push(eq(classrooms.semesterId, params.semesterId));
    }
    if (params.gradeLevel) {
      conditions.push(eq(classrooms.gradeLevel, params.gradeLevel));
    }
    if (params.search) {
      conditions.push(ilike(classrooms.name, `%${params.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(classrooms)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(classrooms)
      .where(whereClause)
      .orderBy(desc(classrooms.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findClassroomById(id: string): Promise<Classroom | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.id, id))
      .limit(1);
    return row ?? null;
  }

  async createClassroom(data: NewClassroom): Promise<Classroom> {
    const db = getDb();
    const [row] = await db.insert(classrooms).values(data).returning();
    return row;
  }

  async updateClassroom(
    id: string,
    data: Partial<NewClassroom>,
  ): Promise<Classroom | null> {
    const db = getDb();
    const [row] = await db
      .update(classrooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classrooms.id, id))
      .returning();
    return row ?? null;
  }

  async deleteClassroom(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(classrooms)
      .where(eq(classrooms.id, id))
      .returning();
    return result.length > 0;
  }
}

export const classroomsRepository = new ClassroomsRepository();
