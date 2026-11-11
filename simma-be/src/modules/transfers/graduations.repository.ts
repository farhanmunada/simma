import { eq, and, sql, desc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import { studentGraduations } from "../../db/schema/transfers.js";
import { students } from "../../db/schema/students.js";
import { classrooms, academicYears } from "../../db/schema/setup.js";
import type { GraduationWithDetails } from "./transfers.types.js";
import type { FilterGraduationInput } from "./transfers.schema.js";

export class GraduationsRepository {
  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {}

  async findGraduations(filter: FilterGraduationInput): Promise<{ items: GraduationWithDetails[]; total: number }> {
    const conditions = [];
    if (filter.academicYearId) conditions.push(eq(studentGraduations.academicYearId, filter.academicYearId));
    if (filter.classroomId) conditions.push(eq(studentGraduations.classroomId, filter.classroomId));
    if (filter.status) conditions.push(eq(studentGraduations.graduationStatus, filter.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filter.page - 1) * filter.limit;

    const rows = await this.db
      .select({
        graduation: studentGraduations,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
        classroomName: classrooms.name,
        academicYearName: academicYears.name,
      })
      .from(studentGraduations)
      .leftJoin(students, eq(studentGraduations.studentId, students.id))
      .leftJoin(classrooms, eq(studentGraduations.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(studentGraduations.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(desc(studentGraduations.createdAt))
      .limit(filter.limit)
      .offset(offset);

    const items: GraduationWithDetails[] = rows.map((r: any) => ({
      ...r.graduation,
      studentName: r.studentName ?? "Tanpa Nama",
      studentNis: r.studentNis,
      studentNisn: r.studentNisn,
      classroomName: r.classroomName,
      academicYearName: r.academicYearName,
    }));

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentGraduations)
      .where(whereClause);

    return { items, total: countResult?.count ?? 0 };
  }

  async processGraduationBatch(
    academicYearId: string,
    classroomId: string | null | undefined,
    graduationDate: string,
    items: Array<{
      studentId: string;
      graduationStatus: "lulus" | "tidak_lulus" | "ditunda";
      certificateNumber?: string | null;
      sklNumber?: string | null;
      notes?: string | null;
    }>,
    createdById: string
  ) {
    return await this.db.transaction(async (tx: any) => {
      const results = [];
      for (const item of items) {
        const [grad] = await tx
          .insert(studentGraduations)
          .values({
            academicYearId,
            studentId: item.studentId,
            classroomId: classroomId ?? null,
            graduationDate,
            graduationStatus: item.graduationStatus,
            certificateNumber: item.certificateNumber,
            sklNumber: item.sklNumber,
            notes: item.notes,
            createdById,
          })
          .onConflictDoUpdate({
            target: [studentGraduations.academicYearId, studentGraduations.studentId],
            set: {
              graduationStatus: item.graduationStatus,
              graduationDate,
              certificateNumber: item.certificateNumber,
              sklNumber: item.sklNumber,
              notes: item.notes,
              updatedAt: new Date(),
            },
          })
          .returning();

        if (item.graduationStatus === "lulus") {
          await tx
            .update(students)
            .set({ status: "lulus", updatedAt: new Date() })
            .where(eq(students.id, item.studentId));
        }

        results.push(grad);
      }
      return results;
    });
  }

  async getGraduationStats(): Promise<number> {
    const [graduated] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentGraduations)
      .where(eq(studentGraduations.graduationStatus, "lulus"));

    return graduated?.count ?? 0;
  }
}

export const graduationsRepository = new GraduationsRepository();
