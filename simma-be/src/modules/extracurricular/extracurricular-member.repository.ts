import { eq, and, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  extracurriculars,
  extracurricularMembers,
  extracurricularGrades,
  students,
  academicYears,
} from "../../db/schema/index.js";
import type {
  ExtracurricularMemberEnriched,
  ExtracurricularGradeEnriched,
  NewExtracurricularMemberRow,
  NewExtracurricularGradeRow,
} from "./extracurricular.types.js";
import type {
  ExtracurricularMemberQueryInput,
  ExtracurricularGradeQueryInput,
} from "./extracurricular.schema.js";

export class ExtracurricularMemberRepository {
  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {}

  async findMembers(filter?: ExtracurricularMemberQueryInput): Promise<ExtracurricularMemberEnriched[]> {
    const conditions = [];
    if (filter?.extracurricularId) conditions.push(eq(extracurricularMembers.extracurricularId, filter.extracurricularId));
    if (filter?.studentId) conditions.push(eq(extracurricularMembers.studentId, filter.studentId));
    if (filter?.academicYearId) conditions.push(eq(extracurricularMembers.academicYearId, filter.academicYearId));
    if (filter?.semester) conditions.push(eq(extracurricularMembers.semester, filter.semester));
    if (filter?.status) conditions.push(eq(extracurricularMembers.status, filter.status));

    const rows = await this.db
      .select({
        id: extracurricularMembers.id,
        extracurricularId: extracurricularMembers.extracurricularId,
        studentId: extracurricularMembers.studentId,
        academicYearId: extracurricularMembers.academicYearId,
        semester: extracurricularMembers.semester,
        role: extracurricularMembers.role,
        joinedDate: extracurricularMembers.joinedDate,
        status: extracurricularMembers.status,
        createdAt: extracurricularMembers.createdAt,
        updatedAt: extracurricularMembers.updatedAt,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
        extracurricularName: extracurriculars.name,
        extracurricularCategory: extracurriculars.category,
        academicYearName: academicYears.name,
        gradeScore: extracurricularGrades.score,
        gradeNotes: extracurricularGrades.notes,
      })
      .from(extracurricularMembers)
      .innerJoin(students, eq(extracurricularMembers.studentId, students.id))
      .innerJoin(extracurriculars, eq(extracurricularMembers.extracurricularId, extracurriculars.id))
      .innerJoin(academicYears, eq(extracurricularMembers.academicYearId, academicYears.id))
      .leftJoin(
        extracurricularGrades,
        and(
          eq(extracurricularGrades.extracurricularMemberId, extracurricularMembers.id),
          eq(extracurricularGrades.academicYearId, extracurricularMembers.academicYearId),
          eq(extracurricularGrades.semester, extracurricularMembers.semester)
        )
      )
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(students.fullName);

    return rows;
  }

  async findMemberById(id: string) {
    const [row] = await this.db
      .select()
      .from(extracurricularMembers)
      .where(eq(extracurricularMembers.id, id));
    return row;
  }

  async findMemberByStudentAndPeriod(
    studentId: string,
    extracurricularId: string,
    academicYearId: string,
    semester: string
  ) {
    const [row] = await this.db
      .select()
      .from(extracurricularMembers)
      .where(
        and(
          eq(extracurricularMembers.studentId, studentId),
          eq(extracurricularMembers.extracurricularId, extracurricularId),
          eq(extracurricularMembers.academicYearId, academicYearId),
          eq(extracurricularMembers.semester, semester)
        )
      );
    return row;
  }

  async countStudentActiveEkskul(studentId: string, academicYearId: string, semester: string): Promise<number> {
    const [res] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(extracurricularMembers)
      .where(
        and(
          eq(extracurricularMembers.studentId, studentId),
          eq(extracurricularMembers.academicYearId, academicYearId),
          eq(extracurricularMembers.semester, semester),
          eq(extracurricularMembers.status, "ACTIVE")
        )
      );
    return res?.count ?? 0;
  }

  async countMembers(extracurricularId: string, academicYearId: string, semester: string): Promise<number> {
    const [res] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(extracurricularMembers)
      .where(
        and(
          eq(extracurricularMembers.extracurricularId, extracurricularId),
          eq(extracurricularMembers.academicYearId, academicYearId),
          eq(extracurricularMembers.semester, semester),
          eq(extracurricularMembers.status, "ACTIVE")
        )
      );
    return res?.count ?? 0;
  }

  async createMember(data: NewExtracurricularMemberRow) {
    const [created] = await this.db.insert(extracurricularMembers).values(data).returning();
    return created;
  }

