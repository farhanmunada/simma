import { eq, and, desc, gte, lte, count } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  tahfidzRecords,
  tasmiExams,
} from "../../db/schema/tahfidz.js";
import type {
  TahfidzRecord,
  NewTahfidzRecord,
  TasmiExam,
  NewTasmiExam,
} from "./tahfidz.types.js";
import type { TahfidzQueryParams, TasmiQueryParams } from "./tahfidz.schema.js";

export class TahfidzRepository {
  // --- Tahfidz Records (Setoran) ---

  async findRecordById(id: string): Promise<TahfidzRecord | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tahfidzRecords)
      .where(eq(tahfidzRecords.id, id))
      .limit(1);
    return row ?? null;
  }

  async createRecord(data: NewTahfidzRecord): Promise<TahfidzRecord> {
    const db = getDb();
    const [row] = await db.insert(tahfidzRecords).values(data).returning();
    return row;
  }

  async updateRecord(
    id: string,
    data: Partial<NewTahfidzRecord>,
  ): Promise<TahfidzRecord | null> {
    const db = getDb();
    const [row] = await db
      .update(tahfidzRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tahfidzRecords.id, id))
      .returning();
    return row ?? null;
  }

  async deleteRecord(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(tahfidzRecords)
      .where(eq(tahfidzRecords.id, id))
      .returning();
    return result.length > 0;
  }

  async findRecords(params: TahfidzQueryParams): Promise<{ data: TahfidzRecord[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.studentId) {
      conditions.push(eq(tahfidzRecords.studentId, params.studentId));
    }
    if (params.teacherId) {
      conditions.push(eq(tahfidzRecords.teacherId, params.teacherId));
    }
    if (params.type) {
      conditions.push(eq(tahfidzRecords.type, params.type));
    }
    if (params.juz !== undefined) {
      conditions.push(eq(tahfidzRecords.juz, params.juz));
    }
    if (params.surah !== undefined) {
      conditions.push(eq(tahfidzRecords.surah, params.surah));
    }
    if (params.status) {
      conditions.push(eq(tahfidzRecords.status, params.status));
    }
    if (params.startDate) {
      conditions.push(gte(tahfidzRecords.date, params.startDate));
    }
    if (params.endDate) {
      conditions.push(lte(tahfidzRecords.date, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(tahfidzRecords)
      .where(whereClause);
    const total = Number(totalResult?.value ?? 0);

    const data = await db
      .select()
      .from(tahfidzRecords)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tahfidzRecords.date), desc(tahfidzRecords.createdAt));

    return { data, total };
  }

  async findRecordsByStudentId(studentId: string): Promise<TahfidzRecord[]> {
    const db = getDb();
    return db
      .select()
      .from(tahfidzRecords)
      .where(eq(tahfidzRecords.studentId, studentId))
      .orderBy(desc(tahfidzRecords.date), desc(tahfidzRecords.createdAt));
  }

  // --- Tasmi' Exams ---

  async findTasmiExamById(id: string): Promise<TasmiExam | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tasmiExams)
      .where(eq(tasmiExams.id, id))
      .limit(1);
    return row ?? null;
  }

  async createTasmiExam(data: NewTasmiExam): Promise<TasmiExam> {
    const db = getDb();
    const [row] = await db.insert(tasmiExams).values(data).returning();
    return row;
  }

  async updateTasmiExam(
    id: string,
    data: Partial<NewTasmiExam>,
  ): Promise<TasmiExam | null> {
    const db = getDb();
    const [row] = await db
      .update(tasmiExams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasmiExams.id, id))
      .returning();
    return row ?? null;
  }

  async deleteTasmiExam(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(tasmiExams)
      .where(eq(tasmiExams.id, id))
      .returning();
    return result.length > 0;
  }

  async findTasmiExams(params: TasmiQueryParams): Promise<{ data: TasmiExam[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.studentId) {
      conditions.push(eq(tasmiExams.studentId, params.studentId));
    }
    if (params.examinerId) {
      conditions.push(eq(tasmiExams.examinerId, params.examinerId));
    }
    if (params.juz !== undefined) {
      conditions.push(eq(tasmiExams.juz, params.juz));
    }
    if (params.status) {
      conditions.push(eq(tasmiExams.status, params.status));
    }
    if (params.startDate) {
      conditions.push(gte(tasmiExams.examDate, params.startDate));
    }
    if (params.endDate) {
      conditions.push(lte(tasmiExams.examDate, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(tasmiExams)
      .where(whereClause);
    const total = Number(totalResult?.value ?? 0);

    const data = await db
      .select()
      .from(tasmiExams)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tasmiExams.examDate), desc(tasmiExams.createdAt));

    return { data, total };
  }

  async findTasmiExamsByStudentId(studentId: string): Promise<TasmiExam[]> {
    const db = getDb();
    return db
      .select()
      .from(tasmiExams)
      .where(eq(tasmiExams.studentId, studentId))
      .orderBy(desc(tasmiExams.examDate), desc(tasmiExams.createdAt));
  }
}

export const tahfidzRepository = new TahfidzRepository();
