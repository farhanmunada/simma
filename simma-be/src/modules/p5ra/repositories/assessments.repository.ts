import { eq, and, sql, inArray, asc } from "drizzle-orm";
import { getDb } from "../../../core/database/client.js";
import {
  p5raProjects,
  p5raProjectClassrooms,
  p5raProjectTargets,
  p5raAssessments,
  p5raStudentNotes,
  classrooms,
  students,
  classStudents,
  institutions,
  academicYears,
  semesters,
  type P5raAssessment,
  type P5raStudentNote,
  type Classroom,
  type Student,
} from "../../../db/schema/index.js";
import type { StudentP5raReportData } from "../p5ra.types.js";
import type { BatchP5raAssessmentItemInput } from "../p5ra.schema.js";

export class AssessmentsRepository {
  async listStudentsForProject(
    projectId: string,
    classroomId?: string,
  ): Promise<Array<{ student: Student; classroom: Classroom }>> {
    const db = getDb();
    const conditions = [eq(p5raProjectClassrooms.projectId, projectId)];
    if (classroomId) {
      conditions.push(eq(p5raProjectClassrooms.classroomId, classroomId));
    }

    const rows = await db
      .select({
        student: students,
        classroom: classrooms,
      })
      .from(p5raProjectClassrooms)
      .innerJoin(classrooms, eq(p5raProjectClassrooms.classroomId, classrooms.id))
      .innerJoin(classStudents, eq(classrooms.id, classStudents.classroomId))
      .innerJoin(students, eq(classStudents.studentId, students.id))
      .where(and(...conditions))
      .orderBy(asc(classrooms.name), asc(students.fullName));

    return rows;
  }

  async listAssessments(
    projectId: string,
    classroomId?: string,
  ): Promise<P5raAssessment[]> {
    const db = getDb();
    if (!classroomId) {
      return await db
        .select()
        .from(p5raAssessments)
        .where(eq(p5raAssessments.projectId, projectId));
    }

    const studentRows = await this.listStudentsForProject(projectId, classroomId);
    const studentIds = studentRows.map((r) => r.student.id);
    if (studentIds.length === 0) return [];

    return await db
      .select()
      .from(p5raAssessments)
      .where(
        and(
          eq(p5raAssessments.projectId, projectId),
          inArray(p5raAssessments.studentId, studentIds),
        ),
      );
  }

  async batchUpsertAssessments(
    projectId: string,
    items: BatchP5raAssessmentItemInput[],
    assessedBy?: string,
  ): Promise<P5raAssessment[]> {
    const db = getDb();
    if (items.length === 0) return [];

    return await db.transaction(async (tx) => {
      const now = new Date();
      const rows: P5raAssessment[] = [];
      for (const item of items) {
        const [upserted] = await tx
          .insert(p5raAssessments)
          .values({
            projectId,
            targetId: item.targetId,
            studentId: item.studentId,
            predicate: item.predicate,
            notes: item.notes ?? null,
            assessedBy: assessedBy ?? null,
            assessedAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [
              p5raAssessments.projectId,
              p5raAssessments.targetId,
              p5raAssessments.studentId,
            ],
            set: {
              predicate: sql`excluded.predicate`,
              notes: sql`excluded.notes`,
              assessedBy: assessedBy ?? null,
              assessedAt: now,
              updatedAt: now,
            },
          })
          .returning();
        rows.push(upserted);
      }
      return rows;
    });
  }

  async getStudentNotes(
    projectId: string,
    studentId: string,
  ): Promise<P5raStudentNote | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(p5raStudentNotes)
      .where(
        and(
          eq(p5raStudentNotes.projectId, projectId),
          eq(p5raStudentNotes.studentId, studentId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async upsertStudentNotes(
    projectId: string,
    studentId: string,
    processNotes: string,
    userId?: string,
  ): Promise<P5raStudentNote> {
    const db = getDb();
    const now = new Date();
    const [row] = await db
      .insert(p5raStudentNotes)
      .values({
        projectId,
        studentId,
        processNotes,
        updatedBy: userId ?? null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [p5raStudentNotes.projectId, p5raStudentNotes.studentId],
        set: {
          processNotes: sql`excluded.process_notes`,
          updatedBy: userId ?? null,
          updatedAt: now,
        },
      })
      .returning();
    return row;
  }

  async getStudentReportData(
    projectId: string,
    studentId: string,
  ): Promise<StudentP5raReportData | null> {
    const db = getDb();
    const [project] = await db
      .select()
      .from(p5raProjects)
      .where(eq(p5raProjects.id, projectId))
      .limit(1);
    if (!project) return null;

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);
    if (!student) return null;

    const [academicYear] = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, project.academicYearId))
      .limit(1);

    const [semester] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, project.semesterId))
      .limit(1);

    const [institution] = await db.select().from(institutions).limit(1);

    const [classStudentRow] = await db
      .select({ classroom: classrooms })
      .from(classStudents)
      .innerJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(eq(classStudents.studentId, studentId))
      .limit(1);

    const targets = await db
      .select()
      .from(p5raProjectTargets)
      .where(eq(p5raProjectTargets.projectId, projectId))
      .orderBy(asc(p5raProjectTargets.orderIndex), asc(p5raProjectTargets.createdAt));

    const assessments = await db
      .select()
      .from(p5raAssessments)
      .where(
        and(
          eq(p5raAssessments.projectId, projectId),
          eq(p5raAssessments.studentId, studentId),
        ),
      );

    const assessmentMap = new Map(assessments.map((a) => [a.targetId, a]));
    const notes = await this.getStudentNotes(projectId, studentId);

    return {
      institution: institution ?? {
        id: "00000000-0000-0000-0000-000000000000",
        name: "Madrasah Aliyah Negeri",
        nsm: "131132010001",
        npsn: "20100001",
        status: "negeri",
        address: "Jl. Pendidikan No. 1",
        logoPath: null,
        emisData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      academicYear: academicYear ?? {
        id: project.academicYearId,
        name: "2024/2025",
        startDate: "2024-07-01",
        endDate: "2025-06-30",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      semester: semester ?? {
        id: project.semesterId,
        academicYearId: project.academicYearId,
        type: 1,
        isActive: true,
        startDate: "2024-07-01",
        endDate: "2024-12-31",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      student,
      classroom: classStudentRow?.classroom ?? {
        id: "00000000-0000-0000-0000-000000000000",
        semesterId: project.semesterId,
        name: "Kelas X-1",
        gradeLevel: 10,
        homeroomTeacherId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      project,
      targetsWithAssessment: targets.map((t) => ({
        target: t,
        assessment: assessmentMap.get(t.id) ?? null,
      })),
      processNotes: notes,
      dateGenerated: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }
}

export const assessmentsRepository = new AssessmentsRepository();