  async updateMember(id: string, data: Partial<NewExtracurricularMemberRow>) {
    const [updated] = await this.db
      .update(extracurricularMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(extracurricularMembers.id, id))
      .returning();
    return updated;
  }

  async deleteMember(id: string): Promise<boolean> {
    const result = await this.db.delete(extracurricularMembers).where(eq(extracurricularMembers.id, id));
    return Boolean(result);
  }

  async findGrades(filter?: ExtracurricularGradeQueryInput): Promise<ExtracurricularGradeEnriched[]> {
    const conditions = [];
    if (filter?.extracurricularId) conditions.push(eq(extracurricularMembers.extracurricularId, filter.extracurricularId));
    if (filter?.academicYearId) conditions.push(eq(extracurricularGrades.academicYearId, filter.academicYearId));
    if (filter?.semester) conditions.push(eq(extracurricularGrades.semester, filter.semester));
    if (filter?.studentId) conditions.push(eq(extracurricularMembers.studentId, filter.studentId));

    const rows = await this.db
      .select({
        id: extracurricularGrades.id,
        extracurricularMemberId: extracurricularGrades.extracurricularMemberId,
        academicYearId: extracurricularGrades.academicYearId,
        semester: extracurricularGrades.semester,
        score: extracurricularGrades.score,
        notes: extracurricularGrades.notes,
        createdAt: extracurricularGrades.createdAt,
        updatedAt: extracurricularGrades.updatedAt,
        studentId: extracurricularMembers.studentId,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
        extracurricularId: extracurricularMembers.extracurricularId,
        extracurricularName: extracurriculars.name,
        memberRole: extracurricularMembers.role,
      })
      .from(extracurricularGrades)
      .innerJoin(extracurricularMembers, eq(extracurricularGrades.extracurricularMemberId, extracurricularMembers.id))
      .innerJoin(students, eq(extracurricularMembers.studentId, students.id))
      .innerJoin(extracurriculars, eq(extracurricularMembers.extracurricularId, extracurriculars.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(students.fullName);

    return rows;
  }

  async findStudentGradesForRdm(studentId: string, academicYearId?: string, semester?: string) {
    const conditions = [eq(extracurricularMembers.studentId, studentId)];
    if (academicYearId) conditions.push(eq(extracurricularGrades.academicYearId, academicYearId));
    if (semester) conditions.push(eq(extracurricularGrades.semester, semester));

    const rows = await this.db
      .select({
        id: extracurricularGrades.id,
        extracurricularName: extracurriculars.name,
        category: extracurriculars.category,
        score: extracurricularGrades.score,
        notes: extracurricularGrades.notes,
        semester: extracurricularGrades.semester,
      })
      .from(extracurricularGrades)
      .innerJoin(extracurricularMembers, eq(extracurricularGrades.extracurricularMemberId, extracurricularMembers.id))
      .innerJoin(extracurriculars, eq(extracurricularMembers.extracurricularId, extracurriculars.id))
      .where(and(...conditions));

    return rows;
  }

  async upsertGrade(data: NewExtracurricularGradeRow) {
    const [existing] = await this.db
      .select()
      .from(extracurricularGrades)
      .where(
        and(
          eq(extracurricularGrades.extracurricularMemberId, data.extracurricularMemberId),
          eq(extracurricularGrades.academicYearId, data.academicYearId),
          eq(extracurricularGrades.semester, data.semester)
        )
      );

    if (existing) {
      const [updated] = await this.db
        .update(extracurricularGrades)
        .set({
          score: data.score,
          notes: data.notes,
          updatedAt: new Date(),
        })
        .where(eq(extracurricularGrades.id, existing.id))
        .returning();
      return updated;
    }

    const [inserted] = await this.db.insert(extracurricularGrades).values(data).returning();
    return inserted;
  }

  async batchUpsertGrades(items: NewExtracurricularGradeRow[]) {
    return await this.db.transaction(async (tx) => {
      const results = [];
      for (const item of items) {
        const [existing] = await tx
          .select()
          .from(extracurricularGrades)
          .where(
            and(
              eq(extracurricularGrades.extracurricularMemberId, item.extracurricularMemberId),
              eq(extracurricularGrades.academicYearId, item.academicYearId),
              eq(extracurricularGrades.semester, item.semester)
            )
          );

        if (existing) {
          const [updated] = await tx
            .update(extracurricularGrades)
            .set({ score: item.score, notes: item.notes, updatedAt: new Date() })
            .where(eq(extracurricularGrades.id, existing.id))
            .returning();
          results.push(updated);
        } else {
          const [inserted] = await tx.insert(extracurricularGrades).values(item).returning();
          results.push(inserted);
        }
      }
      return results;
    });
  }
}

export const extracurricularMemberRepository = new ExtracurricularMemberRepository();
