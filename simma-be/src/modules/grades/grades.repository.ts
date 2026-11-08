import { eq, and, desc, count, sql } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  assessments,
  studentGrades,
  semesterGrades,
} from "../../db/schema/grades.js";
import type {
  Assessment,
  NewAssessment,
  StudentGrade,
  NewStudentGrade,
  SemesterGrade,
  NewSemesterGrade,
} from "./grades.types.js";
import type {
  AssessmentQueryParams,
  StudentGradeQueryParams,
  SemesterGradeQueryParams,
} from "./grades.schema.js";

export class GradesRepository {
  // --- Assessments ---

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

  // --- Student Grades ---

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

    const rows = await db
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

  // --- Semester Grades ---

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

export const gradesRepository = new GradesRepository();
