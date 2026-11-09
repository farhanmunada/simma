import { eq, and, desc, count, sql } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { studentGrades } from "../../../db/schema/grades.js";
import type { StudentGrade, NewStudentGrade } from "../grades.types.js";
import type { StudentGradeQueryParams } from "../grades.schema.js";

export class StudentGradesRepository {
  async findStudentGradeById(id: string): Promise<StudentGrade | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(studentGrades)
      .where(eq(studentGrades.id, id))
      .limit(1);
    return row ?? null;
  }

  async findStudentGradeByAssessmentAndStudent(
    assessmentId: string,
    studentId: string,
  ): Promise<StudentGrade | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(studentGrades)
      .where(
        and(
          eq(studentGrades.assessmentId, assessmentId),
          eq(studentGrades.studentId, studentId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async createStudentGrade(data: NewStudentGrade): Promise<StudentGrade> {
    const db = getDb();
    const [row] = await db.insert(studentGrades).values(data).returning();
    return row;
  }

  async upsertStudentGrade(data: NewStudentGrade): Promise<StudentGrade> {
    const db = getDb();
    const [row] = await db
      .insert(studentGrades)
      .values(data)
      .onConflictDoUpdate({
        target: [studentGrades.assessmentId, studentGrades.studentId],
        set: {
          score: data.score,
          feedback: data.feedback ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async batchUpsertStudentGrades(
    assessmentId: string,
    items: Array<{ studentId: string; score: number; feedback?: string | null }>,
  ): Promise<StudentGrade[]> {
    const db = getDb();
    const values: NewStudentGrade[] = items.map((item) => ({
      assessmentId,
      studentId: item.studentId,
      score: item.score,
      feedback: item.feedback ?? null,
    }));

    if (values.length === 0) return [];

    return await db.transaction(async (tx) => {
      const rows = await tx
        .insert(studentGrades)
        .values(values)
        .onConflictDoUpdate({
          target: [studentGrades.assessmentId, studentGrades.studentId],
          set: {
            score: sql`excluded.score`,
            feedback: sql`excluded.feedback`,
            updatedAt: new Date(),
          },
        })
        .returning();

      return rows;
    });
  }

  async updateStudentGrade(
    id: string,
    data: Partial<NewStudentGrade>,
  ): Promise<StudentGrade | null> {
    const db = getDb();
    const [row] = await db
      .update(studentGrades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentGrades.id, id))
      .returning();
    return row ?? null;
  }

  async deleteStudentGrade(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(studentGrades)
      .where(eq(studentGrades.id, id))
      .returning();
    return result.length > 0;
  }

  async findStudentGrades(
    params: StudentGradeQueryParams,
  ): Promise<{ data: StudentGrade[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (params.assessmentId) {
      conditions.push(eq(studentGrades.assessmentId, params.assessmentId));
    }
    if (params.studentId) {
      conditions.push(eq(studentGrades.studentId, params.studentId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(studentGrades)
      .where(whereClause);
    const total = Number(totalResult?.value ?? 0);

    const data = await db
      .select()
      .from(studentGrades)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(studentGrades.createdAt));

    return { data, total };
  }

  async findStudentGradesByAssessmentId(
    assessmentId: string,
  ): Promise<StudentGrade[]> {
    const db = getDb();
    return db
      .select()
      .from(studentGrades)
      .where(eq(studentGrades.assessmentId, assessmentId))
      .orderBy(studentGrades.createdAt);
  }
}

export const studentGradesRepository = new StudentGradesRepository();
