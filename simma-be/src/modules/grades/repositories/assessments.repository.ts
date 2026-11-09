import { eq, and, desc, count } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import { assessments, studentGrades } from "../../../db/schema/grades.js";
import type { Assessment, NewAssessment } from "../grades.types.js";
import type { AssessmentQueryParams } from "../grades.schema.js";

export class AssessmentsRepository {
  async findAssessmentById(id: string): Promise<Assessment | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
      .limit(1);
    return row ?? null;
  }

  async createAssessment(data: NewAssessment): Promise<Assessment> {
    const db = getDb();
    const [row] = await db.insert(assessments).values(data).returning();
    return row;
  }

  async updateAssessment(
    id: string,
    data: Partial<NewAssessment>,
  ): Promise<Assessment | null> {
    const db = getDb();
    const [row] = await db
      .update(assessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return row ?? null;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(assessments)
      .where(eq(assessments.id, id))
      .returning();
    return result.length > 0;
  }

  async hasGradesForAssessment(assessmentId: string): Promise<boolean> {
    const db = getDb();
    const [res] = await db
      .select({ value: count() })
      .from(studentGrades)
      .where(eq(studentGrades.assessmentId, assessmentId));
    return Number(res?.value ?? 0) > 0;
  }

  async findAssessments(
    params: AssessmentQueryParams,
  ): Promise<{ data: Assessment[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.subjectId) {
      conditions.push(eq(assessments.subjectId, params.subjectId));
    }
    if (params.classroomId) {
      conditions.push(eq(assessments.classroomId, params.classroomId));
    }
    if (params.teacherId) {
      conditions.push(eq(assessments.teacherId, params.teacherId));
    }
    if (params.academicYearId) {
      conditions.push(eq(assessments.academicYearId, params.academicYearId));
    }
    if (params.semesterId) {
      conditions.push(eq(assessments.semesterId, params.semesterId));
    }
    if (params.type) {
      conditions.push(eq(assessments.type, params.type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(assessments)
      .where(whereClause);
    const total = Number(totalResult?.value ?? 0);

    const data = await db
      .select()
      .from(assessments)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(assessments.createdAt));

    return { data, total };
  }
}

export const assessmentsRepository = new AssessmentsRepository();
