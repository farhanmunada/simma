import { eq, and, desc, count } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import {
  assessments,
  studentGrades,
  semesterGrades,
} from "../../../db/schema/grades.js";
import type { SemesterGrade, NewSemesterGrade } from "../grades.types.js";
import type { SemesterGradeQueryParams } from "../grades.schema.js";

export class SemesterGradesRepository {
  async findSemesterGradeById(id: string): Promise<SemesterGrade | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(semesterGrades)
      .where(eq(semesterGrades.id, id))
      .limit(1);
    return row ?? null;
  }

  async createSemesterGrade(data: NewSemesterGrade): Promise<SemesterGrade> {
    const db = getDb();
    const [row] = await db.insert(semesterGrades).values(data).returning();
    return row;
  }

  async upsertSemesterGrade(data: NewSemesterGrade): Promise<SemesterGrade> {
    const db = getDb();
    const [row] = await db
      .insert(semesterGrades)
      .values(data)
      .onConflictDoUpdate({
        target: [
          semesterGrades.studentId,
          semesterGrades.classroomId,
          semesterGrades.subjectId,
          semesterGrades.semesterId,
        ],
        set: {
          finalScore: data.finalScore,
          letterGrade: data.letterGrade,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async batchUpsertSemesterGrades(items: NewSemesterGrade[]): Promise<SemesterGrade[]> {
    if (items.length === 0) return [];
    const db = getDb();
    return await db.transaction(async (tx) => {
      const results: SemesterGrade[] = [];
      for (const item of items) {
        const [row] = await tx
          .insert(semesterGrades)
          .values(item)
          .onConflictDoUpdate({
            target: [
              semesterGrades.studentId,
              semesterGrades.classroomId,
              semesterGrades.subjectId,
              semesterGrades.semesterId,
            ],
            set: {
              finalScore: item.finalScore,
              letterGrade: item.letterGrade,
              updatedAt: new Date(),
            },
          })
          .returning();
        results.push(row);
      }
      return results;
    });
  }

  async updateSemesterGrade(
    id: string,
    data: Partial<NewSemesterGrade>,
  ): Promise<SemesterGrade | null> {
    const db = getDb();
    const [row] = await db
      .update(semesterGrades)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(semesterGrades.id, id))
      .returning();
    return row ?? null;
  }

  async deleteSemesterGrade(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(semesterGrades)
      .where(eq(semesterGrades.id, id))
      .returning();
    return result.length > 0;
  }

  async findSemesterGrades(
    params: SemesterGradeQueryParams,
  ): Promise<{ data: SemesterGrade[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (params.studentId) {
      conditions.push(eq(semesterGrades.studentId, params.studentId));
    }
    if (params.classroomId) {
      conditions.push(eq(semesterGrades.classroomId, params.classroomId));
    }
    if (params.subjectId) {
      conditions.push(eq(semesterGrades.subjectId, params.subjectId));
    }
    if (params.semesterId) {
      conditions.push(eq(semesterGrades.semesterId, params.semesterId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(semesterGrades)
      .where(whereClause);
    const total = Number(totalResult?.value ?? 0);

    const data = await db
      .select()
      .from(semesterGrades)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(semesterGrades.createdAt));

    return { data, total };
  }

  async findAssessmentScoresForClassroomSubject(
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<
    Array<{
      studentId: string;
      score: number;
      maxScore: number;
      weight: number;
    }>
  > {
    const db = getDb();
    const rows = await db
      .select({
        studentId: studentGrades.studentId,
        score: studentGrades.score,
        maxScore: assessments.maxScore,
        weight: assessments.weight,
      })
      .from(studentGrades)
      .innerJoin(assessments, eq(studentGrades.assessmentId, assessments.id))
      .where(
        and(
          eq(assessments.classroomId, classroomId),
          eq(assessments.subjectId, subjectId),
          eq(assessments.semesterId, semesterId),
        ),
      );

    return rows;
  }
}

export const semesterGradesRepository = new SemesterGradesRepository();
